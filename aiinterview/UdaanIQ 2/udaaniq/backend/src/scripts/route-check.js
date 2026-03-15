// Simple script to check if routes are working
const http = require('http');

// Test the main route
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET'
};

console.log('Testing main route...');

const req = http.request(options, (res) => {
  console.log(`Main route status: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log('Main route response:', chunk.toString());
  });
});

req.on('error', (error) => {
  console.log('Main route error:', error.message);
});

req.end();

// Test API health route
setTimeout(() => {
  const healthOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET'
  };

  console.log('Testing API health route...');

  const healthReq = http.request(healthOptions, (res) => {
    console.log(`API health status: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
      console.log('API health response:', chunk.toString());
    });
  });

  healthReq.on('error', (error) => {
    console.log('API health error:', error.message);
  });

  healthReq.end();
}, 1000);

// Test AI interview route
setTimeout(() => {
  const aiOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/ai-interview/start',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  console.log('Testing AI interview route...');

  const aiReq = http.request(aiOptions, (res) => {
    console.log(`AI interview route status: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
      console.log('AI interview response:', chunk.toString());
    });
  });

  aiReq.on('error', (error) => {
    console.log('AI interview error:', error.message);
  });

  aiReq.write(JSON.stringify({
    company: 'Google',
    role: 'Frontend Engineer',
    difficulty: 'medium'
  }));

  aiReq.end();
}, 2000);