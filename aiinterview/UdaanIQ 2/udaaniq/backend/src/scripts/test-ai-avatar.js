// Test script for AI Avatar functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testAIAvatar() {
  try {
    console.log('Testing AI Avatar functionality...');
    
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
    
    // 2. Get next question with avatar and audio
    console.log('\n2. Getting next question with avatar and audio...');
    const nextQuestionResponse = await axios.post(`${API_BASE_URL}/api/interview/${sessionId}/next-question`, {
      fetchMode: 'next'
    });
    
    console.log('Next question response:', nextQuestionResponse.data);
    
    // Check if we have the required fields
    if (nextQuestionResponse.data.audioUrl) {
      console.log('✅ Audio URL is present:', nextQuestionResponse.data.audioUrl);
    } else {
      console.log('❌ Audio URL is missing');
    }
    
    if (nextQuestionResponse.data.avatarVideoUrl) {
      console.log('✅ Avatar video URL is present:', nextQuestionResponse.data.avatarVideoUrl);
    } else {
      console.log('❌ Avatar video URL is missing');
    }
    
    console.log('\n🎉 AI Avatar test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAIAvatar();