require('dotenv').config();

console.log('Testing environment variables...');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Loaded' : 'Not found');
console.log('GEMINI_API_KEY value:', process.env.GEMINI_API_KEY);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);