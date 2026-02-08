---
title: "Tracking Custom Events with GTM"
description: "Create custom event triggers in Google Tag Manager, push events through the data layer, and send them to Google Analytics 4."
date: "2026-02-15"
category: "gtm"
image: "/images/blog/gtm-custom-events.svg"
author: "Kenneth Abueg"
tags: ["gtm", "custom events", "ga4", "data layer", "tracking"]
---

Standard pageview tracking only tells you that someone visited a page. To understand what users actually do on your site, you need event tracking. Custom events in Google Tag Manager let you capture specific user interactions like button clicks, video plays, file downloads, form completions, and virtually any other action that matters to your business.

Custom events bridge the gap between knowing a user arrived and understanding what they did. They are the building blocks of meaningful analytics, feeding data into Google Analytics 4 reports, audience definitions, and conversion goals.

For Google's official documentation on custom event triggers, see [support.google.com/tagmanager/answer/7679219](https://support.google.com/tagmanager/answer/7679219).

## How Custom Events Work in GTM

The custom event system in GTM has two sides. On the website side, your code pushes an event to the data layer. On the GTM side, a Custom Event trigger listens for that event name and fires the associated tags when it detects a match.

Here is the flow:

1. A user interaction occurs on your website (clicking a button, completing a form, watching a video).
2. Your website code pushes an event to the data layer with `dataLayer.push()`.
3. GTM detects the event and checks all Custom Event triggers.
4. Any trigger matching the event name fires.
5. Tags attached to those triggers execute (sending data to GA4, Google Ads, or other platforms).

This architecture keeps your website code clean. Your developers only need to push events. GTM handles everything about where that data goes and how it is formatted.

## Pushing Custom Events to the Data Layer

The basic syntax for pushing a custom event to the [data layer](/blog/gtm-data-layer) is straightforward:

```javascript
dataLayer.push({
  'event': 'custom_event_name'
});
```

The `event` key is required and must match the event name configured in your GTM trigger. The value can be any string, but following a consistent naming convention is important.

### Naming Conventions

Use lowercase letters with underscores to separate words. This aligns with GA4's event naming format and avoids issues with case sensitivity:

```javascript
// Good naming
dataLayer.push({ 'event': 'newsletter_signup' });
dataLayer.push({ 'event': 'video_play' });
dataLayer.push({ 'event': 'add_to_wishlist' });

// Avoid these patterns
dataLayer.push({ 'event': 'Newsletter Signup' });  // spaces
dataLayer.push({ 'event': 'newsletterSignup' });    // camelCase
dataLayer.push({ 'event': 'NEWSLETTER_SIGNUP' });   // uppercase
```

### Adding Event Parameters

Events become much more valuable when they carry contextual data. Include additional key-value pairs in the data layer push:

```javascript
dataLayer.push({
  'event': 'file_download',
  'file_name': 'product-brochure.pdf',
  'file_type': 'pdf',
  'file_size': '2.4MB',
  'page_location': window.location.href
});
```

These additional values are accessible in GTM through Data Layer Variables. You create a variable for each parameter you want to use in your tags.

### Practical Examples

**Button click tracking:**

```javascript
document.querySelector('.cta-button').addEventListener('click', function() {
  dataLayer.push({
    'event': 'cta_click',
    'cta_text': this.textContent,
    'cta_location': 'hero_section',
    'destination_url': this.href
  });
});
```

**Video engagement tracking:**

```javascript
player.on('play', function() {
  dataLayer.push({
    'event': 'video_play',
    'video_title': player.getTitle(),
    'video_duration': player.getDuration(),
    'video_provider': 'youtube'
  });
});
```

**Tab or accordion interaction:**

```javascript
document.querySelectorAll('.tab-button').forEach(function(tab) {
  tab.addEventListener('click', function() {
    dataLayer.push({
      'event': 'tab_click',
      'tab_name': this.dataset.tabName,
      'tab_position': this.dataset.position
    });
  });
});
```

