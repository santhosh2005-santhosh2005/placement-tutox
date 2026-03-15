/**
 * Simple verification script for the interview session endpoints
 */

const http = require('http');

// Test data
const createSessionData = {
  userId: 'user123',
  company: 'Google',
  role: 'Software Engineer',
  mode: 'practice',
  strictness: 'medium',
  consent: true
};

console.log('Testing interview session endpoints...');

// Test 1: Create session
const createSessionOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/interviews/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('\n1. Testing session creation...');

const createReq = http.request(createSessionOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log(`Status Code: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS: Session created');
        console.log('Session ID:', response.sessionId);
        
        // Test 2: Fetch questions
        testFetchQuestions(response.sessionId);
      } else {
        console.log('❌ ERROR: Session creation failed');
        console.log('Response:', response);
      }
    } catch (error) {
      console.log('❌ ERROR: Failed to parse response');
      console.log('Raw response:', data);
    }
  });
});

createReq.on('error', (error) => {
  console.log('❌ ERROR: Failed to connect to server');
  console.log('Error details:', error.message);
});

createReq.write(JSON.stringify(createSessionData));
createReq.end();

// Test 2: Fetch questions
function testFetchQuestions(sessionId) {
  console.log('\n2. Testing question fetching...');
  
  const fetchQuestionsData = {
    company: 'Google',
    role: 'Software Engineer',
    difficulty_profile: 'mix'
  };
  
  const fetchQuestionsOptions = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/interviews/${sessionId}/fetch-questions`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const fetchReq = http.request(fetchQuestionsOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`Status Code: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS: Questions fetched');
          console.log('Questions count:', response.questions.length);
          
          // Test 3: Get next question
          testNextQuestion(sessionId);
        } else {
          console.log('❌ ERROR: Question fetching failed');
          console.log('Response:', response);
        }
      } catch (error) {
        console.log('❌ ERROR: Failed to parse response');
        console.log('Raw response:', data);
      }
    });
  });

  fetchReq.on('error', (error) => {
    console.log('❌ ERROR: Failed to connect to server');
    console.log('Error details:', error.message);
  });

  fetchReq.write(JSON.stringify(fetchQuestionsData));
  fetchReq.end();
}

// Test 3: Get next question
function testNextQuestion(sessionId) {
  console.log('\n3. Testing next question endpoint...');
  
  const nextQuestionOptions = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/interviews/${sessionId}/next`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const nextReq = http.request(nextQuestionOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`Status Code: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS: Next question retrieved');
          console.log('Question index:', response.index);
        } else {
          console.log('ℹ️  INFO: Next question endpoint returned', res.statusCode);
          console.log('Response:', response);
        }
        
        // Test 4: Log proctoring events
        testLogEvents(sessionId);
      } catch (error) {
        console.log('❌ ERROR: Failed to parse response');
        console.log('Raw response:', data);
      }
    });
  });

  nextReq.on('error', (error) => {
    console.log('❌ ERROR: Failed to connect to server');
    console.log('Error details:', error.message);
  });

  nextReq.end();
}

// Test 4: Log proctoring events
function testLogEvents(sessionId) {
  console.log('\n4. Testing proctoring event logging...');
  
  const logEventsData = {
    events: [
      {
        type: 'visibility',
        value: 'hidden',
        timestamp: new Date().toISOString()
      }
    ]
  };
  
  const logEventsOptions = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/interviews/${sessionId}/logs`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const logReq = http.request(logEventsOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`Status Code: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS: Proctoring events logged');
        } else {
          console.log('ℹ️  INFO: Proctoring event logging returned', res.statusCode);
          console.log('Response:', response);
        }
        
        console.log('\n🎉 All tests completed!');
      } catch (error) {
        console.log('❌ ERROR: Failed to parse response');
        console.log('Raw response:', data);
      }
    });
  });

  logReq.on('error', (error) => {
    console.log('❌ ERROR: Failed to connect to server');
    console.log('Error details:', error.message);
  });

  logReq.write(JSON.stringify(logEventsData));
  logReq.end();
}