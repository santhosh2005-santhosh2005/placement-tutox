#!/usr/bin/env node

// Simple script to verify that the backend is running correctly
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET'
};

console.log('Checking backend health...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('✅ Backend is running and healthy');
    res.on('data', (data) => {
      try {
        const health = JSON.parse(data);
        console.log('Health check response:', health);
      } catch (e) {
        console.log('Response data:', data.toString());
      }
    });
  } else {
    console.log('❌ Backend health check failed');
    res.on('data', (data) => {
      console.log('Response data:', data.toString());
    });
  }
});

req.on('error', (error) => {
  console.log('❌ Backend is not reachable');
  console.log('Error:', error.message);
  console.log('Please make sure the backend server is running on port 3000');
});

req.end();