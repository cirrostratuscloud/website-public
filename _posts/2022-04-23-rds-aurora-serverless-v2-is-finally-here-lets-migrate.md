---
layout: default
title: "RDS Aurora Serverless v2 is finally here, let's migrate!"
date: 2022-04-23
categories: [aws, databases, mysql, postgresql, serverless]
excerpt: "After being in preview for what felt like an eternity, AWS has finally
released RDS Aurora Serverless v2 on April 21, 2022. 
RDS Aurora Serverless v2 is available for both Mysql 8 and Postgres 13 and will be a game changer for many organizations that..."
image: https://cdn.hashnode.com/res/hashnode/image/upload/v1650713587330/3IIxEZ3og.png
slug: rds-aurora-serverless-v2-is-finally-here-lets-migrate
---

![RDS Aurora Serverless v2 is finally here, let's migrate!](https://cdn.hashnode.com/res/hashnode/image/upload/v1650713587330/3IIxEZ3og.png)

After being in preview for what felt like an eternity, AWS has finally
[released RDS Aurora Serverless v2](https://aws.amazon.com/about-aws/whats-new/2022/04/amazon-aurora-serverless-v2/) on April 21, 2022. 

RDS Aurora Serverless v2 is available for both Mysql 8 and Postgres 13 and will be a game changer for many organizations that struggle with "spiky" database loads. According to AWS, RDS Aurora Serverless v2 delivers "instant" scaling of the capacity of your database cluster, varying between 0.5 "Aurora Capacity Units" to 128 of those things.

An Aurora Capacity Unit, or ACU, provides 2 GiB of memory and "corresponding compute and networking". The minimum allocation is 0.5 ACU, or 1GB of memory, and your cluster could scale all the way up to 128ACUs, or 256GiB of memory. 

The difference between Aurora v1 and v2 is small, but with huge impact. Where v1 scaled by doubling the ACU's, v2 will scale incrementally. The scaling policies currently available are very limited: there's a lower and upper limit of ACUs, and that's it. Also the "autopause" feature as well as the [data API](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/data-api.html) have not made it to Serverless v2 (yet).

# Very Cool, let's migrate!

RDS Aurora Serverless v2 is only available on the latest versions of both MySQL and Postgres. That means your cluster must be on at least on Aurora MySQL 3.02.0 or Aurora PostgreSQL 13.6.

As a test, I've provisioned a normal RDS Aurora MySQL 8 cluster with a provisioned instance:

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1650710716836/JiUjTqfOS.png)

*Note that there's no in-place upgrade from MySQL 5.7 to 8, so if you're still on 5.7, you'll need to launch a new cluster from a snapshot.*

First, let's upgrade to the latest version, by modifying the version of our cluster:

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1650710430377/O-o_mwrP_.png)

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1650710452119/xBePwHHx7.png)

**Oops!** First hurdle. It appears Performance Insights can not be enabled during upgrade. The error message is wrong; Performance Insights is actually supported. If you've got Performance Insights enabled for any of your instances, disable it first to continue.

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1650710888851/Ich4zS4Ju.png)

After fixing the above, the cluster started upgrading. This takes about 10 minutes for an empty cluster, so your mileage will vary.

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1650711083835/e8kjuZVQk.png)

Once your cluster is available again, we need to add a new **reader ** to the cluster:

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1650711517830/yD8VBy2C9.png)

On the Add Reader screen, select "Serverless v2" as your DB instance class, and specify a capacity range:

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1650711586936/bKwSyT8Y1.png)

Now we have a serverless reader added to our cluster. If your application is read-heavy and supports splitting reads and writes, this setup can be awesome as well. Use a small provisioned writer, and have Serverless v2 automatically manage reader capacity.


![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1650711993831/H46qWuPvK.png)

For this article however, we want to end up with a completely serverless cluster. So let's continue by migrating the writer role to the serverless "Instance". To do that, select the serverless instance, go to actions, and press "Failover"

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1650712080107/2GPly15Rb.png)

Then, press Failover again.

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1650712062185/9mGakTAJT.png)

Note that after the failover was successful, our serverless instance now has the Writer role:

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1650712154699/Xqo66m3Uh.png)

To complete the migration, just delete the old provisioned instance that now has the reader role: 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1650712206112/nWaSi2zvt.png)

And that's it, we're completely serverless! 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1650712746366/rvnXfziE-.png)

After the migration, Performance Insights can be enabled for the serverless instance again. Also, it's wise to test your application thoroughly, both because of the new MySQL/PostgreSQL version, and to verify if the scaling of the serverless instance does not affect your application in any way.  The upgrade/migrate process **will** cause downtime, so when doing this in production, schedule the migration in a maintenance window.

I'm curious to see how much cost and performance benefits serverless v2 will have in the real world. You now know how to get there!

Thanks for reading this article!