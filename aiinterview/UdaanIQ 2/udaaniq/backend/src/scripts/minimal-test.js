const express = require('express');
const aiInterviewRoutes = require('./routes/aiInterviewRoutes');

const app = express();
app.use(express.json());

// Mount the AI interview routes
app.use('/api/ai-interview', aiInterviewRoutes);

app.listen(3001, () => {
  console.log('Test server running on port 3001');
});

// Test the route
setTimeout(() => {
  const http = require('http');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/ai-interview/start',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

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
}, 1000);