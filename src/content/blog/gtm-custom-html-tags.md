---
title: "Custom HTML Tags: Advanced GTM Techniques"
description: "Master Custom HTML tags in GTM for advanced tracking and integrations. Includes security best practices, performance tips, and real-world examples."
date: "2026-03-15"
category: "gtm"
image: "/images/blog/gtm-custom-html-tags.svg"
author: "Kenneth Abueg"
tags: ["gtm", "custom html", "javascript", "advanced", "tracking"]
---

Custom HTML tags are the most powerful and most dangerous feature in [Google Tag Manager](/blog/what-is-gtm). They let you execute arbitrary JavaScript and HTML within your GTM container, opening the door to virtually any tracking implementation, third-party integration, or custom functionality. But that same flexibility means they can introduce security vulnerabilities, [performance issues](/blog/gtm-performance), and hard-to-debug problems if used carelessly.

This guide covers when to use Custom HTML tags, how to write them well, security considerations, and practical examples for common use cases.

For background on GTM tag types, see [support.google.com/tagmanager/answer/6107167](https://support.google.com/tagmanager/answer/6107167).

## When to Use Custom HTML Tags

Custom HTML tags should be your last resort, not your first choice. Use them only when:

- **No native GTM template exists** for the tag you need to deploy. GTM has built-in templates for Google products and a community template gallery for many third-party tools.
- **No community template is available** in the GTM Template Gallery. Always check the gallery before writing custom code.
- **You need custom logic** that no existing template supports, like conditional tracking, data transformation, or complex event handling.
- **A vendor provides a custom code snippet** that must be deployed via JavaScript.

Prefer native and community templates when available. They are sandboxed, tested, and maintained by their creators. Custom HTML tags bypass all sandboxing, which is both their power and their risk.

## Writing Custom HTML Tags

A Custom HTML tag in GTM contains HTML that can include `<script>` tags for JavaScript. The code executes in the context of the page, with full access to the DOM, cookies, and browser APIs.

### Basic Structure

```html
<script>
  (function() {
    // Your code here
    // Wrapped in an IIFE to avoid polluting the global scope
  })();
</script>
```

Always wrap your code in an Immediately Invoked Function Expression (IIFE). This prevents your variables from leaking into the global scope, where they could conflict with other scripts on the page or in other GTM tags.

### Using GTM Variables in Custom HTML

You can reference [GTM variables](/blog/gtm-variables-guide) inside Custom HTML tags using the double curly brace syntax:

```html
<script>
  (function() {
    var userId = {{DLV - User ID}};
    var pageType = {{DLV - Page Type}};
    var measurementId = {{CON - GA4 Measurement ID}};

    console.log('User:', userId, 'Page:', pageType);
  })();
</script>
```

GTM replaces the variable references with their resolved values before the code executes. Be aware that string values need proper quoting. If `{{DLV - User ID}}` returns a string, it will be injected without quotes, so you should handle this:

```html
<script>
  (function() {
    var userId = "{{DLV - User ID}}";
    // Now it is properly quoted as a string
  })();
</script>
```

For values that might be undefined or contain special characters, use a Custom JavaScript variable to safely process the value rather than embedding it directly in the Custom HTML tag.

## Practical Examples

### Loading a Third-Party Script

When a vendor provides a tracking script without a GTM template:

```html
<script>
  (function() {
    if (window._vendorLoaded) return;
    window._vendorLoaded = true;

    var script = document.createElement('script');
    script.src = 'https://cdn.vendor.com/tracker.js';
    script.async = true;
    script.onload = function() {
      if (typeof VendorTracker !== 'undefined') {
        VendorTracker.init('YOUR_ACCOUNT_ID');
      }
    };
    document.head.appendChild(script);
  })();
</script>
```

Key points: the script loads asynchronously to avoid blocking, a guard variable prevents double-loading, and the initialization runs only after the script is loaded.

### Dynamic Event Tracking

Track interactions that GTM's built-in triggers cannot capture:

```html
<script>
  (function() {
    var videoElements = document.querySelectorAll('video');

    videoElements.forEach(function(video) {
      video.addEventListener('play', function() {
        window.dataLayer.push({
          'event': 'video_play',
          'videoSrc': video.currentSrc,
          'videoDuration': Math.round(video.duration)
        });
      });

      video.addEventListener('ended', function() {
        window.dataLayer.push({
          'event': 'video_complete',
          'videoSrc': video.currentSrc
        });
      });
    });
  })();
</script>
```

This tag attaches event listeners to all `<video>` elements on the page and pushes data layer events when videos play or complete. Other GTM tags can then pick up these events through Custom Event triggers.

### Reading and Setting Cookies

```html
<script>
  (function() {
    // Read a cookie
    function getCookie(name) {
      var match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]+)'));
      return match ? match[2] : null;
    }

    // Set a cookie
    function setCookie(name, value, days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/;SameSite=Lax';
    }

    var visitCount = parseInt(getCookie('visit_count') || '0', 10) + 1;
    setCookie('visit_count', visitCount, 365);

    window.dataLayer.push({
      'event': 'visit_tracked',
      'visitCount': visitCount,
      'isNewVisitor': visitCount === 1
    });
  })();
</script>
```

### Conditional Script Loading

Load different scripts based on page conditions:

```html
<script>
  (function() {
    var pageType = "{{DLV - Page Type}}";

    if (pageType === 'product') {
      // Load product recommendation engine
      var script = document.createElement('script');
      script.src = 'https://cdn.recommendations.com/widget.js';
      script.async = true;
      document.head.appendChild(script);
    } else if (pageType === 'support') {
      // Load live chat widget
      var script = document.createElement('script');
      script.src = 'https://cdn.chatprovider.com/chat.js';
      script.async = true;
      document.head.appendChild(script);
    }
  })();
</script>
```

## Security Considerations

Custom HTML tags execute in the same context as your page. A malicious or buggy Custom HTML tag can steal user data, modify page content, or break site functionality.

### Access Control

Limit who can create and edit Custom HTML tags in your GTM container. Use GTM's permission system to restrict "Custom HTML Tag" and "Custom JavaScript Variable" permissions to trusted users. Anyone with these permissions can execute arbitrary code on your website.

### Content Security Policy

If your website implements a Content Security Policy (CSP), Custom HTML tags that load external scripts must comply with it. Scripts loaded from domains not allowed by your CSP will be blocked. Coordinate with your security team when adding new Custom HTML tags that reference external resources.

### Code Review

Treat Custom HTML tags like production code. Before publishing, review the code for:

- **Unexpected external requests.** Does the code load scripts from domains you do not recognize?
- **Data exfiltration.** Does the code send data to endpoints it should not?
- **DOM manipulation.** Does the code modify page content in unexpected ways?
- **Error handling.** Does the code handle failures gracefully, or will a third-party outage break your page?

### Input Sanitization

When using GTM variable values in Custom HTML tags, be aware that these values often come from user-controlled sources (URLs, form inputs, data layer pushes). If you construct HTML strings using these values, you risk injection attacks.

```html
<script>
  (function() {
    // DANGEROUS: Unsanitized variable in string construction
    var name = "{{DLV - User Name}}";
    // If this value comes from user input, it could contain malicious code

    // SAFER: Use textContent instead of innerHTML
    var element = document.querySelector('#greeting');
    if (element) {
      element.textContent = 'Welcome, ' + name;
    }
  })();
</script>
```

## Performance Best Practices

### Load External Scripts Asynchronously

Always use `async = true` when creating script elements. Synchronous script loading blocks the browser's parser and degrades page performance.

### Prevent Duplicate Execution

Use guard variables to ensure a script loads only once, even if the tag fires multiple times:

```html
<script>
  (function() {
    if (window._myTagInitialized) return;
    window._myTagInitialized = true;

    // Initialization code here
  })();
</script>
```

### Use Tag Firing Options

In the tag's Advanced Settings, set "Tag firing options" to "Once per page" for tags that should not execute multiple times. This is simpler and more reliable than manual guard variables for most cases.

### Keep Code Minimal

A Custom HTML tag should do one thing. If your tag is growing beyond 30-40 lines, consider whether the logic should live in your website's codebase instead, with GTM receiving the results through the data layer.

## Debugging Custom HTML Tags

### GTM Preview Mode

In [Preview mode](/blog/gtm-debug-mode), Custom HTML tags show in the Tags Fired section like any other tag. However, you do not see their internal execution details. Use `console.log` statements during development to trace execution flow.

### Browser Console

Check the browser console for JavaScript errors originating from your Custom HTML tags. GTM-injected code runs in the page context, so errors appear in the standard console.

### Try-Catch Wrapping

For production Custom HTML tags, wrap the code in try-catch blocks to prevent errors from propagating:

```html
<script>
  (function() {
    try {
      // Your tag code here
    } catch (e) {
      console.warn('GTM Custom Tag Error:', e.message);
    }
  })();
</script>
```

This ensures that if your Custom HTML tag encounters an error, it fails silently rather than potentially breaking other scripts on the page.

Custom HTML tags are the escape hatch for everything GTM's native features cannot handle. Use them judiciously, write them carefully, and review them regularly. They are the most common source of both GTM's greatest capabilities and its worst problems.
