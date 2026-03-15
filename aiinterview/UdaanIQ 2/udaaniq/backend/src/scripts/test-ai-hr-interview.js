// Test script for AI HR Interview functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testAIHRInterview() {
  try {
    console.log('Testing AI HR Interview functionality...');
    
    // 1. Create interview session
    console.log('\n1. Creating interview session...');
    const createResponse = await axios.post(`${API_BASE_URL}/api/interview/create`, {
      userId: 'test_user_123',
      company: 'Google',
      role: 'Software Engineer',
      mode: 'Practice',
      strictness: 'medium',
      consent: true
    });
    
    console.log('Create session response:', createResponse.data);
    const { sessionId } = createResponse.data;
    
    // 2. Get next question
    console.log('\n2. Getting next question...');
    const nextQuestionResponse = await axios.post(`${API_BASE_URL}/api/interview/${sessionId}/next-question`, {
      fetchMode: 'next'
    });
    
    console.log('Next question response:', nextQuestionResponse.data);
    
    // 3. Repeat the same question
    console.log('\n3. Repeating the same question...');
    const repeatQuestionResponse = await axios.post(`${API_BASE_URL}/api/interview/${sessionId}/next-question`, {
      fetchMode: 'repeat'
    });
    
    console.log('Repeat question response:', repeatQuestionResponse.data);
    
    // 4. Save an answer
    console.log('\n4. Saving an answer...');
    const saveAnswerResponse = await axios.post(`${API_BASE_URL}/api/interview/${sessionId}/save-answer`, {
      questionId: nextQuestionResponse.data.question.id,
      transcript: 'This is a test answer to the interview question.',
      duration: 30
    });
    
    console.log('Save answer response:', saveAnswerResponse.data);
    
    // 5. Log some proctoring events
    console.log('\n5. Logging proctoring events...');
    const logEventsResponse = await axios.post(`${API_BASE_URL}/api/interview/${sessionId}/logs`, {
      events: [
        { type: 'visibility', value: 'hidden', timestamp: new Date().toISOString() },
        { type: 'visibility', value: 'visible', timestamp: new Date().toISOString() }
      ]
    });
    
    console.log('Log events response:', logEventsResponse.data);
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAIHRInterview();