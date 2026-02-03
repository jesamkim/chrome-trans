# Privacy Policy for Translation Assistant

**Last updated: February 3, 2026**

## Overview

Translation Assistant is a Chrome Extension that provides web page translation using Amazon Bedrock Claude Haiku 4.5. This privacy policy explains what data we collect, how we use it, and your rights.

## Data Collection

This extension collects and processes the following data:

### 1. Amazon Bedrock API Key
- **What**: Your personal Amazon Bedrock API Key
- **Where stored**: Locally in your browser using Chrome Storage Sync API
- **Purpose**: To authenticate with Amazon Bedrock API for translation services

### 2. Text Content
- **What**: Text from web pages that you choose to translate
- **Where stored**: Not stored. Sent directly to Amazon Bedrock and immediately discarded after translation
- **Purpose**: To provide translation services

## Data Usage

### API Key
- Used solely to authenticate with Amazon Bedrock API (us-west-2 region)
- Stored locally in your browser
- May sync across your devices if Chrome Sync is enabled
- Never sent to any server other than Amazon Bedrock
- Never shared with third parties

### Translation Text
- Sent to Amazon Bedrock Claude Haiku 4.5 API for translation processing
- Processed in real-time and not stored by this extension
- Subject to Amazon's data processing policies

## Data Sharing

We share data only with:
- **Amazon Bedrock API** (us-west-2): For translation processing only

We do NOT:
- Store your translations on any server
- Share data with advertisers
- Use analytics or tracking
- Collect personal information beyond the API Key

## Data Storage

- **Local Storage**: API Key is stored using Chrome's secure Storage Sync API
- **No Server-Side Storage**: This extension does not operate any backend servers
- **Sync**: If you use Chrome Sync, your API Key may sync across your signed-in devices

## Data Security

- API Key is stored securely using Chrome's built-in storage mechanisms
- All communications with Amazon Bedrock use HTTPS encryption
- No data is transmitted to servers other than Amazon Bedrock

## Your Rights

You have the right to:
- **Access**: View your stored API Key in the extension settings
- **Delete**: Remove all data by uninstalling the extension
- **Control**: Choose what text to translate (full page or selected text only)

## Third-Party Services

This extension relies on:
- **Amazon Bedrock**: Translation processing (subject to [AWS Privacy Policy](https://aws.amazon.com/privacy/))

## Children's Privacy

This extension is not directed at children under 13 and does not knowingly collect data from children.

## Changes to This Policy

We may update this policy occasionally. Changes will be posted on this page with an updated "Last updated" date.

## Open Source

This extension is open source. You can review the code at:
https://github.com/jesamkim/chrome-trans

## Contact

For questions or concerns about this privacy policy:
- GitHub Issues: https://github.com/jesamkim/chrome-trans/issues
- GitHub Repository: https://github.com/jesamkim/chrome-trans

## Permissions Explanation

This extension requires the following Chrome permissions:

- **activeTab**: Access the current tab to extract and translate text
- **storage**: Store your API Key and settings locally
- **scripting**: Inject translation functionality into web pages
- **contextMenus**: Add "Translate Selection" to right-click menu
- **host permissions (all_urls)**: Enable translation on any website you visit

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
