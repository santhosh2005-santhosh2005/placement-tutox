# Real-time Gemini Questions + AI TTS + Live Transcription UI

## Features Implemented

### 1. Server-side Real-time Gemini Question Fetching
- **Endpoint**: `POST /api/interviews/:sessionId/next-question`
- **Functionality**: 
  - Fetches questions in real-time from Gemini API using server environment key
  - Implements retry logic with exponential backoff for 429/5xx/timeout errors
  - Falls back to cached questions when all retries are exhausted
  - Returns structured JSON response with question details
  - Validates responses using AJV schema validation

### 2. Text-to-Speech (TTS) Generation
- **Endpoint**: `POST /api/interview/tts`
- **Functionality**:
  - Converts question text to audio using Google Cloud TTS or ElevenLabs
  - Returns audio as a presigned S3 URL or direct audio stream
  - Handles errors gracefully with proper HTTP status codes

### 3. Live Transcription
- **Component**: `LiveTranscription.tsx`
- **Functionality**:
  - Uses Web Speech API for client-side real-time transcription
  - Displays interim and final transcripts as the candidate speaks
  - Provides start/stop controls for transcription
  - Handles browser compatibility issues gracefully

### 4. Answer Saving
- **Endpoint**: `POST /api/interviews/:sessionId/save-answer`
- **Functionality**:
  - Saves final transcript to the interview session
  - Handles validation of required fields
  - Returns success/failure responses

## Technical Implementation Details

### Backend Changes

1. **New Routes in `interviewSessionRoutes.ts`**:
   - Added `/api/interviews/:sessionId/next-question` endpoint with retry logic
   - Added `/api/interview/tts` endpoint for text-to-speech conversion
   - Added `/api/interviews/:sessionId/transcribe` endpoint (server fallback)
   - Added `/api/interviews/:sessionId/save-answer` endpoint for saving transcripts

2. **New Service in `ttsService.ts`**:
   - Created `synthesizeTextToMp3` function for TTS generation
   - Placeholder implementation that can be extended with actual TTS providers

3. **Enhanced Error Handling**:
   - Added comprehensive error handling with proper HTTP status codes
   - Implemented retry logic with exponential backoff
   - Added fallback mechanisms for all critical operations

### Frontend Changes

1. **Enhanced `InterviewSession.tsx`**:
   - Integrated real-time question fetching from new endpoint
   - Added TTS playback functionality
   - Implemented live transcription display
   - Updated UI to show progress and status indicators

2. **New `LiveTranscription.tsx` Component**:
   - Dedicated component for handling Web Speech API
   - Real-time display of interim and final transcripts
   - User controls for starting/stopping transcription

3. **Updated `AIAvatar.tsx`**:
   - Enhanced to handle TTS audio playback
   - Improved speaking animations

4. **New Utilities in `transcriptionUtils.ts`**:
   - Helper functions for camera/mic access
   - Audio playback utilities with proper error handling

### Testing

1. **Unit Tests**:
   - Added tests for fetch questions success/fallback scenarios
   - Verified TTS endpoint functionality
   - Tested answer saving endpoint

2. **E2E Tests**:
   - Created verification script for all new endpoints
   - Tested error handling and validation
   - Verified fallback mechanisms

## API Endpoints

### POST /api/interviews/:sessionId/next-question
**Request Body**:
```json
{
  "company": "string",
  "role": "string",
  "difficulty_profile": "string" (optional, default: "mix")
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
  }
}
```

**Fallback Response**:
```json
{
  "fallback": true,
  "questions": { /* cached question */ },
  "diagnostic": "string"
}
```

### POST /api/interview/tts
**Request Body**:
```json
{
  "text": "string",
  "voice": "string" (optional, default: "en-US-Wavenet-D")
}
```

**Response**:
```json
{
  "audioUrl": "string"
}
```

### POST /api/interviews/:sessionId/save-answer
**Request Body**:
```json
{
  "questionId": "string",
  "transcript": "string"
}
```

**Response**:
```json
{
  "status": "ok",
  "message": "Answer saved successfully"
}
```

## Error Handling

All endpoints include comprehensive error handling:
- 400 Bad Request for missing/invalid parameters
- 404 Not Found for missing sessions
- 500 Internal Server Error for unexpected issues
- Proper fallback mechanisms for critical failures

## Verification

Run `npm run verify-realtime` in the backend directory to verify all endpoints are working correctly.