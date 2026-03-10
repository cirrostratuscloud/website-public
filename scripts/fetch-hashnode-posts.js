#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// GraphQL query to fetch all posts from your Hashnode publication
const query = `
  query Publication {
    publication(host: "cirrostratus.cloud") {
      posts(first: 20) {
        edges {
          node {
            title
            slug
            coverImage {
              url
              attribution
            }
            brief
            author {
              name
            }
            content {
              markdown
            }
            publishedAt
            updatedAt
            tags {
              name
              slug
            }
          }
        }
      }
    }
  }
`;

async function fetchHashnodePosts() {
    try {
        console.log('Fetching posts from Hashnode...');

        const response = await fetch('https://gql.hashnode.com/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();

        if (data.errors) {
            console.error('GraphQL errors:', data.errors);
            return;
        }

        const posts = data.data.publication.posts.edges;
        console.log(`Found ${posts.length} posts`);

        // Create _posts directory if it doesn't exist
        const postsDir = path.join(__dirname, '..', '_posts');
        if (!fs.existsSync(postsDir)) {
            fs.mkdirSync(postsDir, { recursive: true });
        }

        for (const { node: post } of posts) {
            const publishedDate = new Date(post.publishedAt);
            const dateStr = publishedDate.toISOString().split('T')[0]; // YYYY-MM-DD format

            // Convert title to slug for filename
            const titleSlug = post.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with single
                .trim();

            const filename = `${dateStr}-${titleSlug}.md`;
            const filepath = path.join(postsDir, filename);

            // Extract categories from tags
            const categories = post.tags.map(tag => tag.slug);

            // Create Jekyll front matter
            const frontMatter = `---
layout: default
title: "${post.title}"
date: ${dateStr}
categories: [${categories.join(', ')}]
excerpt: "${post.brief}"${post.coverImage ? `
image: ${post.coverImage.url}` : ''}
---

`;

            // Add cover image if available
            let content = frontMatter;

            if (post.coverImage) {
                content += `![${post.title}](${post.coverImage.url})\n\n`;
            }

            content += post.content.markdown;

            // Write the file
            fs.writeFileSync(filepath, content, 'utf8');
            console.log(`Created: ${filename}`);
        }

        console.log('✅ All posts fetched and converted successfully!');

    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

// Run the script
fetchHashnodePosts();