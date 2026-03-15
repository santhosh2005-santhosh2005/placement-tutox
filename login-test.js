const http = require('http');

// Test if we can login
const options = {
  hostname: 'localhost',
  port: 5010,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, res => {
  console.log(`Login Status: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

// Send login payload
req.write(JSON.stringify({
  email: 'test2@example.com',
  password: 'password123'
}));

req.end();