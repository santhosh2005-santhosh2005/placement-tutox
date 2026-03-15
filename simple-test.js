const http = require('http');

// Test if we can reach the backend
const options = {
  hostname: 'localhost',
  port: 5010,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, res => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

// Send a simple test payload
req.write(JSON.stringify({
  name: 'Test User',
  email: 'test2@example.com',
  password: 'password123'
}));

req.end();