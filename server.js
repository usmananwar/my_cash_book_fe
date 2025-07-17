const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files with proper headers for PWA
app.use(serveStatic(path.join(__dirname), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    // Set proper MIME type for service worker
    if (path.endsWith('service-worker.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-cache');
    }
    // Set proper MIME type for manifest
    if (path.endsWith('manifest.json')) {
      res.setHeader('Content-Type', 'application/manifest+json');
    }
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // PWA headers
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 PWA is available at: http://localhost:${PORT}`);
});
