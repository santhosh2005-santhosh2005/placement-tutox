/**
 * Simple verification script for the robust grading endpoint
 * This script tests the new /grade-answer endpoint functionality
 */

const http = require('http');

// Test data
const testData = {
  question: 'What is JavaScript?',
  userAnswer: 'JavaScript is a programming language used for web development.',
  questionType: 'technical'
};

// Server details (adjust as needed)
const options = {
  hostname: 'localhost',
  port: 3000, // Changed from 3003 to 3000
  path: '/api/grade-answer',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Testing robust grading endpoint...');

// Make request to the endpoint
const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Response:', JSON.stringify(response, null, 2));
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS: Grading endpoint is working');
        if (response.success) {
          console.log('✅ SUCCESS: Response has success flag');
        } else {
          console.log('❌ ERROR: Response missing success flag');
        }
      } else {
        console.log('❌ ERROR: Grading endpoint failed');
        console.log('Error details:', response);
      }
    } catch (error) {
      console.log('❌ ERROR: Failed to parse response');
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ ERROR: Failed to connect to server');
  console.log('Make sure the backend server is running on port 3000');
  console.log('Error details:', error.message);
});

req.write(JSON.stringify(testData));
req.end();