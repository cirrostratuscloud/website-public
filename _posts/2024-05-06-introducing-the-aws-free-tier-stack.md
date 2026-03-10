---
layout: default
title: "Introducing: the AWS Free Tier Stack"
date: 2024-05-06
categories: [aws, aws-free-tier, cloudformation]
excerpt: "I love working with AWS. However, many people that take the dive into the box of Lego that is AWS, have a bad first experience; an unexpected bill that's (much) higher than you expected is a good reason to stop the adventure prematurely.
One issue is..."
image: https://cdn.hashnode.com/res/hashnode/image/stock/unsplash/4lS1eHQhAw8/upload/58b8519013963bb0607ded000f7a1880.jpeg
slug: introducing-the-aws-free-tier-stack
---

![Introducing: the AWS Free Tier Stack](https://cdn.hashnode.com/res/hashnode/image/stock/unsplash/4lS1eHQhAw8/upload/58b8519013963bb0607ded000f7a1880.jpeg)

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

![Example where there is no MFA for the root user and access keys are active in the account](https://cdn.hashnode.com/res/hashnode/image/upload/v1714987160084/5fdca0fe-2eee-41c5-9a44-baa109ef41c0.png align="center")

![Example of alert because the root user was used](https://cdn.hashnode.com/res/hashnode/image/upload/v1714987515172/c8fa93df-617b-440a-aa14-a4c0f2845b39.png align="center")

## Installing the stack

To install the stack, view the instructions on the [Github repository](https://github.com/yannickvr/aws-free-tier-stack) or just [click here to launch the CloudFormation stack.](https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review?templateURL=https://aws-free-tier-stack.s3.eu-west-1.amazonaws.com/stack.yml&stackName=aws-free-tier-stack)

Assuming you were already logged in to the AWS console, you'll see the **Quick create stack** wizard:

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1714987802574/83363882-c4cc-4471-bbad-23a0195dec87.png align="center")

Now, update the parameters to your liking, making sure to enter a valid email address:

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1714987856674/f4c1bd1e-3f11-43e4-977a-663f5b9d94e9.png align="center")

Then accept the capabilities and press **Create stack:**

*Note: if we're talking about good practice: don't take my word for it if I tell you to do this. Please review the stack contents. Especially "IAM resources" should be thoroughly reviewed before being applied*.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1714987911442/2647129e-78d7-44e6-af5a-5c76a0ffec7f.png align="center")

Once the stack is created, you will receive an email from AWS. Press **Confirm subscription**

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1714987991513/1b9e303b-fc75-4f6c-a8a9-63305ffa249d.png align="center")

And that's all! If any of the currently supported misconfigurations are spotted or your daily budget is exceeded, you will get an alert in your email.

---

I think this is very useful for people starting off on AWS. If you're missing a feature, found a bug or have any questions, feel free to [open an issue on Github](https://github.com/yannickvr/aws-free-tier-stack/issues/new).