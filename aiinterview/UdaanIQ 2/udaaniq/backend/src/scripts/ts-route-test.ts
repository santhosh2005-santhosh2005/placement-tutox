import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/ai-interview/start',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Testing AI interview route...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.log('Error:', error.message);
});

req.write(JSON.stringify({
  company: 'Google',
  role: 'Frontend Engineer',
  difficulty: 'medium'
}));

req.end();