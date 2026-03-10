---
layout: default
title: "AWS Cost Optimization for everybody"
date: 2024-11-20
categories: [aws, cost-optimisation, finops]
excerpt: "Are you bleeding money on your AWS bill? You’re not alone. Between a complex billing system and a sea of options and opinions about cloud infrastructure, no AWS account is 100% optimized and cost effective.
As with many complex problems, I like to br..."
image: https://cdn.hashnode.com/res/hashnode/image/upload/v1732106123993/8251eb27-889b-44fe-8fae-328ae09114ee.png
---

![AWS Cost Optimization for everybody](https://cdn.hashnode.com/res/hashnode/image/upload/v1732106123993/8251eb27-889b-44fe-8fae-328ae09114ee.png)

Are you bleeding money on your AWS bill? You’re not alone. Between a complex billing system and a sea of options and opinions about cloud infrastructure, no AWS account is 100% optimized and cost effective.

As with many complex problems, I like to break it up in manageable parts.

## Get rid of it.

A customer once told me that I must really like this term, as I used it a lot. The premise is simple; find out what resources you’re paying for, decide if you need them and if you don’t: get rid of it.

Finding what resources you run in your AWS account can be a challenge though. One thing that works for me is to find the [most current bill](https://us-east-1.console.aws.amazon.com/billing/home?region=us-east-1#/bills) and drill down from there. Obviously start with the most costly service first. I would also suggest getting familiar with [Cost Explorer](https://us-east-1.console.aws.amazon.com/costmanagement/home#/cost-explorer) as this allows you to filter your resources a bit more effectively.

## Check the architecture

There are many ways that people try to make cloud development easier for new developers and admins. While these ways, like sharing blogs and creating patterns for Infrastructure as Code like CDK Constructs or Terraform Modules, deliver tremendous value, they all have a problem in common; they’re never designed for your specific situation.

Cloud Architecture combines your unique requirements with a deep understanding of AWS services. One example that comes to mind is overuse of Application Load Balancers(ALB). A common pattern “marries” a load balancer to a single containerized service, while a single ALB will happily route traffic to hundreds of services. Only when the situation requires it should more infrastructure be provisioned. The same happens when Database Clusters and Databases are confused. A single RDS database cluster or instance can be used to host thousands of databases. Only when the situation requires it, more clusters should be provisioned, for example when services require different versions of Postgres.

## Rightsize it

The whole point of cloud is flexibility. Still I see people using AWS as one would use a traditional data center. Before any application is online, thousands of dollars are spend on hefty servers and terrabytes of empty disk space. There is little need to “prepare for the future”, even if you’re just running EC2 instances and not using cloud technology like auto scaling.

Ensuring that instances are properly utilized does require monitoring of key metrics. Fortunately AWS publishes many metrics that give insight in to the utilization of resources. The [AWS Compute Optimizer](https://us-east-1.console.aws.amazon.com/compute-optimizer/home?region=us-east-1#/dashboard) is a good place to start optimizing your instances and volumes.

Really optimizing does require re-architecture of the infrastructure, but huge savings can be made by reducing instance size to a point where utilization is healthy, like 50% during business hours.

## Shut it down (for a while)

Did I mention flexibility? Maybe you have a development, test or staging environment that only needs to be available during business hours. Most of this infrastructure can be stopped and started when necessary. Doing so will reduce the time that instances are billed for from 168 hours per week to 40, assuming that the environment runs for 8 hours during working days.

Not all costs can be reduced this way, as some resources like Load Balancers or EBS volumes can not be stopped, but many services allow sizing down to 0 or temporarily stopping. Note that RDS instances will start by themselves after being stopped for 7 days.

AWS offers a solution named the Instance Scheduler that can help you achieve this goal.

## Plan and reserve

After setting up a schedule, rightsizing your instances and removing unused infrastructure, it’s time to commit. AWS offers two types of price reduction on many services, in exchange for a commitment.

*Reserved Instances* are available for EC2, RDS, ElastiCache, Redshift, Opensearch, MemoryDB and DynamoDB and are purchased on 1 or 2-year term which can be paid all upfront, partial upfront or with no upfront cost. Depending on the commitment the price reduction can be over 50%. A word of warning; RI’s are quite “rigid”, meaning they are non transferable. For example, an RI for an RDS cluster can not be used for an EC2 instance. Depending on the RI it might even only be available in a specific region or availability zone.

*Compute Savings Plans* are available for general compute (EC2, Fargate and Lambda), just for EC2 or for SageMaker. When Reserved Instances requires more planning, like reserving a specific instance type in a region, Compute Savings Plans allow you to make an hourly commitment, for example $10 per hour, for which a discount is then active. Again, a price reduction of over 50% can be achieved.

## Get help!

I hope this blog has helped your understand which actions can be taken to reduce your AWS bill significantly. However, as things go, this is the tip of the iceberg. If you are interested in getting help with cost savings, but also security and resiliency, [contact me!](https://cirrostratus.cloud/contact)