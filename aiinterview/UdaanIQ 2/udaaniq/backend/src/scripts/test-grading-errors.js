/**
 * Test script for the robust grading endpoint error handling
 * This script tests various error scenarios for the /grade-answer endpoint
 */

const http = require('http');

// Test 1: Missing required fields
console.log('Test 1: Missing required fields');
const test1Data = {
  question: 'What is JavaScript?',
  // Missing userAnswer and questionType
};

const options1 = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/grade-answer',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req1 = http.request(options1, (res) => {
  let data = '';
  
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Response:', JSON.stringify(response, null, 2));
      
      if (res.statusCode === 400 && response.code === 'MISSING_REQUIRED_FIELDS') {
        console.log('✅ SUCCESS: Correctly handled missing fields');
      } else {
        console.log('❌ ERROR: Did not handle missing fields correctly');
      }
    } catch (error) {
      console.log('❌ ERROR: Failed to parse response');
      console.log('Raw response:', data);
    }
    
    // Run test 2 after this
    runTest2();
  });
});

req1.on('error', (error) => {
  console.log('❌ ERROR: Failed to connect to server');
  console.log('Error details:', error.message);
});

req1.write(JSON.stringify(test1Data));
req1.end();

// Test 2: Empty fields
function runTest2() {
  console.log('\nTest 2: Empty fields');
  const test2Data = {
    question: '',
    userAnswer: '',
    questionType: ''
  };

  const options2 = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/grade-answer',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req2 = http.request(options2, (res) => {
    let data = '';
    
    console.log(`Status Code: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Response:', JSON.stringify(response, null, 2));
        
        if (res.statusCode === 400 && response.code === 'EMPTY_FIELDS') {
          console.log('✅ SUCCESS: Correctly handled empty fields');
        } else {
          console.log('❌ ERROR: Did not handle empty fields correctly');
        }
      } catch (error) {
        console.log('❌ ERROR: Failed to parse response');
        console.log('Raw response:', data);
      }
    });
  });

  req2.on('error', (error) => {
    console.log('❌ ERROR: Failed to connect to server');
    console.log('Error details:', error.message);
  });

  req2.write(JSON.stringify(test2Data));
  req2.end();
}