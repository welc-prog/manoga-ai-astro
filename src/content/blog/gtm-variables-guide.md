---
title: "Using Variables in Google Tag Manager"
description: "Master GTM variables: built-in variables, user-defined variables, data layer variables, custom JavaScript variables, and lookup tables for dynamic tag configuration."
date: "2026-02-21"
category: "gtm"
image: "/images/blog/gtm-variables-guide.svg"
author: "Kenneth Abueg"
tags: ["gtm", "variables", "data layer", "javascript", "configuration"]
---

Variables in Google Tag Manager are named placeholders that resolve to values at runtime. They supply dynamic data to your tags and triggers, making it possible to reuse configurations and build flexible tracking setups. Without variables, you would need separate tags for every product name, page category, or transaction value. Variables let you create one tag that adapts based on the current context.

Understanding the different variable types and when to use each one is a core skill for anyone working with GTM.

For Google's official documentation on variables, see [support.google.com/tagmanager/answer/7683362](https://support.google.com/tagmanager/answer/7683362).

## Built-In Variables

GTM comes with a set of pre-configured variables that cover the most common needs. You enable them from the Variables section by clicking "Configure" under Built-In Variables.

### Page Variables

| Variable | Returns |
|----------|---------|
| Page URL | Full URL including protocol, host, path, and query string |
| Page Hostname | Just the hostname (e.g., "www.example.com") |
| Page Path | The path portion of the URL (e.g., "/products/shoes") |
| Referrer | The URL of the previous page |

These are useful for trigger conditions. For example, you might create a trigger that fires only when `Page Path` contains `/checkout`.

### Click Variables

| Variable | Returns |
|----------|---------|
| Click Element | A reference to the DOM element that was clicked |
| Click Classes | The CSS class attribute of the clicked element |
| Click ID | The ID attribute of the clicked element |
| Click Target | The target attribute of a clicked link |
| Click URL | The href attribute of a clicked link |
| Click Text | The visible text content of the clicked element |

Click variables only populate when a Click trigger fires. They are essential for building click-based tracking rules.

### Other Useful Built-Ins

| Variable | Returns |
|----------|---------|
| Container ID | Your GTM container ID (GTM-XXXXXX) |
| Container Version | The published container version number |
| Debug Mode | True when GTM preview mode is active |
| Event | The name of the current data layer event |
| Scroll Depth Threshold | The scroll depth percentage or pixel value |
| Form ID | The ID of a submitted form |

Enable all the built-in variables you expect to use. There is no performance penalty for having them enabled; they only consume resources when actually referenced.

## Data Layer Variables

Data Layer Variables read values from the data layer, which is the structured data your website pushes to GTM. They are the most reliable type of user-defined variable because they draw from a controlled, predictable data source.

### Creating a Data Layer Variable

1. Go to Variables and click "New" under User-Defined Variables.
2. Select "Data Layer Variable".
3. Enter the variable name exactly as it appears in the data layer push.
4. Set the Data Layer Version to Version 2 (default).
5. Name the variable with a clear prefix, such as "DLV - Product Name".

### Accessing Nested Objects

If your data layer push contains nested data:

```javascript
dataLayer.push({
  'event': 'purchase',
  'ecommerce': {
    'transaction_id': 'T-12345',
    'value': 149.99,
    'items': [{
      'item_name': 'Running Shoes',
      'item_category': 'Footwear'
    }]
  }
});
```

Use dot notation to access nested values:
- `ecommerce.transaction_id` returns "T-12345"
- `ecommerce.value` returns 149.99
- `ecommerce.items.0.item_name` returns "Running Shoes"

### Default Values

You can set a default value that the variable returns when the data layer key does not exist. This prevents tags from receiving `undefined` values, which can cause errors in analytics platforms or break tag logic.

## Custom JavaScript Variables

When built-in and data layer variables do not cover your needs, Custom JavaScript variables let you write a JavaScript function that returns a value. The function must be an anonymous function that returns the desired value.

### Basic Example

```javascript
function() {
  return document.title;
}
```

This returns the current page's title element content.

### Practical Examples

**Extract URL parameter:**

```javascript
function() {
  var urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('utm_campaign') || '(not set)';
}
```

**Get word count of the page:**

```javascript
function() {
  var content = document.querySelector('.article-body');
  if (content) {
    return content.textContent.split(/\s+/).length;
  }
  return 0;
}
```

