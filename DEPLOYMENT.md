# Kean Drew Studio Manager Deployment Guide

This application is designed as a standalone, browser-first tool. All data is automatically persisted in the browser's Local Storage.

## Deployment Steps
1.  **Vercel / Netlify**: Simply link your repository and deploy.
2.  **Configuration**: No Environment Variables or external services are required.
3.  **Framework**: Built with React 19 and Tailwind CSS.

## Features
*   **Automatic Saving**: Every booking and staff update is saved instantly to your browser.
*   **Admin Access**: Use the passcode `KEANDREW` at login to unlock owner-level features like adding staff, deleting logs, and managing financial data.
*   **Offline Ready**: Once loaded, the app functions entirely offline.

## Note on Privacy
Since the data stays in your browser's local storage, clearing your browser cache or switching devices will start the app with a fresh state. For data safety, ensure you don't clear "Site Data" for this domain.