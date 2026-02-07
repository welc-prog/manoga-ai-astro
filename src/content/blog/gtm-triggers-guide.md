---
title: "GTM Triggers: Understanding When Tags Fire"
description: "A comprehensive guide to Google Tag Manager triggers, covering all trigger types including clicks, pageviews, custom events, timers, and trigger groups with practical examples."
date: "2026-02-19"
category: "gtm"
image: "/images/blog/gtm-triggers-guide.svg"
author: "Kenneth Abueg"
tags: ["gtm", "triggers", "tag firing", "tracking", "configuration"]
---

Triggers are what control when your tags fire in Google Tag Manager. Every tag requires at least one trigger, and understanding the different trigger types is essential for building accurate, reliable tracking. A poorly configured trigger either fires too often, sending duplicate or irrelevant data, or not often enough, leaving gaps in your measurement.

This guide covers every trigger type available in GTM, when to use each one, and how to configure trigger conditions for precise control.

For the official trigger documentation, see [support.google.com/tagmanager/answer/7679316](https://support.google.com/tagmanager/answer/7679316).

## Pageview Triggers

Pageview triggers are the most fundamental trigger type. They fire based on page load events and come in three variants.

### Page View (DOM Ready and Window Loaded)

GTM offers three pageview-related events that correspond to different stages of the page loading process:

**Page View (gtm.js):** Fires as soon as GTM processes the page. This is the earliest available trigger point and is when most configuration tags should fire. Use this for your GA4 configuration tag and any tags that need to execute immediately.

**DOM Ready (gtm.dom):** Fires when the browser has finished parsing the HTML document and building the DOM tree, but external resources like images and stylesheets may still be loading. Use this when your tag needs to interact with DOM elements.

**Window Loaded (gtm.load):** Fires when the entire page, including all images, scripts, and stylesheets, has finished loading. Use this for tags that are not time-sensitive and should not compete with page resources for bandwidth.

### Configuring Page-Specific Conditions

To fire a trigger only on specific pages, change the trigger from "All Page Views" to "Some Page Views" and add conditions:

- **Page URL contains** `/checkout` fires on any page with "checkout" in the URL.
- **Page Path equals** `/thank-you` fires only on the exact thank-you page.
- **Page Hostname equals** `shop.example.com` fires only on a specific subdomain.

You can combine multiple conditions. All conditions must be true for the trigger to fire (AND logic). For OR logic, create multiple triggers and attach them all to the same tag.

## Click Triggers

Click triggers fire when a user clicks on an element. GTM provides two click trigger types.

### All Elements Click

This trigger fires on any click anywhere on the page. It captures clicks on links, buttons, images, div elements, and any other clickable element. Use it when you need to track clicks on non-link elements or when the target elements vary.

To narrow it down, add conditions based on built-in Click variables:

- **Click Classes contains** `add-to-cart` fires when the clicked element has the "add-to-cart" CSS class.
- **Click ID equals** `submit-btn` fires when the clicked element has that specific ID.
- **Click Text equals** `Download PDF` fires when the visible text of the clicked element matches.
- **Click Element matches CSS selector** `button[data-action="subscribe"]` fires when the element matches a CSS selector.

### Just Links Click

This trigger fires only on clicks to `<a>` elements (links). It provides additional variables like Click URL, which contains the `href` attribute of the clicked link. This trigger is ideal for tracking outbound links, download links, or navigation patterns.

An important option for link click triggers is "Wait for Tags." When enabled, GTM briefly delays the link navigation to ensure the tag has time to fire. Set the maximum wait time (default 2000ms) and check "Check Validation" to only wait when the link click would actually navigate the page.

```
Trigger Type: Just Links
Condition: Click URL contains ".pdf"
Wait for Tags: Enabled (2000ms)
Check Validation: Enabled
```

This configuration tracks PDF download clicks while ensuring the tracking tag fires before the browser navigates to the PDF file.

## Custom Event Triggers

Custom Event triggers listen for events pushed to the data layer using `dataLayer.push({'event': 'event_name'})`. They are the most flexible trigger type because they can be triggered by any action your website code defines.

### Setup

1. Create a new trigger and select "Custom Event".
2. Enter the event name exactly as it appears in the data layer push.
3. Optionally enable regex matching to match multiple event names with a pattern.

### Adding Conditions

Custom Event triggers support conditions based on Data Layer Variables. For example, with this data layer push:

```javascript
dataLayer.push({
  'event': 'form_submit',
  'formType': 'contact',
  'formSuccess': true
});
```

You could configure the trigger to fire on the `form_submit` event only when `formType` equals `contact` and `formSuccess` equals `true`. This lets you use a single generic event name with conditions to control which tags fire in different scenarios.

## Visibility and Scroll Triggers

### Element Visibility Trigger

This trigger fires when a specified element becomes visible in the browser viewport. It is useful for tracking whether users see important content like calls to action, pricing sections, or promotional banners.

Configure it with either an Element ID or a CSS Selector, and set the minimum percentage of the element that must be visible (e.g., 50%). You can also set it to fire once per page, once per element, or every time the element becomes visible.

### Scroll Depth Trigger

The Scroll Depth trigger fires when users scroll to specified points on the page. You can set thresholds as percentages (25%, 50%, 75%, 100%) or pixel values. This data reveals how far down the page your content holds attention.

Configure vertical and/or horizontal thresholds and choose whether to fire on all pages or specific pages. The `{{Scroll Depth Threshold}}` built-in variable captures the percentage or pixel value at the point of firing.

## Timer and History Change Triggers

### Timer Trigger

The Timer trigger fires at a set interval after the page loads. Specify the interval in milliseconds and optionally set a limit on the number of times it fires. A common use is tracking engaged time on page:

- Interval: 30000 (30 seconds)
- Limit: 10
- Condition: Page Path contains `/blog/`

This fires every 30 seconds up to 5 minutes, tracking how long users actively stay on blog posts.

### History Change Trigger

The History Change trigger fires when the URL fragment or the HTML5 `pushState` changes. This is critical for Single Page Applications that update the URL without a full page reload. When a user navigates within a SPA, this trigger detects the route change, enabling you to fire pageview or other tags.

The trigger provides the new URL fragment through the `{{New History Fragment}}` and `{{New History State}}` built-in variables.

## Trigger Groups

Trigger Groups let you create a trigger that only fires after multiple other triggers have all fired at least once. This is useful for scenarios where you need to ensure several conditions have been met before executing a tag.

### Example Use Case

You want to fire a "highly engaged user" tag only after a user has scrolled to 75% of the page AND spent at least 60 seconds on the page:

1. Create a Scroll Depth trigger for 75%.
2. Create a Timer trigger for 60000ms (60 seconds) with a limit of 1.
3. Create a Trigger Group that includes both triggers.
4. Attach the Trigger Group to your tag.

The tag fires only when both conditions are satisfied, regardless of the order they occur.

## Trigger Conditions and Blocking Triggers

### Exception Triggers (Blocking)

Exception triggers prevent a tag from firing even when its primary trigger matches. In the tag configuration, you can add an exception trigger under the "Triggering" section by clicking "Add Exception."

Common uses include:
- Blocking tags on internal traffic (exception when IP matches your office IP).
- Preventing tags from firing on staging environments (exception when Page Hostname contains "staging").
- Stopping duplicate tag firing on pages where a more specific tag already fires.

### Condition Best Practices

**Be specific with conditions.** "Page URL contains /shop" will match `/shop`, `/shopping`, `/workshop`, and `/shop/cart`. Use "Page Path equals /shop" for exact matches or "Page URL matches RegEx" for precise patterns.

**Test edge cases.** Your trigger conditions might work for the obvious scenarios but fail on edge cases. What happens if a URL has query parameters? What if the click target is a child element inside the button (like an icon)? Test thoroughly in preview mode.

**Prefer data layer events over DOM-based triggers.** Click and element visibility triggers depend on the DOM structure, which can change with redesigns. Data layer events provide a stable interface that survives front-end changes.

Understanding triggers deeply gives you precise control over when data is collected and sent. Every percentage point of accuracy in your trigger configuration translates directly to more trustworthy analytics data.
