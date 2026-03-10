---
layout: default
title: Blog
---

# Blog

Insights on AWS, DevOps, Infrastructure as Code, and technical leadership.

---

{% for post in site.posts %}
## [{{ post.title }}]({{ post.url | relative_url }})
*{{ post.date | date: "%B %d, %Y" }}*

{{ post.excerpt }}

[Read more →]({{ post.url | relative_url }})

---
{% endfor %}

{% if site.posts.size == 0 %}
## Coming Soon

I'm working on some great content about:

- **AWS Best Practices** - Real-world lessons from complex deployments
- **Terraform Patterns** - Advanced techniques for scalable IaC
- **DevOps Transformation** - How to successfully modernize your workflows
- **Technical Leadership** - Building and leading high-performing teams

Check back soon for the latest insights!
{% endif %}