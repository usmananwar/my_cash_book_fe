# My Cash Book Frontend

A Progressive Web App (PWA) for tracking personal finances - credits and debits.

## 🚀 Features

- **Progressive Web App (PWA)** - Installable on mobile and desktop
- **Offline Support** - Works without internet connection
- **Responsive Design** - Works on all device sizes
- **Secure Authentication** - JWT-based login system
- **Transaction Management** - Track credits, debits, and edit transactions

## 🛠️ Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Or for production mode:
   ```bash
   npm start
   ```

4. Open your browser and visit `http://localhost:3000`

## 🌐 Deployment on Render

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables:**
   - Update the API_BASE URL in `common.js` with your backend URL
   - Set NODE_ENV to "production"

### Option 2: Manual Setup

1. **Create a new Web Service on Render**
2. **Configure the service:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
   - **Node Version:** `18` or higher

3. **Environment Variables:**
   ```
   NODE_ENV=production
   ```

4. **Update API URL:**
   - Edit `common.js` and replace the production API URL with your backend service URL

### Important Notes for Production

- **Backend URL**: Update the production API URL in `common.js`
- **HTTPS**: Render provides HTTPS by default
- **Custom Domain**: You can configure a custom domain in Render settings
- **Automatic Deploys**: Enable automatic deploys from your main branch

## 📱 PWA Installation

Once deployed, users can install the app on their devices:
- **Desktop**: Click the install button in the browser
- **Mobile**: Use "Add to Home Screen" option

## 🔧 Configuration

### API Configuration
The app connects to a backend API. Update the API_BASE URL in `common.js`:

```javascript
export const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'https://192.168.0.17:8080/api'  // Development
    : 'https://your-backend-app.onrender.com/api';  // Production
```

### Service Worker
The app includes a service worker for offline functionality. It's automatically registered and provides caching for better performance.

## 📦 Project Structure

```
├── index.html          # Login page
├── register.html       # Registration page
├── dashboard.html      # Main dashboard
├── credit.html         # Add credit transactions
├── debit.html          # Add debit transactions
├── edit-transaction.html # Edit existing transactions
├── *.js               # JavaScript modules
├── style.css          # Styles
├── manifest.json      # PWA manifest
├── service-worker.js  # Service worker for offline support
├── server.js          # Express server for production
└── render.yaml        # Render deployment configuration
```

## 🚀 Live Demo

Once deployed, your app will be available at:
`https://your-app-name.onrender.com`

## 📞 Support

For issues or questions, please create an issue in the repository.