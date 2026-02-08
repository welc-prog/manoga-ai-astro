---
title: "Google Analytics 4 and GTM Integration"
description: "Integrate GA4 with GTM from configuration tag to event tracking, parameter setup, and enhanced measurement. Complete implementation guide."
date: "2026-02-17"
category: "gtm"
image: "/images/blog/ga4-gtm-integration.svg"
author: "Kenneth Abueg"
tags: ["gtm", "ga4", "google analytics", "integration", "tracking"]
---

Google Analytics 4 and [Google Tag Manager](/blog/what-is-gtm) are two separate tools that work best together. GA4 is the analytics platform that collects, processes, and reports on your data. GTM is the deployment mechanism that sends data to GA4. While you can install GA4 directly with a hardcoded snippet, using [GTM gives you flexibility](/blog/gtm-vs-hardcoded-tags) to manage event tracking, modify parameters, and control tag firing without touching your website code.

This guide covers the full integration process, from the initial GA4 configuration tag through event tracking and enhanced measurement settings.

For the official Google guide on GA4 setup, see [support.google.com/analytics/answer/9310895](https://support.google.com/analytics/answer/9310895).

## Setting Up the GA4 Configuration Tag

The configuration tag is the foundation of your GA4 implementation in GTM. It loads the GA4 library and establishes the connection between your website and your GA4 property.

### Creating the Configuration Tag

1. In GTM, go to Tags and click "New".
2. Name it "GA4 - Configuration" or follow your naming convention.
3. Click the tag configuration area and select "Google Tag".
4. Enter your GA4 Measurement ID in the Tag ID field. This ID starts with "G-" and is found in GA4 under Admin, then Data Streams, then your web stream.
5. For the trigger, select "All Pages" to ensure GA4 loads on every page.
6. Click Save.

This tag does two things. It loads the GA4 measurement library (gtag.js) on every page, and it sends an automatic `page_view` event to GA4 whenever a page loads. You do not need a separate tag for pageviews.

### Configuration Parameters

The configuration tag accepts additional settings that apply globally to all GA4 events:

**User Properties:** These are attributes that describe your user segments. Click "User Properties" and add properties like:
- `user_type` with a value from a data layer variable (e.g., "premium", "free")
- `logged_in_status` with a value of "true" or "false"

**Shared Event Settings:** If you want specific parameters sent with every event (not just pageviews), configure them here. Common choices include `content_group`, `page_type`, or `user_id`.

## Creating GA4 Event Tags

Beyond the automatic `page_view` event, you will need event tags for specific user interactions. GA4 event tags send individual events to your GA4 property.

### Standard Event Tag Setup

1. Create a new tag and select "Google Analytics: GA4 Event".
2. In the Measurement ID field, enter your GA4 Measurement ID or reference the configuration tag.
3. In the Event Name field, enter the name for this event. Use GA4's recommended event names when applicable (e.g., `add_to_cart`, `begin_checkout`, `purchase`, `login`, `sign_up`).
4. Under Event Parameters, add any contextual data you want to send with the event.
5. Attach the appropriate [trigger](/blog/gtm-triggers-guide).

### Example: Tracking Newsletter Signups

**Tag configuration:**
- Tag Type: GA4 Event
- Event Name: `sign_up`
- Event Parameters:
  - `method`: `newsletter`
  - `form_location`: `{{DLV - Form Location}}`

**Trigger:** Custom Event with event name `newsletter_signup`

**Data layer push (on your website):**

```javascript
dataLayer.push({
  'event': 'newsletter_signup',
  'formLocation': 'footer'
});
```

### Example: Tracking Search Queries

**Tag configuration:**
- Tag Type: GA4 Event
- Event Name: `search`
- Event Parameters:
  - `search_term`: `{{DLV - Search Term}}`
  - `results_count`: `{{DLV - Search Results Count}}`

**Trigger:** Custom Event with event name `site_search`

### GA4 Recommended Events

GA4 provides a list of recommended event names for common interactions. Using these names unlocks built-in reports and features in GA4. Key recommended events include:

| Event Name | Use Case |
|-----------|----------|
| `login` | User logs in |
| `sign_up` | User creates an account |
| `search` | User performs a search |
| `select_content` | User selects a content item |
| `share` | User shares content |
| `add_to_cart` | User adds item to cart |
| `begin_checkout` | User starts checkout |
| `purchase` | User completes a transaction |
| `view_item` | User views a product |
| `generate_lead` | User submits a lead form |

You can also create completely custom events for interactions that do not fit any recommended name. Custom events work identically; they just will not populate pre-built GA4 reports automatically.

## Understanding Enhanced Measurement

GA4 includes an Enhanced Measurement feature that automatically tracks common interactions without requiring additional GTM configuration. These events are enabled by default in your GA4 data stream settings.

### What Enhanced Measurement Tracks

- **Page views:** Automatically tracked, including virtual pageviews triggered by browser history changes.
- **Scrolls:** Fires a `scroll` event when a user reaches 90% of the page depth.
- **Outbound clicks:** Tracks clicks on links that navigate away from your domain.
- **Site search:** Captures search queries from URL parameters (configurable).
- **Video engagement:** Tracks YouTube video plays, progress, and completions when embedded with the JS API.
- **File downloads:** Detects clicks on links to files with common extensions (pdf, xlsx, docx, etc.).

### When to Disable Enhanced Measurement

If you are implementing custom tracking for any of these interactions through GTM, consider disabling the corresponding Enhanced Measurement event to avoid duplicate data. For example, if you build a custom scroll tracking implementation with more granular depth thresholds (25%, 50%, 75%, 100%), disable the built-in scroll tracking.

To manage Enhanced Measurement, go to GA4 Admin, then Data Streams, select your web stream, and toggle individual events on or off.

## Event Parameters and Custom Dimensions

Event parameters add context to your events. In GA4, parameters are sent alongside events and can be used for analysis, but only if you register them as custom dimensions or metrics.

### Sending Parameters via GTM

In your GA4 Event tag, click "Event Parameters" and add rows:

| Parameter Name | Value |
|----------------|-------|
| item_category | {{DLV - Item Category}} |
| item_price | {{DLV - Item Price}} |
| button_text | {{Click Text}} |

### Registering Custom Dimensions in GA4

Parameters that are not part of GA4's automatically collected or recommended events need to be registered before they appear in reports:

1. In GA4, go to Admin, then Custom Definitions.
2. Click "Create custom dimension".
3. Enter a name, select the scope (Event or User), and enter the event parameter name exactly as it appears in your GTM tag.

Without this registration step, GA4 collects the parameter data, but you cannot use it in standard reports or explorations. You have a limit on the number of custom dimensions (currently 50 event-scoped and 25 user-scoped for standard GA4 properties), so plan your parameter strategy carefully.

## Testing the Integration

Thorough testing ensures your GA4 and GTM integration works correctly before you rely on it for business decisions.

### GTM Preview Mode

1. Click [Preview in GTM](/blog/gtm-debug-mode) and connect to your site.
2. Navigate your site and perform the tracked interactions.
3. For each event in the Tag Assistant timeline, verify that the correct GA4 tags fire.
4. Click on each fired tag to inspect the data it sends, including event name and parameters.

### GA4 DebugView

1. In GA4, go to Admin and then DebugView.
2. With GTM Preview mode active, your events appear in DebugView in near real-time.
3. Click on individual events to see their parameters and values.
4. Verify that parameter names and values match your expectations.

DebugView is essential because it shows you what GA4 actually receives, not just what GTM sends. It catches issues like parameter names that do not match your custom dimension registrations or values that are undefined.

### GA4 Realtime Report

For a final check after publishing, visit GA4's Realtime report. Events should appear within seconds of firing. This confirms end-to-end data flow from the user interaction through GTM to GA4's processing pipeline.

A properly integrated GA4 and GTM setup gives you reliable data collection with the flexibility to adapt as your measurement needs evolve. Start with the configuration tag and Enhanced Measurement, then build custom event tracking for the interactions that matter most to your business.
