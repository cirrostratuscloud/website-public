---
layout: default
title: "Out Of Memory Issues on ECS Fargate Containers — Root Cause and Fix"
date: 2024-06-03
categories: [aws, docker, ecs]
description: "Why ECS Fargate containers get OOM killed even when metrics look fine. The problem is /proc/meminfo reporting host memory. Here's how to fix it with cgroup limits."
excerpt: "OutOfMemoryError: Container killed due to memory usage. This is the reason your tasks are restarting or failing altogether. The metrics published by ECS don't show that much memory usage, so what's going on?"
image: /assets/img/posts/ecb2de4804db.jpeg
slug: out-of-memory-issues-on-ecs-fargate-containers
---

![Out Of Memory issues on ECS Fargate containers](/assets/img/posts/ecb2de4804db.jpeg)

*"OutOfMemoryError: Container killed due to memory usage".* This is the reason your tasks are restarting or failing altogether. The metrics published by ECS don't show that much memory usage, so what's going on?

## The issue; hard memory limits

Many applications retrieve the available memory of the environment they run on so they can calculate how much of that memory is available for it to operate, and perhaps to reserve a part of that memory so it can efficiently keep things in memory and remove them in a clean way. However, when running on ECS Fargate, but more specifically, when running with hard memory limits in containers, the common method(s) of finding the available memory do not return the actual memory available, but return the memory available to the host in stead.

### What's happening under the hood

Often you'll see something like the `entrypoint` run a command similar to `awk '/MemTotal/ {printf "%.2f GB\n", $2 / 1024 / 1024}' /proc/meminfo`, which returns the total available memory in gigabytes. The output is then used to update the configuration of the application. Let's see how that works on Fargate though!

I created a sample service, running Nginx on a task with 0.25 vCPU and 512MB/0.5GB Memory:

![](/assets/img/posts/f159bc15a319.png align="center")

Once the service was up and running, I connected to the container using ecs-exec, and ran the command to get the total amount of available memory:

![](/assets/img/posts/4a0db90e38eb.png align="center")

As you can see, this method returns almost *twice* the amount of memory we attached to the container. As we update the service to give the container more memory to work with, the amount of memory reported varies:

With 1GB:

![](/assets/img/posts/60507b5b3651.png align="center")

With 2GB:

![](/assets/img/posts/e56a21bda16a.png align="center")

And with 8GB:

![](/assets/img/posts/71173d7561cf.png align="center")

As you can see, each configuration will report around twice the amount of memory of what has been assigned to the container. Unfortunately this isn't just some free memory; once you use more than the assigned limit the container will be terminated immediately.

### The solution(s)

There are two solutions that I know of: either we use another CLI command to find out the memory available, or we ensure we tell our environment somehow how much memory we have available. Since we're still logged in to the container with 8GB memory, lets start with an alternative CLI command.

**For the alternative CLI command**, we'd want to get the `hierarchical_memory_limit` from `/sys/fs/cgroup/memory/memory.stat` This file is exposed by the docker engine, and contains the limit set when starting the container. The amount is returned in bytes in stead of kilobytes, so the updated method used earlier would become:  
`awk '/hierarchical_memory_limit/ {printf "%.2f GB\n", $2 / 1024 / 1024 / 1024}' /sys/fs/cgroup/memory/memory.stat`

When we run that against our 8GB container, we see the correct value:

![](/assets/img/posts/96893cf6d7b1.png align="center")

**As an alternative for the CLI command** I would suggest adding an environment variable to the task, and giving it the value of the memory available, like this:

![](/assets/img/posts/e65318610639.png align="center")

Which would be active in the container like this:

![](/assets/img/posts/1c4f3a2e155a.png align="center")

This environment variable can then be used to update the application config.

Once you've updated the configuration, the OOM issues should be gone!

## Thanks for reading!

I hope the above helped you getting some stability in your environment. As a closing remark, I'd like to add that the `/sys/fs/cgroup/memory/memory.stat` file is not available when running on a Mac, but it will be available on most production systems. There are probably other paths available to use, let me know if you find any!

---

*Running into infrastructure issues like this regularly? I help small teams get their AWS environments stable and performant. Check out my [AWS consulting services](/services) or [get in touch](/contact) for a free consultation.*
