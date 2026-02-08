---
title: "Google Ads Conversion Tracking with GTM"
description: "Set up Google Ads conversion tracking through GTM: conversion linker, tracking tags, enhanced conversions, and remarketing."
date: "2026-03-05"
category: "gtm"
image: "/images/blog/gtm-google-ads-conversions.svg"
author: "Kenneth Abueg"
tags: ["gtm", "google ads", "conversion tracking", "remarketing", "ppc"]
---

Conversion tracking is the bridge between your Google Ads spend and your business results. Without it, you are spending money on clicks with no visibility into which clicks lead to valuable outcomes. Google Tag Manager makes implementing and managing Google Ads conversion tracking straightforward, and it keeps your tracking flexible as campaigns evolve. Before starting, ensure you have [completed your GTM setup](/blog/gtm-setup-guide).

This guide covers the complete setup: the Conversion Linker tag that makes everything work, individual conversion tracking tags, enhanced conversions for better attribution, and remarketing tags for audience building.

For Google's official GTM conversion tracking documentation, see [support.google.com/tagmanager/answer/6105160](https://support.google.com/tagmanager/answer/6105160).

## The Conversion Linker Tag

Before setting up any conversion tags, you need a Conversion Linker tag. This is a prerequisite that many people skip, leading to broken conversion tracking.

### What It Does

The Conversion Linker tag reads Google Ads click information from the URL (the `gclid` parameter) and stores it in a first-party cookie on your domain. When a conversion happens later, whether minutes or days after the click, the conversion tag reads this cookie to attribute the conversion back to the original ad click.

Without the Conversion Linker, Google Ads cannot reliably connect conversions to clicks, especially across sessions or on browsers that restrict third-party cookies.

### Setting It Up

1. In GTM, create a new tag.
2. Select "Conversion Linker" as the tag type.
3. Set the trigger to "All Pages." The Conversion Linker must fire on every page because you do not know which page a user will land on from an ad.
4. Save and publish.

That is it. No configuration needed beyond the trigger. The tag handles everything automatically.

### Cross-Domain Considerations

If your website spans multiple domains (for example, your main site is on `example.com` but your checkout is on `shop.example.com`), enable the "Enable linking across domains" option in the Conversion Linker tag and add both domains. This ensures the click ID persists across domain boundaries.

## Setting Up Conversion Tracking Tags

Each conversion action in Google Ads needs a corresponding tag in GTM. Typical conversions include purchases, lead form submissions, phone calls, and signups.

### Getting Your Conversion Details

Before creating the tag in GTM, get the conversion details from Google Ads:

1. In Google Ads, go to Goals, then Conversions, then Summary.
2. Click the conversion action you want to track.
3. Click "Tag setup" and select "Use Google Tag Manager."
4. Note the Conversion ID and Conversion Label. You will need both.

### Creating the Conversion Tag

1. In GTM, create a new tag.
2. Select "Google Ads Conversion Tracking" as the tag type.
3. Enter the Conversion ID (format: `AW-XXXXXXXXX`).
4. Enter the Conversion Label.
5. For purchase conversions, configure:
   - **Conversion Value:** Reference a data layer variable (e.g., `{{DLV - Transaction Value}}`).
   - **Currency Code:** The three-letter currency code (e.g., `USD`, `EUR`).
   - **Transaction ID:** Reference a data layer variable for the order ID. This prevents duplicate conversions.
6. Set the trigger to fire on the conversion event. For a purchase, this might be a Custom Event trigger for the `purchase` data layer event. For a form submission, it might fire on the thank-you page URL.

### Purchase Conversion Example

**Data layer push (on confirmation page).** For complete e-commerce tracking setup, see our [e-commerce tracking guide](/blog/gtm-ecommerce-tracking):

```javascript
dataLayer.push({
  'event': 'purchase',
  'transactionId': 'ORD-12345',
  'transactionTotal': 149.99,
  'transactionCurrency': 'USD'
});
```

**GTM tag configuration:**
- Tag Type: Google Ads Conversion Tracking
- Conversion ID: AW-123456789
- Conversion Label: AbCdEfGhIjKlMn
- Conversion Value: `{{DLV - Transaction Total}}`
- Currency Code: `{{DLV - Transaction Currency}}`
- Transaction ID: `{{DLV - Transaction ID}}`
- Trigger: CE - Purchase

### Lead Form Conversion Example

For a lead form where every submission has equal value:

- Tag Type: Google Ads Conversion Tracking
- Conversion ID: AW-123456789
- Conversion Label: XyZaBcDeFgHi
- Conversion Value: 50 (static value representing estimated lead value)
- Currency Code: USD
- Trigger: Custom Event `form_submission` with condition `formId` equals `contact-form`

## Enhanced Conversions

