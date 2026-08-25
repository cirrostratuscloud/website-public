---
layout: default
title: "Managing Kubernetes Resources on a Private EKS Cluster with Lambda"
date: 2026-08-25
categories: [aws, eks, kubernetes, terraform, lambda]
description: "A Terraform module that uses a Lambda function to apply Kubernetes manifests and Helm charts to a private EKS cluster — no internet access, no CI/CD pipeline required."
excerpt: "Private EKS clusters are great for security, but managing resources on them can be painful. This Terraform module deploys a Lambda that runs kubectl and helm inside your VPC, giving you full CRUD lifecycle managed entirely through Terraform."
slug: managing-kubernetes-resources-on-private-eks-with-lambda
---

Private EKS clusters are great for security; no public API endpoint means a significantly reduced attack surface. But they come with a trade-off: getting things onto the cluster becomes harder. You either need a bastion host, a VPN, or some CI/CD pipeline running inside the VPC.

What if you could manage Kubernetes resources the same way you manage the rest of your infrastructure — through Terraform — without any of that?

I built a module that does exactly this. The full source is available on GitHub: [private-eks-management-with-terraform-lambda-invoke](https://github.com/cirrostratuscloud/private-eks-management-with-terraform-lambda-invoke).

## The idea

The `kube_crud` module deploys a Lambda function inside your VPC that bundles `kubectl` and `helm` binaries. It authenticates to the EKS API using an IAM role with cluster-admin access (via EKS access entries), generates a short-lived bearer token through STS, and runs commands against the private endpoint.

Because the Lambda runs inside the VPC and uses VPC endpoints for EKS and STS, it works in fully air-gapped environments with no internet access.

```
┌─────────────┐       ┌───────────────────┐       ┌─────────────────┐
│  Terraform  │──────▶│  Lambda (VPC)     │──────▶│  EKS Private    │
│  Invocation │       │  kubectl / helm   │       │  API Endpoint   │
└─────────────┘       └───────────────────┘       └─────────────────┘
                              │
                              ▼
                      ┌───────────────────┐
                      │  VPC Endpoints    │
                      │  (EKS + STS)      │
                      └───────────────────┘
```

The module leverages `aws_lambda_invocation` with `lifecycle_scope = "CRUD"`, meaning Terraform handles the full lifecycle: creates and updates run `kubectl apply` or `helm upgrade --install`, and destroys run `kubectl delete` or `helm uninstall`. Everything is idempotent.

## Setting it up

First, deploy the Lambda alongside your EKS cluster:

```hcl
module "kube_crud" {
  source = "./kube_crud"

  name                      = "my-cluster"
  cluster_name              = module.eks.cluster_name
  cluster_security_group_id = module.eks.cluster_primary_security_group_id
  subnet_ids                = module.vpc.private_subnets
  vpc_id                    = module.vpc.vpc_id
}
```

The module downloads `kubectl` and `helm` at plan time and bundles them into the Lambda deployment package. The IAM role is automatically granted cluster-admin through an EKS access entry — no need to edit the `aws-auth` ConfigMap.

You'll also need VPC endpoints for EKS and STS if your subnets don't have internet access:

```hcl
resource "aws_vpc_endpoint" "eks" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${local.region}.eks"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = module.vpc.private_subnets
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
}

resource "aws_vpc_endpoint" "sts" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${local.region}.sts"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = module.vpc.private_subnets
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
}
```

## Applying manifests

The `invoke` submodule wraps each invocation. For raw manifests:

```hcl
module "demo_namespace" {
  source = "./kube_crud/modules/invoke"

  function_name = module.kube_crud.function_name
  type          = "manifest"
  name          = "demo-namespace"
  manifest = yamlencode({
    apiVersion = "v1"
    kind       = "Namespace"
    metadata = {
      name = "demo"
      labels = {
        managed-by = "kube-crud-lambda"
      }
    }
  })
}
```

Each invocation is its own module call. Use `depends_on` for ordering when resources need to exist before others are applied.

## Deploying Helm charts

The module supports three modes for Helm:

**Local charts** — files are read at plan time and passed inline to the Lambda. No chart repository needed, no internet required:

```hcl
module "my_release" {
  source = "./kube_crud/modules/invoke"

  function_name    = module.kube_crud.function_name
  type             = "helm"
  name             = "my-release"
  release          = "my-release"
  chart            = "my-chart"
  chart_dir        = "${path.module}/charts/my-chart"
  namespace        = "my-app"
  create_namespace = true
  values = yamlencode({
    replicaCount = 2
  })
}
```

**Remote HTTP repositories** — requires the Lambda to have internet access (NAT or endpoint):

```hcl
module "metrics_server" {
  source = "./kube_crud/modules/invoke"

  function_name = module.kube_crud.function_name
  type          = "helm"
  name          = "metrics-server"
  release       = "metrics-server"
  chart         = "metrics-server"
  repository    = "https://kubernetes-sigs.github.io/metrics-server/"
  chart_version = "3.12.2"
  namespace     = "kube-system"
}
```

**OCI registries** — pass an `oci://` repository URL and the Lambda pulls directly from an OCI-compatible registry.

## How the Lambda works

Under the hood, the Python handler:

1. Calls `eks:DescribeCluster` to get the API endpoint and CA certificate
2. Generates a pre-signed STS `GetCallerIdentity` URL as a bearer token (the same mechanism `aws eks get-token` uses)
3. Writes a kubeconfig to `/tmp`
4. Runs `kubectl apply --server-side --force-conflicts` for manifests, or `helm upgrade --install --wait` for charts
5. On delete (triggered by Terraform destroy), runs `kubectl delete` or `helm uninstall`

The Lambda has a 15-minute timeout which is plenty for most operations, and the `--wait` flag on Helm means Terraform won't mark the resource as created until the release is actually healthy.

## Security model

The module creates a dedicated IAM role with minimal permissions:

- CloudWatch Logs (for its own log group)
- VPC ENI management (required for Lambda in VPC)
- `eks:DescribeCluster` on the target cluster

Cluster-level access is granted through an EKS access entry with the `AmazonEKSClusterAdminPolicy`. This is intentionally broad because the Lambda needs to apply arbitrary resources. If you need tighter scoping, you can replace this with a custom access policy.

The Lambda security group only allows egress — the cluster security group is given an ingress rule for port 443 from the Lambda SG.

## When to use this

This pattern works well when:

- Your EKS cluster is fully private (no public endpoint)
- You want to manage Kubernetes resources declaratively in Terraform
- You don't want to maintain a bastion host or VPN just for kubectl access
- You need to bootstrap cluster add-ons (namespaces, RBAC, controllers) as part of your infrastructure code
- Your environment is air-gapped and can't reach external CI/CD systems

It's not a replacement for a full GitOps setup like ArgoCD or Flux for application deployments, but it fills the gap between "cluster exists" and "GitOps controller is running" nicely.

## Wrapping up

Managing private EKS clusters doesn't have to mean giving up on infrastructure-as-code for Kubernetes resources. By putting kubectl and helm inside a Lambda, the entire lifecycle lives in Terraform — including proper cleanup on destroy. No bastion, no VPN, no external pipeline.

---

*Need help setting up private EKS clusters or automating your Kubernetes infrastructure? [Get in touch](/contact) for a free consultation.*
