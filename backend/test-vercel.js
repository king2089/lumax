// Test script for Vercel deployment
const https = require('https');

const testVercelEndpoint = (baseUrl) => {
  console.log(`🧪 Testing Vercel endpoint: ${baseUrl}`);
  
  const testEndpoints = [
    '/v1/health',
    '/v1/updates/check',
    '/v1/updates/gen2',
    '/v1/updates/strip-club'
  ];
  
  testEndpoints.forEach(endpoint => {
    const url = `${baseUrl}${endpoint}`;
    console.log(`\n📡 Testing: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        console.log(`📄 Response: ${data.substring(0, 200)}...`);
      });
    }).on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
    });
  });
};

// Replace with your actual Vercel URL
const VERCEL_URL = 'https://luma-go.vercel.app';

if (require.main === module) {
  testVercelEndpoint(VERCEL_URL);
}

module.exports = { testVercelEndpoint }; 