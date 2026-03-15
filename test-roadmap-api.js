// Simple test script to verify roadmap API connection
const http = require('http');

// Test the backend directly
const backendOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/roadmap/2nd-Year-CSE',
  method: 'GET'
};

console.log('Testing backend API directly...');
const backendReq = http.request(backendOptions, (res) => {
  console.log(`Backend Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Backend Response:', data);
  });
});

backendReq.on('error', (error) => {
  console.error('Backend connection failed:', error.message);
});

backendReq.end();