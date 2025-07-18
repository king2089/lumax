const express = require('express');
const app = express();

// Simple test route
app.get('/', (req, res) => {
  res.json({
    message: 'Luma Gen 2 Backend is running!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

app.get('/test', (req, res) => {
  res.json({
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// For Vercel deployment
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
  });
} 