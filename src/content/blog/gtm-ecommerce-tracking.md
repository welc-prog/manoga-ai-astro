---
title: "E-commerce Tracking with GTM"
description: "Implement GA4 e-commerce tracking through Google Tag Manager, covering product impressions, add to cart, checkout steps, and purchase events with complete data layer examples."
date: "2026-02-23"
category: "gtm"
image: "/images/blog/gtm-ecommerce-tracking.svg"
author: "Kenneth Abueg"
tags: ["gtm", "ecommerce", "ga4", "tracking", "data layer"]
---

E-commerce tracking transforms your analytics from simple pageview counts into a detailed picture of how users interact with your products and complete purchases. With Google Tag Manager and GA4, you can track the full shopping journey from product impressions through to completed transactions, giving you the data needed to optimize every step of the funnel.

Implementing e-commerce tracking requires coordination between your website developers (who push data to the data layer) and your analytics team (who configure GTM to send that data to GA4). This guide covers both sides.

For the official GA4 e-commerce documentation, see [developers.google.com/analytics/devguides/collection/ga4/ecommerce](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce).

## The E-commerce Data Layer Schema

GA4 e-commerce tracking follows a specific data layer schema. Every e-commerce event includes an `ecommerce` object containing event-specific data and an `items` array describing the products involved.

### The Items Array

The `items` array is the core of every e-commerce event. Each item in the array represents a product:

```javascript
{
  'item_id': 'SKU-12345',
  'item_name': 'Wireless Headphones',
  'affiliation': 'Main Store',
  'coupon': 'SUMMER20',
  'discount': 6.00,
  'index': 0,
  'item_brand': 'AudioPro',
  'item_category': 'Electronics',
  'item_category2': 'Audio',
  'item_category3': 'Headphones',
  'item_list_id': 'search_results',
  'item_list_name': 'Search Results',
  'item_variant': 'Black',
  'price': 29.99,
  'quantity': 1
}
```

Not all parameters are required for every event. At minimum, include `item_id` or `item_name` (preferably both), `price`, and `quantity` where applicable.

## Key E-commerce Events

### View Item List (Product Impressions)

Fire this event when products are displayed to the user, such as on category pages, search results, or recommendation widgets:

```javascript
dataLayer.push({ ecommerce: null });
dataLayer.push({
  'event': 'view_item_list',
  'ecommerce': {
    'item_list_id': 'category_electronics',
    'item_list_name': 'Electronics',
    'items': [
      {
        'item_id': 'SKU-001',
        'item_name': 'Wireless Headphones',
        'price': 29.99,
        'item_brand': 'AudioPro',
        'item_category': 'Electronics',
        'index': 0
      },
      {
        'item_id': 'SKU-002',
        'item_name': 'Bluetooth Speaker',
        'price': 49.99,
        'item_brand': 'SoundMax',
        'item_category': 'Electronics',
        'index': 1
      }
    ]
  }
});
```

Note the `ecommerce: null` push before the actual event. This clears any previously stored e-commerce data and prevents contamination between events.

### View Item (Product Detail)

Fire when a user views a product detail page:

```javascript
dataLayer.push({ ecommerce: null });
dataLayer.push({
  'event': 'view_item',
  'ecommerce': {
    'currency': 'USD',
    'value': 29.99,
    'items': [{
      'item_id': 'SKU-001',
      'item_name': 'Wireless Headphones',
      'price': 29.99,
      'item_brand': 'AudioPro',
      'item_category': 'Electronics',
      'item_variant': 'Black',
      'quantity': 1
    }]
  }
});
```

### Add to Cart

Fire when a user adds a product to their shopping cart:

```javascript
dataLayer.push({ ecommerce: null });
dataLayer.push({
  'event': 'add_to_cart',
  'ecommerce': {
    'currency': 'USD',
    'value': 29.99,
    'items': [{
      'item_id': 'SKU-001',
      'item_name': 'Wireless Headphones',
      'price': 29.99,
      'item_brand': 'AudioPro',
      'item_category': 'Electronics',
      'item_variant': 'Black',
      'quantity': 1
    }]
  }
});
```

### Begin Checkout

Fire when a user starts the checkout process:

```javascript
dataLayer.push({ ecommerce: null });
dataLayer.push({
  'event': 'begin_checkout',
  'ecommerce': {
    'currency': 'USD',
    'value': 79.98,
    'coupon': 'SUMMER20',
    'items': [
      {
        'item_id': 'SKU-001',
        'item_name': 'Wireless Headphones',
        'price': 29.99,
        'quantity': 1
      },
      {
        'item_id': 'SKU-002',
        'item_name': 'Bluetooth Speaker',
        'price': 49.99,
        'quantity': 1
      }
    ]
  }
});
```

