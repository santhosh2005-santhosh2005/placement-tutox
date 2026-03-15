#!/usr/bin/env node

// Simple script to test the interview session service
const http = require('http');

// Test data
const createRequest = {
  userId: 'test_user_123',
  company: 'Google',
  role: 'Frontend Engineer',
  mode: 'timed',
  strictness: 'medium',
  consent: true
};

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/interviews/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Testing interview session creation...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Interview session created successfully');
      try {
        const response = JSON.parse(data);
        console.log('Response:', response);
        
        if (response.sessionId) {
          console.log('✅ Session ID received:', response.sessionId);
        } else {
          console.log('❌ Session ID missing from response');
        }
      } catch (e) {
        console.log('Response data:', data);
      }
    } else {
      console.log('❌ Interview session creation failed');
      console.log('Response data:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Failed to connect to backend');
  console.log('Error:', error.message);
  console.log('Please make sure the backend server is running on port 3000');
});

req.write(JSON.stringify(createRequest));
req.end();