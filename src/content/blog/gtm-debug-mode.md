---
title: "GTM Debug Mode: Testing Your Setup"
description: "Master GTM's Preview and Debug mode, Tag Assistant, and debugging workflow to catch errors before they reach production and ensure accurate tracking data."
date: "2026-03-01"
category: "gtm"
image: "/images/blog/gtm-debug-mode.svg"
author: "Kenneth Abueg"
tags: ["gtm", "debugging", "preview mode", "tag assistant", "testing"]
---

Publishing untested GTM changes is like deploying code without running it first. It might work, but when it does not, you corrupt your analytics data in ways that are difficult or impossible to fix retroactively. GTM's Preview and Debug mode is your testing environment, and learning to use it effectively is what separates reliable implementations from guesswork.

Debug mode lets you see exactly what happens inside your GTM container in real-time: which tags fire, which do not, what data flows through variables, and what triggers activate on each user interaction.

For the official documentation on GTM Preview mode, see [support.google.com/tagmanager/answer/6107056](https://support.google.com/tagmanager/answer/6107056).

## Entering Preview Mode

To start a debug session:

1. Open your GTM container in the web interface.
2. Click the "Preview" button in the top right corner.
3. A Tag Assistant panel opens. Enter your website URL.
4. Click "Connect".
5. A new browser tab opens with your website, and a "Tag Assistant Connected" badge appears.

The Tag Assistant window shows a timeline of events on the left and detailed information panels on the right. Every GTM event, from the initial container load through user interactions, appears in this timeline.

### Connecting to Specific Pages

You can connect Preview mode to any page on your site, not just the homepage. Enter the full URL of the page you want to test. This is useful when you need to debug tags that only fire on specific pages, like checkout or thank-you pages.

### Sharing Debug Sessions

If you need another team member to see your debug session, share the Tag Assistant URL. They can view the same debug data without having access to your GTM container. This is helpful for coordinating with developers who need to verify data layer pushes.

## Understanding the Tag Assistant Interface

The Tag Assistant interface has several panels that provide different views of your container's behavior.

### The Event Timeline

The left sidebar shows a chronological list of events. Common events include:

- **Consent Initialization:** Fires first, before any tags, to establish consent state.
- **Container Loaded (gtm.js):** The moment GTM initializes on the page.
- **DOM Ready (gtm.dom):** When the HTML document is fully parsed.
- **Window Loaded (gtm.load):** When all page resources have loaded.
- **Click events (gtm.click, gtm.linkClick):** When click triggers fire.
- **Custom events:** Any events pushed to the data layer.
- **History Change:** Route changes in SPAs.

Clicking on any event shows what happened at that moment: which tags fired, which did not, what trigger conditions were evaluated, and what variable values were available.

### Tags Tab

The Tags tab for each event shows two sections:

**Tags Fired:** Tags that successfully executed during this event. Click on any tag to see the data it sent, including the tag type, the trigger that caused it to fire, and the values of all variables used in the tag configuration.

**Tags Not Fired:** Tags that did not execute. This is equally important because it tells you which triggers were evaluated but did not match. Click on a non-fired tag to see why. The trigger conditions are shown with green checkmarks (met) and red X marks (not met), pinpointing exactly which condition prevented the tag from firing.

### Variables Tab

The Variables tab shows the resolved value of every variable at the time of the selected event. This is invaluable for debugging data layer variables, custom JavaScript variables, and lookup tables. If a variable returns "undefined" when you expect a value, this tab immediately reveals the problem.

### Data Layer Tab

The Data Layer tab shows the full state of the data layer after each event. It displays both the message that was pushed (the data layer push for that event) and the current merged state of all data layer values. Use this to verify that your website is pushing the expected data in the expected format.

## A Systematic Debugging Workflow

Random testing catches some issues but misses others. Follow this systematic workflow for thorough validation.

### Step 1: Verify Container Loading

After connecting Preview mode, check that the Container Loaded event appears in the timeline. If it does not, the GTM snippet is not installed correctly on the page. Review our [GTM setup guide](/blog/gtm-setup-guide) for proper installation steps. Common causes include the snippet being in the wrong location, a JavaScript error blocking execution, or a content security policy blocking the GTM script.

### Step 2: Check Configuration Tags

Click on the Container Loaded event and verify that your GA4 configuration tag (or Google Tag) fires. If it does not fire on the initial page load, none of your GA4 event tags will send data.

### Step 3: Walk Through User Flows

Navigate your site as a user would. For each page and interaction:

1. Click on the event in the Tag Assistant timeline.
2. Check which tags fired and which did not.
3. For fired tags, click to verify the data they sent is correct.
4. For non-fired tags, check the trigger conditions to understand why they did not fire.

### Step 4: Test Edge Cases

After the happy path works, test edge cases:

- What happens if you click the back button?
- What happens if you submit a form with invalid data?
- What happens if you click a link that opens in a new tab?
- What happens on a 404 page?
- What happens if you reload the page?
- Do things work on mobile viewport sizes?

### Step 5: Verify Data in GA4 DebugView

GTM Preview mode tells you what GTM sends. GA4 DebugView tells you what GA4 receives. Open DebugView in GA4 (Admin then DebugView) while your Preview session is active. Confirm that events appear in DebugView with correct names and parameters.

## Common Issues and Solutions

### Tag Fires When It Should Not

**Cause:** The [trigger](/blog/gtm-triggers-guide) is too broad. For example, a "Click - All Elements" trigger without conditions fires on every click on the page.

**Fix:** Add conditions to the trigger to narrow it. Use Click Classes, Click ID, or a CSS selector match to target specific elements.

### Tag Does Not Fire

**Cause 1:** The trigger conditions do not match. Open the Tags tab for the relevant event and check which conditions fail.

**Cause 2:** The event that should activate the trigger is not occurring. Check the Data Layer tab to confirm the expected event was pushed.

**Cause 3:** A blocking trigger (exception) is preventing the tag from firing. Check the tag's trigger configuration for any exception triggers.

### Variable Returns Undefined

**Cause 1:** The [data layer](/blog/gtm-data-layer) key does not match the [variable](/blog/gtm-variables-guide) configuration. Data layer variable names are case-sensitive. `formId` is different from `formid`.

**Cause 2:** The data is not yet available when the variable is read. This often happens when a tag fires on Container Loaded but the data layer push occurs later.

**Cause 3:** For Custom JavaScript variables, the function has a syntax error or does not return a value. Check the browser console for JavaScript errors.

### Tag Fires Multiple Times

**Cause:** Multiple triggers are attached to the tag, or a trigger fires more than expected. For example, a History Change trigger combined with a Page View trigger causes a tag to fire twice on SPA navigation.

**Fix:** Review the tag's triggers and ensure they do not overlap. Use the event timeline to identify which triggers caused each firing.

## Advanced Debugging Tips

**Use the browser console.** Type `dataLayer` in the console to see the full data layer contents. This shows you the raw data without GTM's interpretation.

**Filter the event timeline.** Tag Assistant lets you filter events by type. If you are debugging a specific click interaction, filter to show only click events.

**Test with different consent states.** If you use Consent Mode, test your container with different consent configurations. Some tags should fire only after consent is granted, and Preview mode lets you verify this behavior.

**Check the Network tab.** For GA4 tags, open the browser's Network tab and filter for "collect" requests to Google Analytics. The request payload shows exactly what data is sent to GA4, including event name, parameters, and user properties.

**Test cross-browser.** GTM Preview mode works in Chrome, but your users visit from all browsers. While Chrome is the primary testing environment, occasionally verify your implementation works in Firefox and Safari as well.

Debug mode is not a one-time step. Every time you add or modify a tag, trigger, or variable, test it in Preview mode before publishing. The few minutes spent debugging saves hours of investigating corrupted data in your analytics reports.
