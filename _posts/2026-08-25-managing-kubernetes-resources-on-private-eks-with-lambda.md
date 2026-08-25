---
layout: default
title: "Managing Kubernetes Resources on a Private EKS Cluster with Lambda"
date: 2026-08-25
categories: [aws, eks, kubernetes, terraform, lambda]
description: "A Terraform module that uses a Lambda function to apply Kubernetes manifests and Helm charts to a private EKS cluster without internet access."
excerpt: "A private EKS cluster has no public API endpoint. That makes it secure and hard to manage. This module puts kubectl and helm inside a Lambda, runs it in the VPC, and gives Terraform full CRUD control over Kubernetes resources."
slug: managing-kubernetes-resources-on-private-eks-with-lambda
---

A private EKS cluster has no public API endpoint. That is the point. It also means you cannot run kubectl against it from your laptop, a CI runner, or anywhere outside the VPC.

The usual workarounds are a bastion host, a VPN, or a CI/CD pipeline running inside the VPC. All three need maintenance. All three exist only to bridge a network gap.

I built a module that skips all of that. It deploys a Lambda inside the VPC with kubectl and helm bundled in the deployment package. Terraform invokes the Lambda, the Lambda talks to the EKS private endpoint, and Terraform manages the full create/update/delete lifecycle.

The full source is on GitHub: <a href="https://github.com/cirrostratuscloud/private-eks-management-with-terraform-lambda-invoke" target="_blank">private-eks-management-with-terraform-lambda-invoke</a>.

## How it works

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

The Lambda authenticates using a short-lived STS token. It calls `eks:DescribeCluster` to get the API endpoint and CA certificate, generates a pre-signed `GetCallerIdentity` URL as a bearer token (the same mechanism `aws eks get-token` uses), writes a kubeconfig to `/tmp`, and runs the command.

For manifests, it runs `kubectl apply --server-side --force-conflicts`. For Helm charts, it runs `helm upgrade --install --wait`. On destroy, it runs `kubectl delete` or `helm uninstall`. Both operations are idempotent.

The module uses `aws_lambda_invocation` with `lifecycle_scope = "CRUD"`. That resource type maps Terraform's create, update, and delete actions to Lambda invocations. Terraform controls the lifecycle. The Lambda does the work.

## Deploying the module

Deploy the Lambda alongside your EKS cluster:

```terraform
module "kube_crud" {
  source = "./kube_crud"

  name                      = "my-cluster"
  cluster_name              = module.eks.cluster_name
  cluster_security_group_id = module.eks.cluster_primary_security_group_id
  subnet_ids                = module.vpc.private_subnets
  vpc_id                    = module.vpc.vpc_id
}
```

The module downloads kubectl and helm at plan time and bundles them into the deployment package. An EKS access entry grants the Lambda role cluster-admin. No aws-auth ConfigMap edits required.

If the subnets lack internet access, add VPC endpoints for EKS and STS:

```terraform
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

With those two endpoints, the Lambda can authenticate and reach the cluster API without any internet connectivity.

## Applying manifests

The `invoke` submodule wraps each Lambda invocation:

```terraform
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

Each invocation is a separate module call. Use `depends_on` to set ordering when one resource must exist before the next is applied.

## Deploying Helm charts

The module supports three sources for Helm charts.

**Local charts.** Set `chart_dir` to a directory in your repo. The invoke module reads all files at plan time and passes them inline to the Lambda. No chart repository needed, no internet required:

```terraform
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

**Remote HTTP repositories.** The Lambda needs internet access (NAT gateway or HTTP endpoint) to pull the chart:

```terraform
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

**OCI registries.** Pass a repository URL starting with `oci://` and the Lambda pulls directly from the registry.

## Security model

The module creates a dedicated IAM role with three permission sets:

- CloudWatch Logs: create and write to its own log group
- VPC ENI management: required for any Lambda running in a VPC
- `eks:DescribeCluster`: scoped to the target cluster ARN

Cluster-level access uses an EKS access entry with `AmazonEKSClusterAdminPolicy`. That policy is broad because the Lambda needs to apply arbitrary resources. Replace it with a custom access policy if your use case allows tighter scoping.

The Lambda security group allows all egress and no ingress. The cluster security group receives an ingress rule for port 443 from the Lambda security group.

## When this pattern fits

This module solves a specific problem: managing Kubernetes resources on a private EKS cluster through Terraform, without maintaining additional infrastructure for network access.

It works well for bootstrapping cluster add-ons (namespaces, RBAC, controllers) as part of infrastructure code. It works well in air-gapped environments. It does not replace a GitOps controller like ArgoCD or Flux for application deployments. It fills the gap between "cluster exists" and "GitOps controller is running."

## Wrapping up

Put kubectl and helm inside a Lambda, run it in the VPC, point it at the private endpoint. Terraform manages the lifecycle. On destroy, the resources get cleaned up. No bastion, no VPN, no pipeline.

---

*Need help with private EKS clusters or Kubernetes infrastructure automation? [Get in touch](/contact) for a free consultation.*