**Calculate time since page load:**

```javascript
function() {
  return Math.round(performance.now() / 1000);
}
```

**Read a cookie:**

```javascript
function() {
  var match = document.cookie.match('(^|;)\\s*user_segment\\s*=\\s*([^;]+)');
  return match ? match[2] : '(not set)';
}
```

### When to Use Custom JavaScript

Use Custom JavaScript variables when:
- The data is not in the data layer and cannot easily be added.
- You need to transform or compute a value from existing data.
- You need to read browser APIs (cookies, localStorage, URL parameters).

Avoid them when a data layer variable would work instead. Data layer variables are more maintainable and less likely to break when the page structure changes.

## Lookup Tables and Regex Tables

Lookup Tables and Regex Tables transform one variable value into another based on a mapping you define. They are like a switch statement for GTM.

### Lookup Table

A Lookup Table takes an input variable and returns a different value based on exact matches:

| Input Variable: {{Page Path}} | Output |
|-------------------------------|--------|
| / | Homepage |
| /products | Product Listing |
| /about | About Us |
| /contact | Contact Page |

Set a default value for paths that do not match any row.

### Regex Table

A Regex Table works similarly but uses regular expressions for matching:

| Pattern (against {{Page URL}}) | Output |
|--------------------------------|--------|
| `/products/[0-9]+` | Product Detail |
| `/blog/.+` | Blog Post |
| `/category/.+` | Category Page |

Regex Tables are more flexible than Lookup Tables and can match patterns rather than exact values. Enable "Full Matches Only" to ensure the entire input must match the pattern, or leave it unchecked to allow partial matches.

### Practical Use Case

You want to send a `content_group` parameter with every GA4 event but your website does not push this to the data layer. Create a Regex Table variable:

- Input Variable: `{{Page Path}}`
- Rows:
  - `^/$` maps to "Homepage"
  - `^/products` maps to "Products"
  - `^/blog` maps to "Blog"
  - `^/support` maps to "Support"
- Default Value: "Other"

Reference this variable in your GA4 configuration tag as a shared event parameter. Every event now includes a content group based on the URL pattern.

## Constant and Google Analytics Settings Variables

### Constant Variable

A Constant variable stores a fixed value. This seems trivial but is useful for values referenced in multiple places, like your GA4 Measurement ID. If your Measurement ID changes, you update it in one variable rather than in every tag.

### Google Analytics Settings Variable (Legacy)

In older Universal Analytics setups, the Google Analytics Settings variable stored shared configuration like tracking ID, cookie domain, and custom dimensions. For GA4, this role is handled by the configuration tag and shared event settings. Mentioning it here because you may encounter it in legacy containers.

## Variable Naming Conventions

A clear naming convention becomes critical as your container grows. A recommended pattern uses a prefix indicating the variable type:

| Prefix | Type | Example |
|--------|------|---------|
| DLV | Data Layer Variable | DLV - Transaction ID |
| CJS | Custom JavaScript | CJS - Word Count |
| LUT | Lookup Table | LUT - Content Group |
| REG | Regex Table | REG - Page Category |
| CON | Constant | CON - GA4 Measurement ID |
| 1P | First Party Cookie | 1P - User Segment |

This convention makes variables self-documenting. When you see `{{DLV - Product Name}}` in a tag, you immediately know it reads from the data layer without needing to open the variable configuration.

## Best Practices

**Enable built-in variables proactively.** Enable all variables you might use, including click and form variables, even if you do not need them yet. When you build a new trigger, having the variables already available saves time.

**Prefer data layer variables over DOM scraping.** Reading from the data layer is reliable and fast. Scraping text from DOM elements is fragile because it breaks when the page design changes.

**Set default values.** Always configure a default value for variables that might return undefined. This prevents tags from sending malformed data and makes debugging easier.

**Test variables in preview mode.** The Variables tab in Tag Assistant shows the resolved value of every variable at each event. Use this to verify your variables return expected values across different pages and interactions.

**Keep Custom JavaScript simple.** If your Custom JavaScript variable is longer than 10-15 lines, consider whether the logic should live in your website code with the result pushed to the data layer instead.

Variables are the connective tissue of a GTM container. They feed dynamic values to tags, power trigger conditions, and enable a single tag configuration to handle hundreds of different scenarios. Investing time in a clean, well-organized variable setup pays off every time you add a new tracking requirement.
