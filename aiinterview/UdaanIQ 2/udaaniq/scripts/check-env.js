#!/usr/bin/env node

// Simple script to check if environment variables are loaded correctly
console.log('Checking environment variables...');

// Check if we're in the backend directory
console.log('Current directory:', process.cwd());

// Check if dotenv is loaded
require('dotenv').config({ path: './backend/.env' });

console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

if (process.env.GEMINI_API_KEY) {
  console.log('GEMINI_API_KEY starts with:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
}

console.log('All env keys:', Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('API') || key.includes('KEY')));