/**
 * Simple test script for the AI Interview endpoints
 */

const http = require('http');

console.log('Testing AI Interview endpoints...\n');

// Test 1: Start AI interview session
const startSessionData = {
  company: 'Google',
  role: 'Frontend Engineer',
  difficulty: 'medium'
};

const startSessionOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/ai-interview/start',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('1. Testing AI interview session creation...');

const startReq = http.request(startSessionOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log(`Status Code: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS: AI Interview session created');
        console.log('Session ID:', response.sessionId);
        
        // Test 2: Get next question
        testNextQuestion(response.sessionId);
      } else {
        console.log('❌ ERROR: AI Interview session creation failed');
        console.log('Response:', response);
      }
    } catch (error) {
      console.log('❌ ERROR: Failed to parse response');
      console.log('Raw response:', data);
    }
  });
});

startReq.on('error', (error) => {
  console.log('❌ ERROR: Failed to connect to server');
  console.log('Error details:', error.message);
});

startReq.write(JSON.stringify(startSessionData));
startReq.end();

// Test 2: Get next question
function testNextQuestion(sessionId) {
  console.log('\n2. Testing next question fetch...');
  
  const nextQuestionData = {
    sessionId: sessionId,
    previousAnswers: []
  };
  
  const nextQuestionOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/ai-interview/next-question',
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
          console.log('✅ SUCCESS: Next question fetched');
          console.log('Question:', response.question);
          
          // Test 3: Upload answer
          testUploadAnswer(sessionId, response.questionId || 'q1');
        } else {
          console.log('❌ ERROR: Next question fetch failed');
          console.log('Response:', response);
        }
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

  nextReq.write(JSON.stringify(nextQuestionData));
  nextReq.end();
}

// Test 3: Upload answer
function testUploadAnswer(sessionId, questionId) {
  console.log('\n3. Testing answer upload...');
  
  const uploadAnswerData = {
    sessionId: sessionId,
    questionId: questionId,
    answer: 'This is a test answer for the AI interview question.'
  };
  
  const uploadAnswerOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/ai-interview/upload-answer',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const uploadReq = http.request(uploadAnswerOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`Status Code: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS: Answer uploaded');
          console.log('Response:', response);
          
          // Test 4: End session
          testEndSession(sessionId);
        } else {
          console.log('❌ ERROR: Answer upload failed');
          console.log('Response:', response);
        }
      } catch (error) {
        console.log('❌ ERROR: Failed to parse response');
        console.log('Raw response:', data);
      }
    });
  });

  uploadReq.on('error', (error) => {
    console.log('❌ ERROR: Failed to connect to server');
    console.log('Error details:', error.message);
  });

  uploadReq.write(JSON.stringify(uploadAnswerData));
  uploadReq.end();
}

// Test 4: End session
function testEndSession(sessionId) {
  console.log('\n4. Testing session end...');
  
  const endSessionData = {
    sessionId: sessionId
  };
  
  const endSessionOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/ai-interview/end',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const endReq = http.request(endSessionOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`Status Code: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS: AI Interview session ended');
          console.log('Response:', response);
          console.log('\n🎉 All tests completed successfully!');
        } else {
          console.log('❌ ERROR: Session end failed');
          console.log('Response:', response);
        }
      } catch (error) {
        console.log('❌ ERROR: Failed to parse response');
        console.log('Raw response:', data);
      }
    });
  });

  endReq.on('error', (error) => {
    console.log('❌ ERROR: Failed to connect to server');
    console.log('Error details:', error.message);
  });

  endReq.write(JSON.stringify(endSessionData));
  endReq.end();
}