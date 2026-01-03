# Kean Drew Studio Manager

A high-performance, aesthetically pleasing studio management application.

## 🛠 Tech Stack
- **Framework**: React 19 (ESM Native)
- **Styling**: Tailwind CSS
- **Data**: LocalStorage Persistence

## 📦 Getting Started

### Option 1: Zero-Install (Recommended)
This app uses modern Browser ESM. You do not need to install anything. Just open `index.html` using a static server:
- If using VS Code, right-click `index.html` and select **"Open with Live Server"**.
- Or run `npx serve .` in your terminal.

### Option 2: Standard NPM Workflow
If you prefer using npm for local development:
1. Run `npm install` (this will install dependencies for IDE intellisense).
2. Run `npm run dev` to start a local preview server.

## ⚠️ Troubleshooting "npm install" & Runtime Errors

### "Invalid Hook Call" or "Multiple React Instances"
This usually happens if the `importmap` in `index.html` has mismatched versions. 
- **Fix**: Ensure `react` and `react-dom` in the `<script type="importmap">` are pinned to the exact same version (e.g., `19.0.0`). We have pre-configured this for you.

### "No package.json found"
- **Fix**: We have added a `package.json` to the root directory. You can now run `npm install` without errors.

### Local Development Performance
Because this app loads modules directly from `esm.sh`, ensure you have an active internet connection for the first load. After that, your browser will cache the dependencies.

---
© 2025 Kean Drew Studio.