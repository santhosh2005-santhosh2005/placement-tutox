# Fix Analyzer 404 and Improve Error Handling

## Issue Description
When users click the "Analyze" button, they receive an error: "Could not evaluate answer: Request failed with status code 404". This prevents analysis and blocks the user.

## Root Cause
The session-based grading endpoint (`/api/interviews/:sessionId/grade`) was returning 404 errors when the Gemini API was unreachable or returned errors. The error handling was not providing sufficient context for debugging or user-friendly messages.

## Changes Made

### 1. Enhanced Error Handling in Grading Service
- Added better error logging in [callGemini](file:///c:/Users/santh/Downloads/OneDrive/Desktop/sairamfinal/aiinterview/UdaanIQ%202/udaaniq/backend/src/services/gradingService.ts#L12-L44) function
- Added trace IDs for debugging failed requests
- Improved error messages with more context

### 2. Improved Client-Side Error Handling
- Updated [InterviewAnalyzer.tsx](file:///c:/Users/santh/Downloads/OneDrive/Desktop/sairamfinal/aiinterview/UdaanIQ%202/udaaniq/frontend/src/components/InterviewAnalyzer.tsx) component with better error messages
- Added user-friendly error messages for different error types:
  - Network errors: "Analysis service unavailable. Please try again later or report this issue."
  - Retryable errors: "Analysis temporarily unavailable — try again."
  - Permanent errors: Shows the actual error message from the server
- Added trace IDs to error responses for support

### 3. Report Issue Flow
- Added support report endpoint at `/api/support/reports`
- Auto-attach diagnostic data including:
  - Session ID
  - Question ID
  - Attempted URL
  - Client timestamp
  - Answer excerpt
  - Error details

### 4. Debugging Endpoints (Dev Only)
- Added `/api/debug/routes` to list registered API routes
- Added `/api/debug/grading-errors` to view recent grading errors

### 5. Tests
- Added unit tests for grading routes validation
- Added E2E test for 404 error handling

## Evidence

### Request Details
```
POST /api/interviews/test-session/grade
Content-Type: application/json
Body: {
  "questionId": "q1",
  "answer": "JavaScript is a programming language."
}
```

### Response (Before Fix)
```
Status: 500
Body: {
  "status": "failed",
  "message": "Could not evaluate answer: Request failed with status code 404"
}
```

### Response (After Fix)
```
Status: 500
Body: {
  "status": "failed",
  "message": "Could not evaluate answer: Gemini API error: Request failed with status code 404 (Status: 404)",
  "traceId": "grade-test-session-q1-1700000000000"
}
```

## Verification
1. ✅ Grading endpoint properly handles missing fields (400 errors)
2. ✅ Grading endpoint returns meaningful errors when Gemini API is unreachable
3. ✅ Client shows user-friendly error messages
4. ✅ Report Issue flow captures diagnostic data
5. ✅ Debug endpoints work correctly
6. ✅ Unit tests pass

## How to Test
1. Start the backend server
2. Try to analyze an answer without a valid Gemini API key
3. Observe the improved error message with trace ID
4. Click "Report Issue" to see the diagnostic data

## Future Improvements
1. Implement actual database persistence for evaluations
2. Add Sentry integration for error tracking
3. Implement retry mechanism in the frontend
4. Add more comprehensive E2E tests with Cypress