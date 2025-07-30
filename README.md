# My Cash Book Frontend

A Progressive Web App (PWA) for tracking personal finances - credits and debits. This is a static web application that runs entirely in the browser and can be deployed on any static hosting platform.

## 🚀 Features

- **Progressive Web App (PWA)** - Installable on mobile and desktop
- **Responsive Design** - Works on all device sizes
- **Secure Authentication** - JWT-based login system
- **Transaction Management** - Track credits, debits, and edit transactions

## 🛠️ Quick Start

This is a static web application - no installation or build process required!

**Option 1: Direct Browser**
- Download/clone the repository
- Open `index.html` in your web browser

**Option 2: Local Server (Recommended)**
Use any static file server for better functionality:
- **VS Code Live Server** extension
- **Python**: `python -m http.server 8000`
- **Node.js**: `npx http-server -p 3000`
- **PHP**: `php -S localhost:8000`

## 🌐 Deployment

Deploy this static web application on any hosting platform:

- **Static Hosting Services**: Netlify, Vercel, Firebase Hosting
- **Git-based Hosting**: Any platform that serves static files from repositories
- **Traditional Web Hosting**: Upload files to any web server
- **CDN Services**: CloudFlare Pages, AWS S3, etc.

Simply upload all files to your hosting platform - no server configuration needed!

## 📱 PWA Features

- **Installable**: Users can install the app on their devices
- **Offline Support**: Works without internet connection
- **App-like Experience**: Runs like a native mobile/desktop app

## 🔧 Configuration

**API Setup**: Update the backend API URL in `js/common.js`:
```javascript
export const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api'     // Development
    : 'https://your-api-domain.com/api';  // Production
```

**PWA Features**: The app includes offline support via service worker and can be installed on devices.

## 📦 Project Structure

```
├── index.html          # Login page (entry point)
├── html/
│   ├── register.html   # Registration page
│   ├── dashboard.html  # Main dashboard
│   ├── cashbooks.html  # Cashbook management
│   ├── create-cashbook.html # Create new cashbook
│   └── edit-transaction.html # Edit transactions
├── js/                 # JavaScript modules
├── style.css          # Styles
├── manifest.json      # PWA manifest
├── service-worker.js  # Service worker for offline support
├── favicon.ico        # Website icon
├── icon-192x192.png   # PWA icon (192x192)
└── icon-512x512.png   # PWA icon (512x512)
```

**Pure static files** - Ready for immediate deployment on any hosting platform.

---

## 📞 Support

For issues or questions, please create an issue in the repository.