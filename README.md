# Cirrostratus Website

This repository hosts the Cirrostratus company website, deployed via GitHub Pages using the Jekyll "hacker" theme.

## About Cirrostratus

Cirrostratus specializes in:
- AWS consulting and architecture
- DevOps transformation
- Technical leadership
- Infrastructure as Code (Terraform)

## Local Development

```bash
# Install dependencies
bundle install

# Run locally
bundle exec jekyll serve

# Visit http://localhost:4000
```

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the main branch.

## Contact Form API

The contact form in `/contact.md` needs an API endpoint. Update the `YOUR_API_ENDPOINT_HERE` placeholder with your actual API URL.

## Blog Posts

Add new blog posts to the `_posts` directory following the naming convention:
`YYYY-MM-DD-title.md`

## Configuration

Site configuration is in `_config.yml`. Update contact information, social links, and other settings as needed.
