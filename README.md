# LinkedinGenAI Chrome Extension

## Description

LinkedinGenAI is a Chrome extension that leverages Generative AI to help users generate responses to comments on LinkedIn. This extension simplifies engagement on LinkedIn by providing AI-powered suggestions for thoughtful and relevant replies.

## Features

- **AI-Powered Response Generation:**  Utilizes GenAI to create contextually appropriate and engaging responses to LinkedIn comments.
- **LinkedIn Integration:** Seamlessly integrates with the LinkedIn platform, working directly within the comment sections.
- **Customizable Options:** Offers options to tailor the generated responses to match user preferences and communication style (though this is based on `options.html` and `options.js` files, and not explicitly stated in the manifest).

## Usage

1.  Install the extension from the Chrome Web Store (once published).
2.  Navigate to any LinkedIn post with comments.
3.  Look for the GenAI response generation feature within the comment section.
4.  Generate and refine AI-suggested responses before posting.

## Manifest Details

- **Name:** LinkedinGenAI
- **Description:** Generates response using GenAI for LinkedIn comments.
- **Version:** 0.1.1

## Permissions

- **Storage:**  Utilizes browser storage to persist user settings and preferences.

## Icons

- Includes an icon (`icon.png`) for browser toolbar and extension management.
- Includes a store icon (`store_icon.png`) likely for Chrome Web Store listing.

## Background Script

- `background.js` handles background tasks and extension lifecycle events.

## Content Script

- `content.js` injects functionality into LinkedIn pages to enable comment response generation.

## Options Page

- `options.html` provides a user interface for configuring extension settings.
- `options.js` handles the logic for the options page.

---

This README provides a basic overview of the LinkedinGenAI Chrome Extension. Further details may be added as the project evolves.
