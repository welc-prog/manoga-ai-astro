---
title: "GTM Consent Mode for GDPR Compliance"
description: "Implement Google Consent Mode v2 in GTM for GDPR compliance, including CMP integration, default and update consent commands, and behavioral modeling for data gaps."
date: "2026-03-11"
category: "gtm"
image: "/images/blog/gtm-consent-mode-gdpr.svg"
author: "Kenneth Abueg"
tags: ["gtm", "consent mode", "gdpr", "privacy", "compliance"]
---

Privacy regulations like GDPR require websites to obtain user consent before collecting certain types of data. Google Consent Mode is the mechanism that lets your GTM tags respect these consent choices. When properly implemented, tags adjust their behavior based on the user's consent state: collecting full data when consent is granted and sending limited, cookieless pings when consent is denied.

Getting consent mode right is not optional for businesses operating in the EU or targeting EU users. Non-compliance carries significant legal risk. But beyond compliance, Consent Mode v2 includes behavioral modeling that helps fill data gaps from users who decline consent, preserving analytical value while respecting privacy choices.

For the official Consent Mode documentation, see [developers.google.com/tag-platform/security/guides/consent](https://developers.google.com/tag-platform/security/guides/consent).

## Understanding Consent Mode v2

Consent Mode v2 introduced two new consent types that Google requires for full compliance, particularly for advertising features in the European Economic Area (EEA).

### Consent Types

| Consent Type | Controls | Purpose |
|-------------|----------|---------|
| `analytics_storage` | Analytics cookies (e.g., GA4 _ga cookie) | Measuring site usage |
| `ad_storage` | Advertising cookies (e.g., Google Ads _gcl cookies) | Conversion tracking, remarketing |
| `ad_user_data` | Sending user data to Google for advertising | Enhanced conversions, audience building |
| `ad_personalization` | Personalized advertising | Remarketing, custom audiences |
| `functionality_storage` | Functional cookies | Remember language, preferences |
| `personalization_storage` | Personalization cookies | Content recommendations |
| `security_storage` | Security cookies | Authentication, fraud prevention |

The two v2 additions are `ad_user_data` and `ad_personalization`. These are now required for Google Ads features in the EEA. Without them, your Google Ads conversion tracking and remarketing data will be incomplete.

### How Tags Respond to Consent

When consent is denied, Google tags do not simply stop firing. Instead, they adjust their behavior:

**Consent granted:** Tags fire normally with full cookie access and data collection.

**Consent denied:** Tags send cookieless pings to Google. These pings do not contain personal identifiers but do include basic information like the timestamp, user agent, and referrer. Google uses these pings for behavioral modeling (discussed later).

This means your GA4 property still receives some data even from users who deny consent, but that data is anonymous and aggregated. No cookies are set, and no user-level tracking occurs.

## Implementing Default Consent State

The first step is setting a default consent state that applies before the user interacts with your consent banner. This default must be set before any Google tags fire.

### Using a GTM Tag

1. Create a new tag in GTM.
2. Select "Consent Initialization - All Pages" as the trigger. This is a special trigger that fires before all other triggers, ensuring the consent default is set first.
3. Choose "Google Tag: Consent Defaults" as the tag type (available in newer GTM templates), or use a Custom HTML tag:

```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'functionality_storage': 'denied',
    'personalization_storage': 'denied',
    'security_storage': 'granted',
    'wait_for_update': 500
  });
</script>
```

### Key Settings

**Default to denied:** For GDPR compliance, all non-essential consent types should default to `denied`. This ensures no tracking occurs before the user makes a choice.

**wait_for_update:** This parameter tells Google tags to wait up to the specified milliseconds for a consent update before firing. Set this to give your consent management platform (CMP) time to load and check for returning users who previously gave consent. A value of 500ms is typical.

**security_storage:** This can default to `granted` because security cookies (like CSRF tokens) are generally considered essential and do not require consent under GDPR.

## Integrating with a Consent Management Platform

Your CMP (Cookiebot, OneTrust, Didomi, etc.) handles the user-facing consent dialog. When the user makes a choice, the CMP must update the consent state in GTM.

### The Consent Update Command

After the user grants or denies consent, the CMP pushes an update:

```javascript
gtag('consent', 'update', {
  'analytics_storage': 'granted',
  'ad_storage': 'granted',
  'ad_user_data': 'granted',
  'ad_personalization': 'granted'
});
```

This update triggers GTM to re-evaluate all tags. Tags that were waiting for consent now fire with full functionality. Tags that were already running in limited mode upgrade to full mode.

### CMP-Specific Implementation

Most popular CMPs have built-in GTM integration for Consent Mode:

**Cookiebot:** Provides a GTM template in the Community Template Gallery. Install the template, enter your Cookiebot ID, and map Cookiebot consent categories to Google consent types.

**OneTrust:** Offers a GTM template that reads the OneTrust consent cookie and sets the appropriate Google consent state.

**Didomi:** Has a native Consent Mode integration that can be activated through their dashboard.

For CMPs without a GTM template, you need to manually map their consent callback to the `gtag('consent', 'update', {...})` command. Listen for the CMP's consent event and translate their consent categories to Google's consent types.

## Configuring Tags to Respect Consent

Google-native tags (GA4, Google Ads, Floodlight) automatically respect Consent Mode. You do not need to configure anything extra. They check the consent state before setting cookies and adjust their behavior accordingly.

### Non-Google Tags

For third-party tags (Meta Pixel, LinkedIn, etc.), you need to configure consent checks manually:

**Option 1: Built-in Consent Checks.** In the tag settings, expand "Consent Settings" and configure which consent types the tag requires. For example, a Meta Pixel tag might require both `ad_storage` and `ad_user_data` to be granted.

**Option 2: Trigger Conditions.** Add conditions to the tag's trigger that check consent state through a data layer variable. Your CMP typically pushes consent status to the data layer.

**Option 3: Consent-Aware Triggers.** Create separate triggers that only fire after consent is granted. Use a Custom Event that your CMP fires when consent updates, combined with a condition checking the granted status.

## Behavioral Modeling

One of Consent Mode's most valuable features is behavioral modeling. When consent is denied, Google tags send cookieless pings that contain no personal data. Google uses machine learning to model the likely behavior of these users based on patterns observed from consenting users on your site.

### What Behavioral Modeling Provides

- **Modeled conversions:** Estimated conversion counts for users who denied consent, filling gaps in your conversion reporting.
- **Modeled user counts:** Estimated user metrics that account for users without cookies.
- **Modeled revenue:** Estimated revenue attribution for non-consented sessions.

### Requirements for Behavioral Modeling

Google applies behavioral modeling only when certain thresholds are met:

1. Your site must have Consent Mode implemented correctly.
2. You need sufficient traffic and consent rates to build reliable models. Google generally requires at least 1,000 events per day with `analytics_storage` denied and at least 1,000 events per day with `analytics_storage` granted.
3. The modeling is automatic. You do not need to enable it manually.

In GA4 reports, modeled data is indicated with a small icon. You can filter reports to show observed data only, modeled data only, or both.

## Testing Your Consent Implementation

### GTM Preview Mode

1. Enter Preview mode and load your site.
2. Check the Consent Initialization event in the timeline. Your default consent tag should fire here.
3. Verify the consent state in the Consent tab (available in Tag Assistant).
4. Check that Google tags fire in limited mode (no cookies set).
5. Grant consent through your CMP dialog.
6. Verify the consent update appears in the timeline.
7. Check that tags re-fire or upgrade to full mode.
8. Verify cookies are now set (check the Application tab in DevTools).

### GA4 DebugView

Check GA4 DebugView while testing. Events from denied-consent sessions should still appear but will show limited parameters. After consent is granted, subsequent events should show full parameters.

### Common Issues

**Consent defaults not set early enough.** If Google tags fire before the consent default is set, they default to `granted`, which violates GDPR. Ensure your consent default tag uses the "Consent Initialization" trigger, which fires before all other triggers.

**CMP not updating consent state.** If your CMP dialog works but the consent state in GTM does not change, the CMP integration is not correctly pushing the `gtag('consent', 'update', {...})` command. Check the CMP's GTM template configuration or custom integration code.

**Tags ignoring consent.** Custom HTML tags do not automatically respect Consent Mode. You must either configure their consent settings in GTM or control their firing through consent-aware triggers.

**Returning users not recognized.** When a user who previously granted consent returns, your CMP should detect their stored preference and send the consent update immediately. The `wait_for_update` parameter gives the CMP time to do this before tags fire in denied mode.

Consent Mode is the mechanism that lets you respect user privacy while maintaining the data quality your business needs for decision-making. Implementing it correctly protects you legally and preserves analytical value through behavioral modeling that bridges the data gaps from consent-denied sessions.
