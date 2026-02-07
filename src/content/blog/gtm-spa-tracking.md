---
title: "GTM for Single Page Applications"
description: "Solve the unique tracking challenges of Single Page Applications with GTM, including history change triggers, virtual pageviews, and reliable event tracking for SPA frameworks."
date: "2026-02-27"
category: "gtm"
image: "/images/blog/gtm-spa-tracking.svg"
author: "Kenneth Abueg"
tags: ["gtm", "spa", "single page application", "tracking", "virtual pageviews"]
---

Single Page Applications present unique challenges for Google Tag Manager. Unlike traditional websites where each page navigation triggers a full page reload, SPAs dynamically update the content without reloading. This means the standard GTM pageview trigger, which fires on the initial page load, only fires once per session regardless of how many "pages" the user visits.

If you have ever looked at your analytics for a SPA and seen that virtually every session is a single-page session with a 90% bounce rate, the problem is not user engagement. It is that your tracking does not detect SPA route changes.

For the official history change trigger documentation, see [support.google.com/tagmanager/answer/7679322](https://support.google.com/tagmanager/answer/7679322).

## Why SPAs Break Traditional Tracking

Traditional websites work like this: a user clicks a link, the browser requests a new HTML document from the server, the page loads completely, and GTM fires its pageview triggers. Each navigation is a full HTTP request-response cycle.

SPAs work differently. The initial page load fetches the application shell. After that, navigation is handled by JavaScript. When a user clicks a link, the application updates the URL using the History API (`pushState` or `replaceState`), fetches any needed data asynchronously, and re-renders the content in the browser, all without a full page reload.

From GTM's perspective, only one page ever loaded. The `gtm.js` event fires once, and all subsequent navigations are invisible to standard pageview triggers. This creates several problems:

- **Missing pageviews.** If a user visits five pages in your SPA, analytics shows only one pageview.
- **Incorrect bounce rate.** Every session appears as a single-page session, inflating your bounce rate.
- **Broken event attribution.** Events fire on the initial page URL, not the page the user is actually viewing.
- **No content performance data.** You cannot see which pages drive engagement because most page visits are not recorded.

## The History Change Trigger

GTM's History Change trigger detects when the URL changes via the browser's History API. This is the primary mechanism for tracking SPA navigation.

### How It Works

When a SPA navigates to a new route, it calls `history.pushState()` or `history.replaceState()` to update the URL. GTM detects these API calls and fires the History Change trigger, providing the new URL through built-in variables.

### Configuration

1. Go to Triggers and click "New".
2. Select "History Change" as the trigger type.
3. For most SPAs, leave it set to "All History Changes".
4. Save the trigger.

### Available Variables

When the History Change trigger fires, these built-in variables are populated:
- **New History Fragment:** The URL hash fragment after the change.
- **New History State:** The state object passed to `pushState`.
- **Old History Fragment:** The previous URL hash fragment.
- **Old History State:** The previous state object.
- **History Source:** Whether the change came from `pushState`, `replaceState`, or `popstate`.
- **Page Path:** Updated to reflect the new URL path.
- **Page URL:** Updated to reflect the full new URL.

## Implementing Virtual Pageviews

With the History Change trigger in place, you need to send virtual pageviews to GA4 for each route change.

### GA4 Event Tag for Virtual Pageviews

1. Create a new GA4 Event tag.
2. Event Name: `page_view`.
3. Event Parameters:
   - `page_location`: `{{Page URL}}`
   - `page_title`: `{{Page Title}}` (but see the note below about title timing)
4. Trigger: Attach the History Change trigger.

### The Page Title Timing Issue

When a SPA changes routes, the URL updates immediately via `pushState`, but the document title may update slightly later after the new content renders. If your virtual pageview tag fires immediately on the History Change event, the `{{Page Title}}` variable might still return the previous page's title.

Solutions:

**Option 1: Add a small delay.** Use a Custom HTML tag with a brief `setTimeout` that pushes a custom event after the title has updated:

```html
<script>
  setTimeout(function() {
    dataLayer.push({
      'event': 'spa_pageview',
      'virtualPageTitle': document.title,
      'virtualPageUrl': window.location.href
    });
  }, 100);
</script>
```

Then trigger your GA4 pageview tag on the `spa_pageview` custom event instead of the History Change trigger.

**Option 2: Push from the application.** Have your SPA framework push a data layer event after the route change and content render are complete:

```javascript
// In your router's afterEach hook (Vue Router example)
router.afterEach((to) => {
  nextTick(() => {
    dataLayer.push({
      'event': 'virtual_pageview',
      'pageTitle': document.title,
      'pagePath': to.fullPath
    });
  });
});
```

This is the most reliable approach because it fires after the application has finished rendering the new route.

## Framework-Specific Implementations

### Vue / Nuxt

Vue Router provides navigation guards that are ideal for tracking:

```javascript
// router/index.js or plugin
router.afterEach((to, from) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      'event': 'virtual_pageview',
      'pagePath': to.fullPath,
      'pageTitle': to.meta.title || document.title,
      'previousPath': from.fullPath
    });
  }
});
```

### React / Next.js

For React Router, use the `useLocation` hook:

```javascript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'virtual_pageview',
      'pagePath': location.pathname + location.search,
      'pageTitle': document.title
    });
  }, [location]);

  return null;
}
```

### Angular

Angular's Router events provide detailed navigation tracking:

```typescript
this.router.events.pipe(
  filter(event => event instanceof NavigationEnd)
).subscribe((event: NavigationEnd) => {
  (window as any).dataLayer.push({
    'event': 'virtual_pageview',
    'pagePath': event.urlAfterRedirects,
    'pageTitle': document.title
  });
});
```

## Handling Events in SPAs

Pageviews are not the only tracking concern in SPAs. Event tracking also requires attention.

### The Stale Data Problem

In a SPA, data layer values persist across route changes because the page never reloads. If a user visits a product page and you push product details to the data layer, those values remain when the user navigates to the cart page. Any tag firing on the cart page might pick up stale product data.

**Solution:** Clear relevant data layer values when the route changes:

```javascript
router.afterEach(() => {
  dataLayer.push({
    'event': 'route_change',
    'productName': undefined,
    'productCategory': undefined,
    'ecommerce': null
  });
});
```

### Re-initializing Tags

Some third-party tags expect to initialize on page load and do not handle SPA navigation. Chat widgets, survey tools, and certain ad pixels may need to be re-triggered after route changes.

For these tags, use the History Change trigger (or your custom virtual pageview event) as an additional trigger. Be careful to prevent duplicate initialization. Check whether the tag's script is already loaded before reinitializing.

## GA4 Enhanced Measurement and SPAs

GA4's Enhanced Measurement feature includes a "Page changes based on browser history events" option. When enabled, GA4 automatically sends `page_view` events when the URL changes via the History API.

### Should You Use It?

If you are using the GA4 configuration tag in GTM with Enhanced Measurement enabled, you may get automatic SPA pageview tracking without additional configuration. However, there are trade-offs:

**Pros:**
- Zero additional configuration needed in GTM.
- Works immediately for basic pageview tracking.

**Cons:**
- Same page title timing issue as the History Change trigger.
- Less control over what data accompanies the pageview.
- Cannot add custom parameters to the automatic pageview.
- May conflict with custom virtual pageview implementations.

If you need custom parameters with your pageviews (page type, content group, logged-in status), implement custom virtual pageviews and consider disabling the Enhanced Measurement page change detection to avoid duplicates.

## Testing SPA Tracking

Testing is especially important for SPA tracking because there are more points of failure.

1. **Open GTM Preview mode** and connect to your SPA.
2. **Navigate through multiple routes.** In Tag Assistant, you should see History Change events (or your custom virtual pageview events) appearing in the timeline for each navigation.
3. **Check tag firing.** Your GA4 pageview tag should fire for each route change, not just the initial load.
4. **Verify data accuracy.** Click on each fired tag and confirm the page URL, page title, and any custom parameters reflect the current page, not the initial page.
5. **Test back/forward navigation.** Use the browser's back and forward buttons. These trigger `popstate` events, which the History Change trigger should also detect.
6. **Check GA4 DebugView.** Verify that page_view events arrive with correct page paths for each route change.

SPA tracking requires more upfront work than traditional website tracking, but the investment is essential. Without it, your analytics data fundamentally misrepresents how users interact with your application.
