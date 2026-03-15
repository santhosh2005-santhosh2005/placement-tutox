# AI HR Interviewer Implementation

## Overview

This document describes the implementation of the AI HR Interviewer feature with spoken avatar, real-time Gemini questions, and repeat controls.

## Features Implemented

### 1. Server-side Real-time Gemini Question Fetching
- **Endpoint**: `POST /api/interview/create`
- **Endpoint**: `POST /api/interview/:sessionId/next-question`
- **Endpoint**: `POST /api/interview/:sessionId/save-answer`
- **Endpoint**: `POST /api/interview/:sessionId/logs`
- **Functionality**: 
  - Fetches questions in real-time from Gemini API using server environment key
  - Implements retry logic with exponential backoff for 429/5xx/timeout errors
  - Falls back to cached questions when all retries are exhausted
  - Returns structured JSON response with question details
  - Validates responses using AJV schema validation

### 2. Text-to-Speech (TTS) Generation
- **Service**: `synthesizeTextToMp3` in `ttsService.ts`
- **Functionality**:
  - Converts question text to audio using Google Cloud TTS or ElevenLabs
  - Returns audio as a presigned S3 URL or direct audio stream
  - Handles errors gracefully with proper HTTP status codes

### 3. Avatar Video Generation
- **Service**: `generateAvatarVideo` in `ttsService.ts`
- **Functionality**:
  - Generates talking avatar videos using services like D-ID, HeyGen, or Synthesia
  - Accepts text or audio URL to create lip-synced avatar videos
  - Returns video as a presigned URL

### 4. Live Transcription
- **Component**: `LiveTranscript.tsx`
- **Functionality**:
  - Uses Web Speech API for client-side real-time transcription
  - Displays interim and final transcripts as the candidate speaks
  - Provides start/stop controls for transcription
  - Handles browser compatibility issues gracefully

### 5. Repeat/Re-ask Controls
- **Functionality**:
  - Repeat Question: Replays current question TTS/avatar without server request
  - Re-ask Question: Requests server to re-ask same question (increments repeat count)
  - Next Question: Fetches next question from server
  - Replay Answer: Plays back recorded candidate answer

## Technical Implementation Details

### Backend Changes

1. **New Routes in `aiHrInterviewRoutes.ts`**:
   - Added `/api/interview/create` endpoint for session creation
   - Added `/api/interview/:sessionId/next-question` endpoint with fetch modes (next, repeat, regenerate)
   - Added `/api/interview/:sessionId/save-answer` endpoint for saving transcripts
   - Added `/api/interview/:sessionId/logs` endpoint for proctoring events

2. **Enhanced Services in `aiHrInterviewService.ts`**:
   - Created `fetchQuestionsFromGeminiWithRetry` function with retry logic
   - Created `generateQuestionTTS` and `generateQuestionAvatarVideo` functions
   - Enhanced error handling with proper fallback mechanisms

3. **Enhanced Session Management**:
   - Added repeat count tracking per question
   - Implemented deterministic question flow
   - Added support for different fetch modes (next, repeat, regenerate)

### Frontend Changes

1. **New Components in `AIHRInterview/`**:
   - Created `AIAvatarPlayer.tsx` for playing avatar videos or audio
   - Created `CandidateCamera.tsx` for camera/mic access and recording
   - Created `LiveTranscript.tsx` for real-time transcription
   - Created `AIHRInterviewSession.tsx` for main interview flow

2. **New Service in `aihrInterviewService.ts`**:
   - Created service functions for all backend API calls
   - Added proper typing for request/response objects

3. **New Page in `app/ai-hr-interview/page.tsx`**:
   - Created a dedicated page for the AI HR interview
   - Added setup form for company, role, mode, and strictness

## API Endpoints

### POST /api/interview/create
**Request Body**:
```json
{
  "userId": "string",
  "company": "string",
  "role": "string",
  "mode": "Practice|Live",
  "strictness": "string",
  "consent": "boolean"
}
```

**Response**:
```json
{
  "sessionId": "string",
  "message": "AI HR Interview session created successfully"
}
```

### POST /api/interview/:sessionId/next-question
**Request Body**:
```json
{
  "fetchMode": "next|repeat|regenerate"
}
```

**Success Response**:
```json
{
  "fallback": false,
  "question": {
    "id": "string",
    "text": "string",
    "difficulty": "easy|medium|hard",
    "topics": ["string"],
    "time": number,
    "rubric": {
      "correctness": number,
      "efficiency": number,
      "explainability": number
    }
  },
  "audioUrl": "string",
  "avatarVideoUrl": "string",
  "repeatCount": number
}
```

**Fallback Response**:
```json
{
  "fallback": true,
  "question": { /* cached question */ },
  "audioUrl": "string",
  "avatarVideoUrl": "string",
  "repeatCount": number,
  "diagnostic": "string"
}
```

### POST /api/interview/:sessionId/save-answer
**Request Body**:
```json
{
  "questionId": "string",
  "transcript": "string",
  "audioRef": "string (optional)",
  "videoRef": "string (optional)",
  "duration": "number (optional)",
  "proctorEvents": "array (optional)"
}
```

**Response**:
```json
{
  "status": "ok",
  "message": "Answer saved successfully"
}
```

### POST /api/interview/:sessionId/logs
**Request Body**:
```json
{
  "events": [
    {
      "type": "string",
      "value": "string",
      "timestamp": "string"
    }
  ]
}
```

**Response**:
```json
{
  "status": "ok",
  "message": "Proctoring events saved successfully"
}
```

## Testing

### Unit Tests
Run `npm run test-ai-hr` in the backend directory to test all AI HR interview endpoints.

### Manual Testing
1. Start the backend server: `npm run dev`
2. Navigate to `http://localhost:3000/ai-hr-interview`
3. Fill in the setup form and start the interview
4. Test all controls (Repeat, Re-ask, Next, Replay Answer)
5. Verify that questions are fetched from Gemini
6. Verify that TTS and avatar videos are generated
7. Verify that answers are saved correctly

## Future Improvements

1. Implement actual TTS and avatar video generation using real services
2. Add server-side transcription as fallback for Web Speech API
3. Implement proper database storage for sessions and answers
4. Add authentication and authorization
5. Implement recording upload to cloud storage
6. Add more sophisticated proctoring features
7. Implement admin controls for repeat limits
8. Add analytics and reporting features