Enhanced conversions improve the accuracy of your conversion measurement by sending hashed first-party customer data (like email address) alongside the conversion tag. This helps Google Ads match conversions to ad interactions even when cookies are unavailable.

### How It Works

When a user completes a conversion, the enhanced conversions feature collects user-provided data (email, phone, name, address), hashes it using SHA-256 in the browser, and sends the hashed data to Google. Google matches this hashed data against its signed-in user data to improve attribution accuracy.

### Setting Up Enhanced Conversions in GTM

1. In your Google Ads Conversion Tracking tag, check the "Include user-provided data from your website" box.
2. Choose how to collect user data:
   - **Automatic collection:** GTM scans the conversion page for form fields and automatically collects available data.
   - **Manual configuration:** You specify exactly which data layer variables or CSS selectors contain the user data.
   - **Code configuration:** You use a data layer push with user data.

**Manual data layer approach:**

```javascript
dataLayer.push({
  'event': 'purchase',
  'transactionId': 'ORD-12345',
  'transactionTotal': 149.99,
  'enhanced_conversion_data': {
    'email': 'user@example.com'
  }
});
```

In GTM, configure the user-provided data to read from the `enhanced_conversion_data.email` data layer variable.

### Privacy Considerations

Enhanced conversions data is hashed before leaving the browser. You never send plaintext personal data to Google through this mechanism. However, you must still have appropriate privacy policies and user consent in place. Ensure your privacy policy discloses the use of hashed identifiers for ad measurement, and respect consent preferences.

## Remarketing Tags

Remarketing tags build audience lists in Google Ads based on user behavior on your website. These audiences can then be targeted with specific ad campaigns.

### Google Ads Remarketing Tag

1. Create a new tag and select "Google Ads Remarketing."
2. Enter your Conversion ID (the same AW- ID from your conversion tags).
3. Set the trigger to "All Pages" for basic remarketing that captures all visitors.
4. Save and publish.

### Dynamic Remarketing

Dynamic remarketing takes this further by passing specific product or service information to Google Ads, enabling ads that show users the exact products they viewed on your site.

**Tag configuration:**
- Tag Type: Google Ads Remarketing
- Conversion ID: AW-123456789
- Custom Parameters: Add dynamic remarketing parameters

**Data layer push for product pages:**

```javascript
dataLayer.push({
  'event': 'view_item',
  'google_tag_params': {
    'ecomm_prodid': 'SKU-12345',
    'ecomm_pagetype': 'product',
    'ecomm_totalvalue': 29.99,
    'ecomm_category': 'Electronics'
  }
});
```

Map these data layer values to the remarketing tag's custom parameters to feed product data into your dynamic remarketing campaigns.

## Testing Conversion Tags

Conversion tags require careful testing because errors directly affect your ad spend optimization.

### GTM Preview Mode

1. Enter Preview mode and navigate to the page where the conversion fires. For complete testing procedures, see our [debug mode guide](/blog/gtm-debug-mode).
2. Trigger the conversion action (submit a form, complete a test purchase).
3. In Tag Assistant, verify:
   - The Conversion Linker tag fired on page load.
   - The conversion tracking tag fired on the conversion event.
   - The tag shows the correct Conversion ID, Label, Value, and Transaction ID.

### Google Ads Tag Diagnostics

In Google Ads, go to your conversion action and check the "Diagnostics" tab. This shows whether Google has received recent conversion pings and whether there are any configuration issues.

### Google Tag Assistant Browser Extension

The Google Tag Assistant legacy extension can show real-time conversion tag firing. Navigate to your conversion page and check that the conversion tag appears with a green status indicator.

### Test Conversions

Create a test conversion in your development or staging environment. After it fires, check Google Ads the next day to see if the conversion appeared. Note that conversions can take several hours to appear in reports.

## Common Mistakes

**Missing Conversion Linker.** Without this tag on every page, your conversions will have poor attribution. This is the most common setup error.

**Firing on page load instead of conversion event.** A conversion tag should fire only when the actual conversion occurs, not on every page view. Double-check your trigger.

**Missing Transaction ID.** Without a unique transaction ID, refreshing the confirmation page creates duplicate conversions, inflating your numbers and misleading your bidding algorithms.

**Static conversion value for variable-value conversions.** If you sell products at different prices, each conversion should pass the actual transaction value, not a flat estimate. This feeds accurate revenue data to smart bidding strategies.

**Not testing enhanced conversions.** Enhanced conversions configuration errors are silent. The tag fires without errors, but the hashed data may not match correctly. Use the enhanced conversions diagnostic tool in Google Ads to verify.

Accurate conversion tracking is the foundation of profitable Google Ads management. It tells the bidding algorithm which clicks are valuable, enables audience building for remarketing, and gives you the data to calculate true return on ad spend. Every minute spent getting this implementation right saves real advertising budget.
