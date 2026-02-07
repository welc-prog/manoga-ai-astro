---
title: "How to Set Up Google Tag Manager from Scratch"
description: "A step-by-step guide to creating a Google Tag Manager account, installing the container snippet on your website, verifying the installation, and deploying your first tag."
date: "2026-02-07"
category: "gtm"
image: "/images/blog/gtm-setup-guide.svg"
author: "Kenneth Abueg"
tags: ["gtm", "setup", "installation", "beginners"]
---

Setting up Google Tag Manager for the first time is one of the highest-leverage tasks in digital analytics. Once the container is installed, your team gains the ability to deploy and manage tracking tags without requiring code changes for every update. This guide walks through the entire process from account creation to your first published tag.

The whole setup typically takes 20 to 30 minutes for a standard website. If you are working with a content management system like WordPress or Shopify, the process is even faster thanks to built-in integrations.

## Step 1: Create Your GTM Account and Container

Start by navigating to [tagmanager.google.com](https://tagmanager.google.com) and signing in with your Google account. If this is your first time, GTM will prompt you to create an account.

**Account setup:**
1. Click "Create Account" in the top right corner.
2. Enter your account name. Use your company or organization name. The account is the top-level organizational unit and can hold multiple containers.
3. Select your country.
4. Enter a container name. This is typically your website domain, like "www.example.com".
5. Select the target platform. For a standard website, choose "Web". GTM also supports iOS, Android, AMP, and Server containers.
6. Accept the Terms of Service and click "Create".

GTM will immediately present you with the container snippet code. This is the code you need to install on your website. Copy it or keep the tab open because you will need it in the next step.

For Google's official setup documentation, see [support.google.com/tagmanager/answer/6103696](https://support.google.com/tagmanager/answer/6103696).

## Step 2: Install the Container Snippet

The GTM container snippet consists of two parts. Both must be placed on every page of your website.

**Part 1: The JavaScript snippet.** This goes as high as possible in the `<head>` section of your HTML:

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
<!-- End Google Tag Manager -->
```

**Part 2: The noscript fallback.** This goes immediately after the opening `<body>` tag:

```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

Replace `GTM-XXXXXX` with your actual container ID.

### Platform-Specific Installation

**WordPress:** Use a plugin like "Insert Headers and Footers" or add the snippets directly to your theme's `header.php` file. If you use a child theme, place it there to prevent updates from overwriting your changes.

**Shopify:** Go to Online Store, then Themes, then Edit Code. Add Part 1 to the `theme.liquid` file inside the `<head>` tag and Part 2 immediately after the `<body>` tag.

**Single Page Applications (React, Vue, Nuxt, Next.js):** Add both snippets to your root HTML file (usually `index.html` or `app.html`). For frameworks with server-side rendering, ensure the snippets are included in the server-rendered output. SPA-specific tracking considerations are covered in a separate guide.

### Important Placement Notes

The `<head>` snippet must be placed as high as possible. Placing it lower in the document means GTM loads later, and you may miss early page interactions. Never place the JavaScript snippet inside the `<body>` tag as it can cause timing issues with triggers.

The `<noscript>` iframe is a fallback for users with JavaScript disabled. While this group is small, including it ensures basic pageview tracking still functions and keeps your implementation complete.

## Step 3: Verify the Installation

Before configuring any tags, verify that the container snippet is correctly installed and loading on your site.

### Method 1: GTM Preview Mode

1. In the GTM interface, click the "Preview" button in the top right corner.
2. Enter your website URL in the dialog that appears and click "Connect".
3. A new browser tab opens with your website, and the Tag Assistant panel appears at the bottom.
4. If the connection is successful, you will see "Tag Assistant Connected" and a summary of the container status.

If the connection fails, the most common causes are that the snippet is not on the page, the container ID is incorrect, or a browser extension is blocking the connection.

### Method 2: Browser Developer Tools

1. Open your website in Chrome.
2. Right-click and select "Inspect" to open Developer Tools.
3. Go to the "Network" tab.
4. Reload the page.
5. Filter by "gtm" in the search bar.
6. You should see a request to `googletagmanager.com/gtm.js?id=GTM-XXXXXX` with a 200 status code.

### Method 3: View Page Source

1. On your website, right-click and select "View Page Source".
2. Search for "GTM-" followed by your container ID.
3. Verify both the `<head>` snippet and the `<body>` noscript snippet are present.

If you find the snippet in only one location, go back and add the missing piece. Both parts are required for a proper installation.

## Step 4: Configure Your First Tag

With the container installed and verified, it is time to add your first tag. The most common starting point is a Google Analytics 4 configuration tag.

### Creating a GA4 Configuration Tag

1. In the GTM interface, click "Tags" in the left sidebar, then "New".
2. Name your tag descriptively, such as "GA4 - Configuration".
3. Click the tag configuration area and select "Google Analytics: GA4 Configuration" (or "Google Tag" in newer GTM versions).
4. Enter your GA4 Measurement ID. It starts with "G-" and can be found in your GA4 property settings under Data Streams.
5. Click the triggering area and select "All Pages". This built-in trigger fires on every page load.
6. Click "Save".

### Testing Before Publishing

Never publish a tag without testing it first. Use GTM's preview mode:

1. Click "Preview" and connect to your site.
2. Navigate around your site in the connected tab.
3. In the Tag Assistant panel, verify your GA4 tag fires on each page load.
4. Check the "Tags Fired" section. Your GA4 configuration tag should appear under "Tags Fired on This Event" for the "Container Loaded" event.
5. If the tag is listed under "Tags Not Fired", check your trigger configuration.

### Publishing

Once you have confirmed the tag fires correctly:

1. Click "Submit" in the top right corner of the GTM interface.
2. Give the version a name and description. Example: "v1 - Initial GA4 setup".
3. Click "Publish".

Your tag is now live. GTM creates a version snapshot so you can always see what was published and roll back if needed.

## Post-Setup Best Practices

**Enable built-in variables.** Go to Variables in the left sidebar and click "Configure" under Built-In Variables. Enable all the variables you might need, including Click Classes, Click ID, Click URL, Form ID, and Page Path. Having these available from the start saves time when creating triggers later.

**Establish a naming convention.** As your container grows, consistent naming becomes critical. A recommended pattern is: `Platform - Type - Detail`. Examples: "GA4 - Event - Add to Cart", "Google Ads - Conversion - Purchase", "Meta - Pixel - PageView". This makes tags easy to find and audit.

**Set up a data layer.** While not required for basic tracking, implementing a data layer early gives you a clean, reliable source of data for your tags. The data layer is a JavaScript object that your website populates with information like page type, user status, product details, and transaction data.

**Create a workspace strategy.** If multiple people will be working in the container, use separate workspaces for different initiatives. This prevents conflicting changes and makes it easier to review and publish specific sets of changes independently.

**Document your setup.** Keep a record of what each tag does, why it was added, and who requested it. This documentation proves invaluable when auditing the container or onboarding new team members.

With the container installed and your first tag published, you have laid the foundation for a scalable, maintainable tracking setup. Every subsequent tag you add follows the same pattern: create the tag, attach a trigger, test in preview mode, and publish. The initial setup is a one-time investment that continues to pay off with every tracking requirement that follows.