## Setting Up Custom Event Triggers in GTM

With events being pushed from your website, you now need to create [triggers](/blog/gtm-triggers-guide) in GTM that listen for them.

### Creating a Custom Event Trigger

1. In GTM, navigate to Triggers and click "New".
2. Name the trigger descriptively, such as "CE - File Download".
3. Click the trigger configuration area and select "Custom Event".
4. In the Event name field, enter the exact event name from your data layer push (e.g., `file_download`).
5. Leave "This trigger fires on" set to "All Custom Events" unless you want to add conditions.
6. Click Save.

### Adding Trigger Conditions

Sometimes you want a trigger to fire only for specific instances of an event. For example, you push a `file_download` event for all file types but want a specific tag to fire only for PDF downloads:

1. Change "This trigger fires on" to "Some Custom Events".
2. Add a condition: Data Layer Variable `file_type` equals `pdf`.
3. Save the trigger.

This gives you fine-grained control without needing separate data layer events for every variation.

### Using Regex in Event Names

The Custom Event trigger supports regular expressions in the event name field. Check the "Use regex matching" option to match multiple event names with a single trigger:

```
video_(play|pause|complete)
```

This single trigger fires for `video_play`, `video_pause`, and `video_complete` events. Use this sparingly, as it can make your container harder to understand when auditing.

## Sending Custom Events to GA4

The final piece is creating a GA4 Event tag that sends the custom event data to Google Analytics 4.

### Creating the GA4 Event Tag

1. Create a new tag and select "Google Analytics: GA4 Event".
2. In the Measurement ID field, reference your GA4 configuration tag or enter the measurement ID directly.
3. In the Event Name field, enter the event name you want to appear in GA4 reports. This can be the same as your data layer event name or different.
4. Under Event Parameters, add rows for each parameter you want to send.
5. For each parameter, the Parameter Name is what appears in GA4, and the Value references the Data Layer Variable you created.

For example:

| Parameter Name | Value |
|----------------|-------|
| file_name | {{DLV - File Name}} |
| file_type | {{DLV - File Type}} |

6. Attach the Custom Event trigger you created earlier.
7. Save the tag.

### Testing the Full Flow

1. Enter GTM Preview mode and connect to your website. For detailed testing procedures, see our [debug mode guide](/blog/gtm-debug-mode).
2. Perform the action that triggers the custom event (click the download link, play the video, etc.).
3. In Tag Assistant, find the custom event in the event timeline on the left.
4. Click on it and verify that your tag appears under "Tags Fired".
5. Click on the tag to see the data it sent, including event parameters.
6. Open GA4 DebugView (Admin, then DebugView) to confirm the event appears with correct parameters.

## Best Practices for Custom Event Tracking

**Plan your event taxonomy before implementation.** Create a spreadsheet listing every event you need, its parameters, which tags it triggers, and which pages it fires on. This prevents ad-hoc event creation that leads to inconsistent, hard-to-analyze data.

**Align with GA4 recommended events.** GA4 has a set of recommended event names for common actions like `login`, `sign_up`, `purchase`, `add_to_cart`, and `search`. Using these names enables built-in GA4 reports and features. Only create completely custom event names when no recommended event fits your use case.

**Keep event parameters focused.** Send only the parameters you will actually use in reports or audience definitions. Every parameter adds to data processing, and unused parameters create clutter. If you are not going to analyze `button_color`, do not track it.

**Validate before publishing.** Always test custom events in GTM's preview mode and GA4's DebugView before publishing. Catching errors in preview is free. Catching them after publish means lost or corrupted data that you cannot recover.

**Document everything.** Maintain a tracking specification that maps every custom event to its business purpose, the team that requested it, and the data layer implementation details. Six months from now, you will not remember why `cta_click_v2` exists without documentation.

Custom events transform Google Tag Manager from a simple tag deployment tool into a comprehensive measurement platform. They give you the granular interaction data that drives informed business decisions, and a well-planned event taxonomy scales cleanly as your tracking needs grow.
