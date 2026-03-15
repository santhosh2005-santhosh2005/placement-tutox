#!/usr/bin/env node

// Simple script to check if environment variables are loaded correctly
console.log('Checking environment variables...');

console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
  console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY.length);
  console.log('GEMINI_API_KEY starts with:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
}