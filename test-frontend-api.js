// Test script to simulate frontend API call
import fetch from 'node-fetch';

async function testApiCall() {
  try {
    console.log('Testing frontend API call simulation...');
    
    // This simulates what the frontend is doing
    const API_BASE_URL = 'http://localhost:5000/api';
    const response = await fetch(`${API_BASE_URL}/roadmap/2nd-Year-CSE`);
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Success! Data received:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error in API call:', error.message);
  }
}

testApiCall();