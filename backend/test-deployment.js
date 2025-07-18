const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Luma Gen 2 - Test</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            h1 { font-size: 3rem; margin-bottom: 20px; }
            .status { font-size: 1.5rem; color: #FFD700; }
        </style>
    </head>
    <body>
        <h1>🚀 Luma Gen 2</h1>
        <div class="status">✅ Deployment Test Successful!</div>
        <p>Coming 2025</p>
        <p>Pre-registration system is working!</p>
    </body>
    </html>
  `);
});

app.get('/test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Luma Gen 2 deployment test',
    timestamp: new Date().toISOString()
  });
});

module.exports = app; 