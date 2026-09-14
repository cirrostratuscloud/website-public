---
layout: default
title: "Privacy Policy"
description: "How Cirrostratus handles your data, including our use of Google Analytics and cookie consent."
permalink: /privacy/
---

# Privacy Policy

_Last updated: {{ 'now' | date: "%B %-d, %Y" }}_

This site ([cirrostratus.cloud](https://www.cirrostratus.cloud)) is operated by
Yannick Van Rooyen (Cirrostratus). This policy explains what data we collect,
why, and the choices you have.

## Who is responsible

The data controller for this website is:

- **Cirrostratus** — Yannick Van Rooyen
- Email: [contact@cirrostratus.cloud](mailto:contact@cirrostratus.cloud)

## What we collect

### Analytics (only with your consent)

We use **Google Analytics 4** to understand how visitors use the site so we can
improve it.

**Before you consent**, we do not set any cookies and do not store or collect
any information that can identify you. In this state Google Analytics operates in
a cookieless mode: it sends anonymous, aggregated signals that let Google
estimate overall visitor numbers, but no identifiers, no cookies, and no personal
data are used.

**After you click Accept**, Google Analytics is enabled with cookies and may
collect:

- Pages you visit and how you navigate between them
- Approximate location (derived from your IP address, which Google truncates)
- Device, browser, and operating system information
- Referring website or campaign

We have configured **Google Consent Mode v2** so that storage and advertising
signals default to *denied* until you opt in. We do not use this data for
advertising or personalization.

Google Analytics is provided by Google LLC. For details on how Google processes
this data, see
[Google's Privacy Policy](https://policies.google.com/privacy) and
[How Google uses information from sites that use its services](https://policies.google.com/technologies/partner-sites).

### Contact

If you email us, we process the information you provide (such as your name, email
address, and message) solely to respond to your enquiry.

## Cookies

| Cookie | Purpose | Set when |
| --- | --- | --- |
| `cs-consent` | Remembers your cookie choice (local storage). | Always, once you choose. |
| `_ga`, `_ga_*` | Google Analytics — distinguishes visitors and sessions. | Only after you Accept. |

The `cs-consent` value is stored in your browser's local storage and is not sent
to any server. It is strictly necessary to remember your consent preference.

## Your choices

- **Manage your consent:** You can accept or withdraw analytics consent at any
  time using the button below.
- **Withdraw consent:** Declining (or clearing your browser storage) stops all
  cookies and identifiers. Analytics returns to the anonymous, cookieless mode
  described above.
- **Browser controls:** You can block or delete cookies through your browser
  settings.

<button type="button" id="cs-manage-consent" class="cs-btn cs-btn-primary">
  Manage cookie settings
</button>

<script>
  (function () {
    var btn = document.getElementById('cs-manage-consent');
    if (!btn) return;
    btn.addEventListener('click', function () {
      try { localStorage.removeItem('cs-consent'); } catch (e) {}
      var banner = document.getElementById('cs-consent-banner');
      if (banner) banner.hidden = false;
    });
  })();
</script>

## Your rights (GDPR)

If you are in the European Economic Area (EEA), you have the right to access,
correct, or delete your personal data, to restrict or object to its processing,
and to data portability. To exercise any of these rights, email
[contact@cirrostratus.cloud](mailto:contact@cirrostratus.cloud). You also have
the right to lodge a complaint with your local data protection authority.

## Changes to this policy

We may update this policy from time to time. The "last updated" date at the top
reflects the most recent change.
