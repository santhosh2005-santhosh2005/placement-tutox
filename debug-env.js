// Debug script to check environment variables
console.log('Checking environment variables...');

// Simulate what the frontend does
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
console.log('API_BASE_URL:', API_BASE_URL);

// Test URL construction
const year = '2nd-Year-CSE';
const url = `${API_BASE_URL}/roadmap/${year}`;
console.log('Constructed URL:', url);