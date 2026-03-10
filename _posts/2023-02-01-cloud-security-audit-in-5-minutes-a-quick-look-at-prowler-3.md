---
layout: default
title: "Cloud security audit in 5 minutes, a quick look at Prowler 3"
date: 2023-02-01
categories: [aws, security, prowler]
excerpt: "Security is job zero. At least, that's what we say. In reality, business value comes first most of the time and security only becomes a job once either an audit must be performed, or perhaps when it's already too late.
So, let's make security quick a..."
image: https://cdn.hashnode.com/res/hashnode/image/upload/v1714989825216/db71a68f-3b68-4f8f-b3ca-4d23b53eb55c.png
---

![Cloud security audit in 5 minutes, a quick look at Prowler 3](https://cdn.hashnode.com/res/hashnode/image/upload/v1714989825216/db71a68f-3b68-4f8f-b3ca-4d23b53eb55c.png)

Security is job zero. At least, that's what we say. In reality, business value comes first most of the time and security only becomes a job once either an audit must be performed, or perhaps when it's already too late.

So, let's make security quick and easy! Prowler 3 is our weapon of choice since it is a breeze to run and can export a nice HTML that we can give to management.

# Installing Prowler

To keep things quick and easy, we're going to run Prowler from AWS CloudShell. If you don't know what AWS CloudShell is, log on to the AWS console for the account that you want to scan and press the commandline-ish-button-thing as pictured below:

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1675282938641/424ccfac-0d38-4ef5-8160-810487622d01.png align="center")

Once logged in, you'll have a command line that has the same permissions as the user you've just launched it with. If you already have Python3.9 installed (enter `python3.9 --version` to test) you can skip the next part. If you don't, we first need to install Python 3.9. Copy and paste the following into AWS Cloud Shell, and press enter:

```bash
sudo yum -y install gcc openssl-devel bzip2-devel libffi-devel
wget https://www.python.org/ftp/python/3.9.16/Python-3.9.16.tgz
tar zxf Python-3.9.16.tgz
cd Python-3.9.16/
./configure --enable-optimizations
sudo make altinstall
python3.9 --version
cd
```

After installing Python 3.9 (which I have to admit, might take our allotted 5 minutes), we can continue installing Prowler. Enter the following commands, and again, don't forget to press enter:

```bash
pip3.9 install prowler
prowler -v
```

Currently, the latest version of Prowler is `3.1.2`, so that's what's installed for me:

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1675283296183/d5577cf2-7856-4611-a2c6-1607290d7e33.png align="center")

# Running Prowler

So, let's run that 5 minute security audit! Enter the following command, replacing `eu-west-1` with the region of your choice, and read on while it's running.

```bash
prowler aws -f eu-west-1 -M html
```

After running this command, Prowler should be authoring your AWS account against 247 checks. In the command, we're using the `-f` flag to tell Prowler to run only in eu-west-1, and the `-M` flag to ask Prowler to only export the results in HTML

Removing both flags will have Prowler run in all active AWS regions, as well as export the results in JSON and CSV.

Much more options are available, and instructions can be found using the `-h` flag.

# Viewing the report

Once Prowler is finished, it should show a summary, as well as the path that the HTML has been saved to.

The summary for my (mostly empty) AWS account looked like this:

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1675284250207/b4a49e52-bc40-4cce-898e-8227aba4e273.png align="center")

I'm very interested in the critical results, so let's copy the path to the HTML file, and click `Actions` in the upper right corner menu, then `Download file` and paste the path, so your HTML report is downloaded.

Once opened, your report should look a bit like this:

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1675284694480/ba53267c-a141-4b89-94bf-c866c32c60b5.png align="center")

As you can see, Prowler reports on the context like the AWS account, region and role that was used to perform the scan, as well as an overview of the assessment.

As I was most interested in the critical findings, I used the `Filters` button to only show results with status `FAIL` and severity `critical`. The missing MFA config was no surprise when I first ran Prowler, but I was especially charmed by the critical finding that Prowler generated for my Lambda function.

You see, when I created the Lambda function for this post, I did something I see people do a lot: I put a clear text password in my environment, as shown below.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1675286975047/bd9351af-ac45-4db1-a415-0b09f5da8c85.png align="center")

For all checks that are performed, Prowler will also explain the `Risk` for failure, a `Recommendation` for mitigation and a link to the AWS documentation with instructions. Everything you need to understand why there's so much red in the results, how to turn them green and most importantly; why.

# Final thoughts

Prowler is an awesome tool to get a quick security assessment of your AWS (Or Azure!) environment. Outside what this blog covers, Prowler has much more features and options available, like sending results to AWS Security Hub or scheduling Prowler to run daily from inside a container.

Even though I'm positive Prowler is something that should be in your toolset, we must be aware that it does not paint a full picture. Prowler only reviews your AWS infrastructure and not your application. Also, it does not verify if some best practices, like blocking all public access for S3, are configured.

*The Prowler 3 documentation can be found* [*here*](https://docs.prowler.cloud/en/latest/)*. Since Prowler 3 is open source, the source code can be found on* [*GitHub here*](https://github.com/prowler-cloud/prowler/)*.*