// E2E test script for AI HR Interview functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function runE2ETest() {
  try {
    console.log('🚀 Starting AI HR Interview E2E Test...');
    
    // 1. Create interview session
    console.log('\n1️⃣ Creating interview session...');
    const createResponse = await axios.post(`${API_BASE_URL}/api/interview/create`, {
      userId: 'e2e_test_user_123',
      company: 'Microsoft',
      role: 'Frontend Developer',
      mode: 'Practice',
      strictness: 'medium',
      consent: true
    });
    
    console.log('✅ Session created successfully');
    console.log('   Session ID:', createResponse.data.sessionId);
    const { sessionId } = createResponse.data;
    
    // 2. Get first question
    console.log('\n2️⃣ Getting first question...');
    const firstQuestionResponse = await axios.post(`${API_BASE_URL}/api/interview/${sessionId}/next-question`, {
      fetchMode: 'next'
    });
    
    console.log('✅ First question received');
    console.log('   Question:', firstQuestionResponse.data.question.text);
    console.log('   Has audio URL:', !!firstQuestionResponse.data.audioUrl);
    console.log('   Has avatar video URL:', !!firstQuestionResponse.data.avatarVideoUrl);
    console.log('   Fallback used:', firstQuestionResponse.data.fallback);
    
    // 3. Repeat the same question
    console.log('\n3️⃣ Repeating the same question...');
    const repeatQuestionResponse = await axios.post(`${API_BASE_URL}/api/interview/${sessionId}/next-question`, {
      fetchMode: 'repeat'
    });
    
    console.log('✅ Question repeated successfully');
    console.log('   Repeat count:', repeatQuestionResponse.data.repeatCount);
    
    // 4. Save an answer
    console.log('\n4️⃣ Saving an answer...');
    const saveAnswerResponse = await axios.post(`${API_BASE_URL}/api/interview/${sessionId}/save-answer`, {
      questionId: firstQuestionResponse.data.question.id,
      transcript: 'This is a comprehensive answer to the interview question demonstrating my skills and experience.',
      duration: 45
    });
    
    console.log('✅ Answer saved successfully');
    console.log('   Status:', saveAnswerResponse.data.status);
    
    // 5. Get next question
    console.log('\n5️⃣ Getting next question...');
    const nextQuestionResponse = await axios.post(`${API_BASE_URL}/api/interview/${sessionId}/next-question`, {
      fetchMode: 'next'
    });
    
    console.log('✅ Next question received');
    console.log('   Question:', nextQuestionResponse.data.question.text);
    
    // 6. Log some proctoring events
    console.log('\n6️⃣ Logging proctoring events...');
    const logEventsResponse = await axios.post(`${API_BASE_URL}/api/interview/${sessionId}/logs`, {
      events: [
        { type: 'visibility', value: 'hidden', timestamp: new Date().toISOString() },
        { type: 'visibility', value: 'visible', timestamp: new Date().toISOString() },
        { type: 'paste', value: 'detected', timestamp: new Date().toISOString() }
      ]
    });
    
    console.log('✅ Proctoring events logged successfully');
    console.log('   Status:', logEventsResponse.data.status);
    
    console.log('\n🎉 All E2E tests passed! AI HR Interview functionality is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   - Session creation: ✅');
    console.log('   - Question fetching: ✅');
    console.log('   - Question repeating: ✅');
    console.log('   - Answer saving: ✅');
    console.log('   - Proctoring events: ✅');
    
  } catch (error) {
    console.error('\n❌ E2E test failed:', error.response?.data || error.message);
    console.error('   Status code:', error.response?.status);
    process.exit(1);
  }
}

// Run the E2E test
runE2ETest();