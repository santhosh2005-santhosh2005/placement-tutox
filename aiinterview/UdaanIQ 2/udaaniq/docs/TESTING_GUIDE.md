# Testing Guide for TypeError: Failed to fetch Fix

## Overview

This guide explains how to test the fixes for the "TypeError: Failed to fetch" error that was occurring when starting interviews in the UdaanIQ application.

## Prerequisites

1. Node.js installed (v16 or higher)
2. npm or yarn package manager
3. Two terminal windows (one for frontend, one for backend)

## Testing Steps

### 1. Start the Backend Server

Open a terminal and navigate to the backend directory:
```bash
cd backend
npm run dev
```

Verify the server starts successfully:
- You should see "Server is running on port 3000" in the console
- The backend API should be accessible at http://localhost:3000

### 2. Start the Frontend Server

Open a second terminal and navigate to the frontend directory:
```bash
cd frontend
npm run dev
```

Verify the frontend starts successfully:
- You should see the Next.js development server starting
- The frontend should be accessible at http://localhost:3000

### 3. Test the Health Check Endpoint

Open your browser and navigate to:
- http://localhost:3000/api/health

You should see a JSON response like:
```json
{
  "status": "ok",
  "timestamp": "2025-10-19T10:30:45.123Z"
}
```

### 4. Test the Mock Interview Flow

1. Navigate to http://localhost:3000/mock-interview
2. You should see a health check message briefly appear and then disappear
3. Fill in the interview configuration:
   - Select a company (e.g., "Google")
   - Select a job role (e.g., "Frontend Engineer")
   - Leave other settings as default
4. Click "Configure Interview"
5. On the consent page, check the consent box
6. Click "Start Practice"
7. The interview should start without any "Failed to fetch" errors

### 5. Test the Proctored Interview Flow

1. Navigate to http://localhost:3000/proctored-interview
2. You should see a health check message briefly appear and then disappear
3. Fill in the interview configuration:
   - Select a company (e.g., "Google")
   - Select a job role (e.g., "Frontend Engineer")
   - Leave other settings as default
4. Click "Configure Interview"
5. On the consent page, check the consent box
6. Click "Start Interview"
7. The interview should start without any "Failed to fetch" errors

### 6. Test Error Handling

To test the error handling:

1. Stop the backend server (Ctrl+C in the backend terminal)
2. Try to start an interview in either the mock or proctored interview page
3. You should see a warning message:
   "Warning: Backend server appears to be unreachable. Please ensure the backend is running."
4. Restart the backend server
5. The warning should disappear after a moment
6. You should now be able to start interviews successfully

## Troubleshooting

### If you still see "TypeError: Failed to fetch":

1. Check that both frontend and backend servers are running
2. Verify there are no port conflicts (both should use port 3000)
3. Check the browser's Network tab in Developer Tools for failed requests
4. Look for any CORS errors in the console

### If the health check fails:

1. Verify the backend server is running on port 3000
2. Check that the `/api/health` endpoint is accessible
3. Ensure there are no firewall or network issues blocking the connection

### If interviews still fail to start:

1. Check the browser console for specific error messages
2. Verify that all required fields are filled in the interview setup
3. Ensure you've given consent before starting the interview
4. Check that camera/microphone permissions are granted if enabled

## Expected Results

After applying the fixes:

✅ No "TypeError: Failed to fetch" errors when starting interviews
✅ Health check component shows backend status correctly
✅ Interviews start successfully with proper question loading
✅ Error messages are user-friendly and actionable
✅ Retry mechanism handles transient network failures
✅ API calls use relative paths instead of hardcoded URLs

## Additional Testing

For more comprehensive testing, you can:

1. Test with different network conditions (slow connections, intermittent connectivity)
2. Test with browser developer tools' network throttling
3. Verify that the retry mechanism works by temporarily disconnecting and reconnecting the backend
4. Test with different interview configurations (timed vs. untimed, different durations)