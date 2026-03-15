const axios = require('axios');

async function testModels() {
  try {
    const GEMINI_API_KEY = 'AIzaSyCIMYcvjt54p9FsgBYSri7IokZUrFkOhWU';
    const MODELS_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    
    const response = await axios.get(MODELS_URL, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Available models:');
    response.data.models.forEach(model => {
      console.log(`- ${model.name}: ${model.displayName} (${model.description})`);
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testModels();