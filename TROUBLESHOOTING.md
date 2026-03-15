# Troubleshooting "Fail to Fetch" Error During Signup

This document explains how to resolve the "fail to fetch" error that occurs during user registration.

## Common Causes and Solutions

### 1. Backend Server Not Running
**Problem**: The backend API server is not running
**Solution**: 
- Make sure you've started the backend server with `npm run dev` in the backend directory
- Check that the server is running on port 3000
- Verify by visiting http://localhost:3000 in your browser

### 2. CORS Issues
**Problem**: Cross-Origin Resource Sharing restrictions
**Solution**:
- The CORS configuration is already set up to allow requests from localhost:3000
- Make sure you're accessing the frontend through http://localhost:3000 (not 127.0.0.1 or other variations)

### 3. Port Conflicts
**Problem**: Port 3000 is already in use by another application
**Solution**:
- Check if any other applications are using port 3000
- You can change the port in the backend/.env file:
  ```
  PORT=3001
  ```
- Update the API_BASE_URL in frontend/services/api.ts to match the new port:
  ```javascript
  const API_BASE_URL = 'http://localhost:3001/api';
  ```

### 4. Network/Firewall Issues
**Problem**: Firewall or network settings blocking connections
**Solution**:
- Check your firewall settings to ensure localhost connections are allowed
- Try temporarily disabling your firewall to test

### 5. API Endpoint Issues
**Problem**: The registration endpoint is not working correctly
**Solution**:
- Test the endpoint directly using curl or Postman:
  ```bash
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
  ```

## Debugging Steps

1. **Check Browser Console**: Open developer tools (F12) and look at the Console and Network tabs for specific error messages

2. **Verify Services**: Make sure all three services are running:
   - Frontend (Next.js) on http://localhost:3000
   - Backend (Express) on http://localhost:3000
   - AI Tutor (Flask) on http://localhost:5500

3. **Check Backend Logs**: Look at the terminal where you started the backend server for any error messages

4. **Test API Directly**: Try accessing http://localhost:3000/api/auth/register with a POST request to see if the endpoint responds

## Environment Variables

Make sure the following environment variables are set correctly:

**Backend (.env file)**:
```
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**AI Tutor (.env file)**:
```
GOOGLE_API_KEY=your_google_gemini_api_key_here
SERP_API_KEY=your_serp_api_key_here
```

## Still Having Issues?

If you're still experiencing problems:

1. Restart all services in the correct order:
   - Backend first
   - Frontend second
   - AI Tutor third

2. Clear your browser cache and cookies

3. Try using an incognito/private browsing window

4. Check that all required dependencies are installed:
   ```bash
   # In backend directory
   npm install
   
   # In frontend directory
   npm install
   
   # In AI Tutor directory
   pip install -r requirements.txt
   ```