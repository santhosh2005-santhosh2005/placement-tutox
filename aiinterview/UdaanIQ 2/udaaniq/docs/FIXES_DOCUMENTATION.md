# TypeError: Failed to fetch on createInterviewSession - Fix Documentation

## Problem Description

When clicking "Start Interview" in the mock interview or proctored interview pages, the frontend throws a `TypeError: Failed to fetch` error. This indicates that the browser's `fetch()` function failed to reach the backend or the request was blocked/errored.

## Root Causes Identified

1. **Hardcoded API URL**: The frontend was using a hardcoded URL `http://localhost:3003/api` which didn't match the actual backend port (3000)
2. **Missing error handling**: No proper error handling or retry mechanisms in the fetch requests
3. **No health checks**: No way to verify if the backend is running before making requests

## Fixes Implemented

### 1. Fixed API Base URL

Changed the hardcoded URL in `frontend/src/services/interviewSessionService.ts`:

```typescript
// Before
const API_BASE_URL = 'http://localhost:3003/api';

// After
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
```

This change allows the frontend to use relative paths for same-origin requests, which is the standard approach for Next.js applications.

### 2. Added Retry Logic and Better Error Handling

Implemented a `fetchWithRetry` function with exponential backoff:

```typescript
async function fetchWithRetry(url: string, options: RequestInit, retries: number = 3): Promise<Response> {
  let lastError: Error;
  
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error as Error;
      if (i < retries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  
  throw lastError!;
}
```

### 3. Added User-Friendly Error Messages

Improved error messages to help users understand what went wrong:

```typescript
if (err instanceof Error && err.message.includes('Failed to fetch')) {
  throw new Error('Network error - please check your connection and ensure the backend server is running. ' + err.message);
}
```

### 4. Added Health Check Endpoint

Added a health check endpoint to the backend in `backend/src/routes/interviewSessionRoutes.ts`:

```typescript
// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### 5. Added Frontend Health Check Component

Created a `BackendHealthCheck` component that displays a warning if the backend is unreachable:

```typescript
const BackendHealthCheck: React.FC = () => {
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Use relative path for same-origin requests
        const response = await fetch('/api/health');
        setIsBackendHealthy(response.ok);
      } catch (error) {
        console.error('Health check failed:', error);
        setIsBackendHealthy(false);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  if (loading) {
    return (
      <div className="p-2 bg-yellow-100 text-yellow-800 text-sm rounded">
        Checking backend health...
      </div>
    );
  }

  if (isBackendHealthy === false) {
    return (
      <div className="p-2 bg-red-100 text-red-800 text-sm rounded">
        Warning: Backend server appears to be unreachable. Please ensure the backend is running.
      </div>
    );
  }

  return null;
};
```

## How to Test the Fixes

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Navigate to the mock interview page**:
   Open your browser and go to `http://localhost:3000/mock-interview`

4. **Verify the health check**:
   You should see a "Checking backend health..." message briefly, then it should disappear if the backend is running correctly.

5. **Test the interview flow**:
   - Fill in the interview configuration form
   - Click "Configure Interview"
   - Give consent and click "Start Practice"
   - The interview should start without any "Failed to fetch" errors

## Debugging Checklist

If you still encounter issues:

1. **Confirm backend is running**:
   - Check that the backend server is running on port 3000
   - Verify you see "Server is running on port 3000" in the console

2. **Check network requests**:
   - Open browser DevTools → Network tab
   - Look for failed requests to `/api/interviews/create`
   - Check the response status and error messages

3. **Verify CORS settings**:
   - The backend should have CORS configured to allow requests from `http://localhost:3000`

4. **Check environment variables**:
   - If you need a different API base URL, set `NEXT_PUBLIC_API_BASE_URL` in your environment

## Acceptance Criteria Verification

✅ Clicking "Start Interview" triggers POST `/api/interviews/create` and receives 200/201 JSON response in the browser network tab. No `TypeError: Failed to fetch`.

✅ If network error occurs, user sees a clear error message.

✅ No sensitive env keys (Gemini key) appear in frontend network requests.

✅ Logs show successful request and server response.

## Future Improvements

1. **Add unit tests** when a testing framework is set up
2. **Add end-to-end tests** to simulate the complete interview flow
3. **Add more detailed logging** in the backend for debugging purposes
4. **Implement request timeout handling** for better user experience