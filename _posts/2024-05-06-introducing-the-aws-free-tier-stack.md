---
layout: default
title: "Introducing the AWS Free Tier Stack — Budget Alerts and Security Checks for New AWS Users"
date: 2024-05-06
categories: [aws, aws-free-tier, cloudformation, security]
description: "A free CloudFormation stack that sets up budget alerts, root user security checks, and CloudTrail for new AWS accounts. Deploy in minutes to avoid surprise bills."
excerpt: "Many people taking the dive into AWS have a bad first experience — an unexpected bill that's much higher than expected. The AWS Free Tier Stack helps new users with early warnings and security basics."
image: /assets/img/posts/24a3513c041e.jpeg
slug: introducing-the-aws-free-tier-stack
---

![Introducing: the AWS Free Tier Stack](/assets/img/posts/24a3513c041e.jpeg)

I love working with AWS. However, many people that take the dive into the box of Lego that is AWS, have a bad first experience; an unexpected bill that's (much) higher than you expected is a good reason to stop the adventure prematurely.

One issue is that the AWS Free Tier is often misunderstood and that big mistakes regarding security are easily made. For example you'll see topics on online platforms that are something like ***"I have the free AWS account, but now I have a $5000 bill, how can this be?"***

Obviously there is no such thing as a free AWS account, and the free tier only covers so much for most services. Also, many well meant tutorials, blogs and examples use bad practices; use of root user IAM access keys is a very bad idea, and when exposed, can compromise an AWS account in **seconds.**

## How to help, a bit

I think we can help new users a bit with their first experience by giving them tools to be warned a bit earlier that something is wrong, and helping them by pointing them to the right documentation. For this purpose, I've build the [AWS Free Tier Stack.](https://github.com/yannickvr/aws-free-tier-stack)

The FTS, a simple CloudFormation stack, helps new users by doing the following:

* Configure a method to send them emails (SNS)
    
* Configure a daily budget amount
    
* Configure CloudTrail
    
* Run a daily check for proper configuration of:
    
    * Root user MFA
        
    * Root user access keys
        
* Send an alert when the root user is used to log in
    

Here are some examples of the alerts that are sent by the stack:

![Example where there is no MFA for the root user and access keys are active in the account](/assets/img/posts/8adbc740859f.png align="center")

![Example of alert because the root user was used](/assets/img/posts/dda8c042ba39.png align="center")

## Installing the stack

To install the stack, view the instructions on the [Github repository](https://github.com/yannickvr/aws-free-tier-stack) or just [click here to launch the CloudFormation stack.](https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review?templateURL=https://aws-free-tier-stack.s3.eu-west-1.amazonaws.com/stack.yml&stackName=aws-free-tier-stack)

Assuming you were already logged in to the AWS console, you'll see the **Quick create stack** wizard:

![](/assets/img/posts/46ba5f5957dd.png align="center")

Now, update the parameters to your liking, making sure to enter a valid email address:

![](/assets/img/posts/a0fb07def170.png align="center")

Then accept the capabilities and press **Create stack:**

*Note: if we're talking about good practice: don't take my word for it if I tell you to do this. Please review the stack contents. Especially "IAM resources" should be thoroughly reviewed before being applied*.

![](/assets/img/posts/d89a306b9ea6.png align="center")

Once the stack is created, you will receive an email from AWS. Press **Confirm subscription**

![](/assets/img/posts/d4eb53bfc345.png align="center")

And that's all! If any of the currently supported misconfigurations are spotted or your daily budget is exceeded, you will get an alert in your email.

---

I think this is very useful for people starting off on AWS. If you're missing a feature, found a bug or have any questions, feel free to [open an issue on Github](https://github.com/yannickvr/aws-free-tier-stack/issues/new).