const API_BASE_URL = 'http://localhost:5010/api';

async function registerAndLogin() {
  try {
    // Register a new user
    console.log('Registering a new user...');
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('Registration successful:', registerData);
      
      // Login with the same user
      console.log('Logging in...');
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('Login successful:', loginData);
      } else {
        console.error('Login failed:', loginResponse.status, await loginResponse.text());
      }
    } else {
      console.error('Registration failed:', registerResponse.status, await registerResponse.text());
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

registerAndLogin();