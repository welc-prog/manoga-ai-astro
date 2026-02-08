---
title: "Cross-Domain Tracking with GTM"
description: "Set up cross-domain tracking in GTM and GA4 to maintain user sessions across domains. Includes configuration, testing, and troubleshooting tips."
date: "2026-03-13"
category: "gtm"
image: "/images/blog/gtm-cross-domain-tracking.svg"
author: "Kenneth Abueg"
tags: ["gtm", "cross-domain", "ga4", "tracking", "sessions"]
---

When your business operates across multiple domains, tracking a user's journey from one domain to another becomes a technical challenge. By default, each domain is treated as a separate website in analytics. A user who starts on `www.example.com` and then moves to `shop.example-store.com` to complete a purchase appears as two separate users with two separate sessions. This breaks attribution, inflates user counts, and makes conversion path analysis unreliable.

Cross-domain tracking solves this by passing a user identifier between domains, allowing [GA4 to recognize](/blog/ga4-gtm-integration) the same user across different domain boundaries.

For the official GA4 cross-domain documentation, see [support.google.com/analytics/answer/10071811](https://support.google.com/analytics/answer/10071811).

## When You Need Cross-Domain Tracking

Not every multi-domain setup requires cross-domain tracking. Understanding when it is necessary saves you from unnecessary complexity.

### You Need Cross-Domain Tracking When

- Your main website is on one domain and your checkout or payment flow is on a different domain (e.g., `example.com` to `checkout.differentdomain.com`).
- You operate multiple related websites under different domains and want to analyze user behavior across them as a single journey.
- Your blog is on a different domain than your product (e.g., `blog.example.com` on a hosted blog platform and `app.example.com` on your product).
- You use a third-party booking or registration system on its own domain.

### You Do Not Need Cross-Domain Tracking When

- All your pages are on subdomains of the same root domain (e.g., `www.example.com` and `shop.example.com`). GA4 handles subdomains automatically through first-party cookies on the root domain.
- Users do not navigate between your domains during their session. If your domains serve different audiences with no user overlap, separate analytics properties make more sense.
- Your payment processor handles the transaction on their domain and redirects back. In this case, you typically track the conversion on your own domain's confirmation page rather than on the payment domain.

## How Cross-Domain Tracking Works in GA4

GA4 uses a linker parameter to maintain identity across domains. Here is the flow:

1. A user is on `www.example.com` and clicks a link to `shop.different.com`.
2. The GA4 tag on `www.example.com` detects that the outbound link goes to a configured cross-domain destination.
3. GA4 appends a `_gl` parameter to the URL. This parameter contains the user's client ID and a timestamp.
4. The user arrives on `shop.different.com` with the `_gl` parameter in the URL.
5. The GA4 tag on `shop.different.com` reads the `_gl` parameter and uses the client ID from the source domain instead of generating a new one.
6. The user is now tracked as the same individual across both domains.

The `_gl` parameter is temporary and time-limited. It expires after a short window (typically 2 minutes), so it only works for direct navigation, not for users who copy a URL and paste it later.

## Configuration in GTM

### Step 1: Configure Cross-Domain in GA4

The primary configuration happens in your GA4 property settings, not in GTM.

1. In GA4, go to Admin, then Data Streams, and select your web stream.
2. Click "Configure tag settings" (or "Google Tag settings").
3. Click "Configure your domains."
4. Add all domains that should share user identity. For example:
   - `example.com`
   - `shop.different.com`
   - `booking.thirdparty.com`
5. Save.

This tells GA4 which domains to decorate outbound links for and which incoming `_gl` parameters to trust.

### Step 2: Verify GTM Configuration

Your GA4 configuration tag in GTM should use the same Measurement ID across all domains. If each domain has its own [GTM container](/blog/gtm-setup-guide), ensure they all contain a GA4 configuration tag with the identical Measurement ID.

If you use a single GTM container across multiple domains, no additional GTM changes are needed. The cross-domain configuration in GA4 handles the linker parameter injection automatically.

### Step 3: Handle Multiple GTM Containers

If different domains use different GTM containers (which is common), ensure:

- All containers have a GA4 configuration tag with the same Measurement ID.
- The Conversion Linker tag (for Google Ads) is present in all containers.
- The GA4 cross-domain configuration includes all domains involved.

## Advanced Configuration

### Including Specific Paths

Sometimes you only want cross-domain tracking on certain paths. For example, you might share tracking between `example.com/shop` and `checkout.otherdomain.com`, but not between `example.com/blog` and the checkout domain.

GA4's cross-domain configuration applies at the domain level, not the path level. To handle path-specific needs, you can use GTM to conditionally include or exclude the linker parameter by configuring your Google Tag settings in the GA4 configuration tag.

### Form Submissions Across Domains

Links decorated with the `_gl` parameter work automatically for standard navigation. However, forms that submit to a different domain need special handling because the form action URL does not go through the normal link decoration process.

GA4 handles form decoration automatically when cross-domain is configured. The linker parameter is appended to the form's action attribute when the form is submitted, maintaining user identity across the domain transition.

### Excluding Referrals

When a user navigates from one of your domains to another, GA4 would normally count the source domain as a referral. This breaks session continuity and creates misleading referral data.

GA4 automatically handles referral exclusion for domains configured in cross-domain tracking. You do not need to manually exclude referrals for these domains. However, verify this is working correctly by checking GA4 reports for self-referral traffic (where your own domains appear as traffic sources).

## Testing Cross-Domain Tracking

Thorough testing is essential because cross-domain issues are subtle and easy to miss.

### Step 1: Verify Link Decoration

1. Open your primary domain in Chrome.
2. Open Developer Tools and go to the Network tab.
3. Click a link that navigates to your secondary domain.
4. Check the URL in the address bar. You should see a `_gl` parameter appended.

If the `_gl` parameter is missing, the cross-domain configuration is not working. Check your GA4 domain settings and ensure the GA4 tag is loading correctly on the source page. Use [GTM debug mode](/blog/gtm-debug-mode) to verify tag firing.

### Step 2: Verify Session Continuity

1. Open GTM Preview mode on your primary domain.
2. Navigate to the secondary domain through a link.
3. Check the GA4 client ID on both domains. In the browser console, you can check the `_ga` cookie value. It should be the same on both domains.

### Step 3: Check GA4 Reports

After generating some cross-domain traffic:

1. Go to GA4 Realtime report while navigating between domains.
2. Your activity should appear as a single session, not as separate sessions.
3. Check the traffic acquisition reports for self-referral traffic. If you see your own domains appearing as referral sources, cross-domain tracking is not configured correctly.

### Step 4: Test Edge Cases

- **Right-click "Open in new tab":** The `_gl` parameter should still be appended.
- **Form submissions:** Submit a form that posts to the secondary domain and verify the `_gl` parameter is included.
- **JavaScript navigation:** If your site uses `window.location.href` or similar JavaScript navigation, verify the linker still works.
- **Redirects:** If clicking a link goes through a redirect chain, the `_gl` parameter may be lost. Test the full redirect path.

## Common Issues and Solutions

### Self-Referral Traffic

**Symptom:** Your own domains appear as referral sources in GA4 reports.

**Cause:** The cross-domain configuration is incomplete, or the `_gl` parameter is not being passed on certain navigation paths.

**Fix:** Verify all domains are listed in the GA4 cross-domain configuration. Check for navigation paths that bypass link decoration (JavaScript redirects, server-side redirects, intermediate pages).

### Inflated User Counts

**Symptom:** Your unique user count is higher than expected, with users appearing to have very short sessions.

**Cause:** Cross-domain tracking is not maintaining the client ID, so each domain creates a new user.

**Fix:** Verify the `_gl` parameter appears on cross-domain links and that the receiving domain's GA4 tag reads it correctly.

### Missing Conversion Attribution

**Symptom:** Conversions on the secondary domain show "(direct)" as the source instead of the referring campaign.

**Cause:** Session data is not carrying over from the primary domain.

**Fix:** This is typically the same root cause as self-referral traffic. Fixing cross-domain tracking also fixes attribution.

### Parameter Stripping

**Symptom:** The `_gl` parameter is present in the link but missing when the page loads.

**Cause:** Server-side redirects, URL rewriting rules, or security modules may strip unknown parameters.

**Fix:** Check your server configuration for URL parameter filtering. The `_gl` parameter must survive any server-side processing between the click and the page load.

Cross-domain tracking is one of those implementations where getting it 95% right is the same as getting it 0% right. If even one navigation path drops the linker parameter, your data for that user journey is fragmented. Test every navigation path between your domains, including edge cases, before considering the implementation complete.
