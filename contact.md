---
layout: default
title: Contact
---

# Get In Touch

Ready to transform your infrastructure? Let's discuss how Cirrostratus can help your organization.

## Contact Form

<form id="contact-form" action="#" method="POST">
  <div class="form-group">
    <label for="name">Name *</label>
    <input type="text" id="name" name="name" required>
  </div>
  
  <div class="form-group">
    <label for="email">Email *</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <div class="form-group">
    <label for="company">Company</label>
    <input type="text" id="company" name="company">
  </div>
  
  <div class="form-group">
    <label for="project-type">Project Type</label>
    <select id="project-type" name="project-type">
      <option value="">Select...</option>
      <option value="aws-migration">AWS Migration</option>
      <option value="devops-transformation">DevOps Transformation</option>
      <option value="terraform-consulting">Terraform Consulting</option>
      <option value="architecture-review">Architecture Review</option>
      <option value="team-training">Team Training</option>
      <option value="other">Other</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="message">Message *</label>
    <textarea id="message" name="message" rows="5" required placeholder="Tell me about your project, timeline, and goals..."></textarea>
  </div>
  
  <button type="submit">Send Message</button>
</form>

<div id="form-status" style="display: none;"></div>

## Other Ways to Connect

**Email**: [contact@cirrostratus.cloud](mailto:contact@cirrostratus.cloud)

**LinkedIn**: [Connect with me](https://linkedin.com/in/cirrostratus)

**Response Time**: I typically respond within 24 hours

---

## What Happens Next?

1. **Initial Consultation** - Free 30-minute discussion about your needs
2. **Proposal** - Detailed scope, timeline, and pricing
3. **Kickoff** - Project planning and stakeholder alignment
4. **Delivery** - Regular updates and milestone reviews

<script>
document.getElementById('contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    const statusDiv = document.getElementById('form-status');
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = 'Sending message...';
    statusDiv.className = 'status-sending';
    
    try {
        const response = await fetch('https://biaieh4ihcn6bl5theqmu4mnuq0ereed.lambda-url.eu-west-1.on.aws', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'T57rEJGU9jxAc5QOub82mtO2mhzt6TZ2'
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                message: data.message,
                company: data.company || '',
                'project-type': data['project-type'] || ''
            })
        });
        
        if (response.ok) {
            statusDiv.innerHTML = 'Message sent successfully! I\'ll get back to you soon.';
            statusDiv.className = 'status-success';
            this.reset();
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        statusDiv.innerHTML = 'Sorry, there was an error sending your message. Please try emailing me directly.';
        statusDiv.className = 'status-error';
    }
});
</script>

<style>
.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #333;
    background: #1a1a1a;
    color: #00ff00;
    font-family: monospace;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #00ff00;
}

button[type="submit"] {
    background: #00ff00;
    color: #000;
    border: none;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-family: monospace;
    font-weight: bold;
}

button[type="submit"]:hover {
    background: #00cc00;
}

.status-sending {
    color: #ffff00;
}

.status-success {
    color: #00ff00;
}

.status-error {
    color: #ff0000;
}
</style>