# Kean Drew Studio Manager

A high-performance, aesthetically pleasing studio management application designed for Kean Drew Studio. Features robust calendar booking, financial pulse tracking, and team management.

## 🚀 Features

- **Dynamic Calendar**: View bookings in Month, Year, and List formats. Click-to-add functionality for rapid scheduling.
- **Financial Pulse**: Real-time revenue, expense, and profit charts using Recharts.
- **Team Management**: Tracking compensation, designations, and payment statuses for studio crew.
- **Security**: Local-first data persistence with Administrative passcode protection (`KEANDREW`).
- **Activity Logs**: Full audit trail of all changes made within the system (Admin only).

## 🛠 Tech Stack

- **Framework**: React 19
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Date Utilities**: date-fns

## 📦 Getting Started

1. Clone the repository.
2. Since this app uses modern ESM `importmap`, you can run it directly using any static web server (e.g., Live Server in VS Code).
3. No build step required for local development.

## 💾 Data Persistence

This app utilizes the browser's `localStorage` to save all studio data. No backend is required, making it highly portable and private. Ensure you export or backup your browser data regularly.

---
© 2025 Kean Drew Studio. All rights reserved.