### Purchase

Fire on the order confirmation page after a successful transaction:

```javascript
dataLayer.push({ ecommerce: null });
dataLayer.push({
  'event': 'purchase',
  'ecommerce': {
    'transaction_id': 'TXN-98765',
    'value': 85.97,
    'tax': 6.99,
    'shipping': 5.99,
    'currency': 'USD',
    'coupon': 'SUMMER20',
    'items': [
      {
        'item_id': 'SKU-001',
        'item_name': 'Wireless Headphones',
        'price': 29.99,
        'quantity': 1
      },
      {
        'item_id': 'SKU-002',
        'item_name': 'Bluetooth Speaker',
        'price': 49.99,
        'quantity': 1
      }
    ]
  }
});
```

The `transaction_id` is required for the purchase event. It must be unique for every transaction to prevent duplicate counting. GA4 uses this value for deduplication.

## GTM Configuration

### Creating E-commerce Event Tags

For each e-commerce event, create a GA4 Event tag in GTM:

1. **Tag Type:** Google Analytics: GA4 Event
2. **Event Name:** Use the exact GA4 recommended event name (e.g., `view_item`, `add_to_cart`, `purchase`)
3. **E-commerce Data:** Check the "Send Ecommerce data" checkbox. Set the Data source to "Data Layer". This tells GTM to automatically read the `ecommerce` object from the data layer and send it with the event.
4. **Trigger:** Create a Custom Event trigger for each data layer event name.

### Trigger Setup

Create a Custom Event trigger for each e-commerce event:

| Trigger Name | Event Name |
|-------------|------------|
| CE - View Item List | view_item_list |
| CE - View Item | view_item |
| CE - Add to Cart | add_to_cart |
| CE - Begin Checkout | begin_checkout |
| CE - Purchase | purchase |

### Additional E-commerce Events

Beyond the core funnel, consider tracking:

- **remove_from_cart:** When a user removes an item from the cart.
- **add_shipping_info:** When shipping details are entered.
- **add_payment_info:** When payment method is selected.
- **select_item:** When a user clicks on a product in a list.
- **view_cart:** When a user views their cart page.
- **select_promotion:** When a user clicks on an internal promotion.

Each follows the same pattern: push to data layer with an `ecommerce` object, create a GTM trigger, and configure a GA4 Event tag.

## Testing E-commerce Tracking

E-commerce tracking has more moving parts than standard event tracking, so thorough testing is essential.

### Step 1: Verify Data Layer Pushes

Before touching GTM, confirm your website pushes correct data. In the browser console, type `dataLayer` and browse through the entries. Check that:
- The `ecommerce` object is present for each event.
- `items` arrays contain complete product data.
- `currency` is included (GA4 requires it for revenue reporting).
- `transaction_id` is unique and present for purchase events.
- Numeric values (`price`, `value`, `quantity`) are numbers, not strings.

### Step 2: Test in GTM Preview Mode

Connect Tag Assistant to your site and walk through the shopping flow. For each e-commerce event:
- Verify the correct tag fires.
- Click on the tag to inspect the sent data.
- Confirm all parameters and item data are correct.

### Step 3: Verify in GA4 DebugView

GA4 DebugView shows e-commerce events with their parameters. Click on an event like `purchase` to see the items, transaction ID, and revenue value. This confirms GA4 receives and processes the data correctly.

### Step 4: Check GA4 Monetization Reports

After publishing your tags and generating some real traffic, check the GA4 Monetization reports. You should see revenue data, product performance, and funnel visualization if you have implemented all the checkout steps.

## Common Pitfalls

**Missing currency.** GA4 requires the `currency` parameter for any event that includes a `value`. Without it, revenue data will not appear in your reports.

**String values instead of numbers.** Product prices and quantities must be numbers. Pushing `"29.99"` as a string instead of `29.99` as a number can cause calculation errors.

**Not clearing the ecommerce object.** Always push `{ ecommerce: null }` before each e-commerce event. Without this, previous item data can persist and contaminate subsequent events.

**Duplicate purchases.** Ensure the purchase event only fires once per transaction. If a user refreshes the confirmation page, the event should not fire again. Use server-side logic or a cookie check to prevent duplicates.

**Incomplete item data.** Missing `item_id` or `item_name` values mean GA4 cannot attribute revenue to specific products. Validate that every item in the array has these required fields.

E-commerce tracking is the highest-value implementation in most GTM containers. It connects user behavior directly to revenue, enabling data-driven decisions about product placement, pricing, promotions, and the checkout experience.
