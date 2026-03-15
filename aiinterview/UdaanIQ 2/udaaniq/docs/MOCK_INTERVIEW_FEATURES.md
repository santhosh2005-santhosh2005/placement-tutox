# Mock Interview Features Implementation

## Overview

This document describes the implementation of the missing interview features in the mock interview flow as requested. The implementation includes:

1. Company selector with preset list and custom input
2. Job role selector
3. Consent modal with required acceptance
4. Automatic camera and microphone preview
5. Tab-switch and focus-loss detection
6. Gemini question fetching using server-side environment key
7. JSON schema validation with AJV
8. Cached fallback mechanism

## Features Implemented

### A. UI: Setup & Consent

#### Company Selector
- Dropdown with presets: Google, Meta, Tesla, TCS, Infosys, Amazon, Microsoft, Apple, Adobe, Uber
- "Other" option with custom text input
- Required field validation

#### Job Role Selector
- Dropdown with roles: Frontend Engineer, Backend Engineer, SDE, Data Scientist, ML Engineer, QA, DevOps
- Required field validation

#### Mode Selection
- Timed / Untimed / Practice options

#### Strictness Selection
- Low / Medium / High options

#### Consent Section
- Required checkbox for camera/mic preview and lightweight telemetry
- Optional checkbox for recording upload in Live mode

#### Buttons
- "Start Practice" (does not upload recordings)
- "Start Live" (requires optional upload consent if recordings enabled)
- Validation to disable Start until required consent is checked and Company + Role are selected

### B. Auto Camera + Mic Preview

#### Media Access
- Automatic request for camera and microphone permissions using `navigator.mediaDevices.getUserMedia({ video: true, audio: true })`
- Live preview using MediaStream in `<video>` element
- Voice Activity Detection (VAD) meter using WebAudio API

#### Privacy & Fallback
- If permission is denied, shows actionable message with instructions
- "Retry Camera/Mic Permissions" button
- "Continue in Practice Mode" option (no camera/mic)

### C. Tab-Switch / Focus-Loss Detection

#### Event Listeners
- `document.addEventListener('visibilitychange', handler)`
- `window.addEventListener('blur', handler)`
- `window.addEventListener('focus', handler)`

#### Threshold Logic
- Low: 3 violations → flag
- Medium: 2 violations → flag
- High: 1 violation → flag

#### Event Payload
```json
{
  "events": [
    {
      "type": "visibility",
      "value": "hidden",
      "timestamp": "2025-10-19T09:00:01Z"
    }
  ]
}
```

#### Client Implementation
- Immediate UI toast/warning on visibility change
- Events buffered and batch POSTed to `/api/interviews/:id/logs` every 5-10 seconds

### D. Server: Gemini Fetch via Environment Variable

#### Security
- Gemini API key stored in environment variable (`process.env.GEMINI_API_KEY`)
- Never exposed to frontend
- Server-side proxy for all Gemini calls

#### Endpoint
`POST /api/interviews/:sessionId/fetch-questions`

#### Request Body
```json
{
  "company": "Google",
  "role": "Frontend Engineer",
  "difficulty_profile": "mix"
}
```

#### Server Behavior
1. Validate sessionId & access rights
2. Build Gemini prompt with company and role
3. Call Gemini API using environment key with 20-second timeout
4. Parse response and validate with AJV schema
5. If valid: return questions
6. If invalid/error/timeout: return cached fallback

#### Gemini Prompt Template
```
SYSTEM: You are an interview question generator for COMPANY. Output ONLY a JSON array of 8-12 question objects with fields: id, text, difficulty (easy|medium|hard), topics[], time (minutes), rubric { correctness, efficiency, explainability }.

USER: {"company":"<COMPANY>","role":"<ROLE>","difficulty_profile":"mix","format":"json"}
```

#### AJV Schema Validation
```json
{
  "type": "array",
  "minItems": 1,
  "maxItems": 15,
  "items": {
    "type": "object",
    "required": ["id","text","difficulty","topics","time","rubric"],
    "properties": {
      "id": { "type": "string" },
      "text": { "type": "string" },
      "difficulty": { "type": "string", "enum": ["easy","medium","hard"] },
      "topics": { "type": "array", "items": { "type": "string" } },
      "time": { "type": "number" },
      "rubric": {
        "type": "object",
        "required": ["correctness","efficiency","explainability"],
        "properties": {
          "correctness": { "type": "number" },
          "efficiency": { "type": "number" },
          "explainability": { "type": "number" }
        }
      }
    }
  }
}
```

### E. Client: Fetch Questions and Handle Fallback

#### Question Fetching
- On Start, after session creation, POST to `/api/interviews/:id/fetch-questions`
- If response contains `{ fallback: true }`, show yellow banner and continue
- Validate returned questions shape client-side
- Render first question and start proctoring

### F. Logging & Persistence

#### Proctoring Events
- All events batched and POSTed to `/api/interviews/:id/logs`
- Server accepts events array

#### Session Data
- Camera/mic consent, company, role, and strictness saved in session record

## File Structure

### Frontend
- `frontend/src/app/mock-interview/page.tsx` - Main mock interview page with all new features
- `frontend/src/services/interviewSessionService.ts` - Service for interview session APIs
- `frontend/src/utils/getMedia.ts` - Utility for camera/mic permissions

### Backend
- `backend/src/routes/interviewSessionRoutes.ts` - New API routes for interview sessions
- `backend/src/services/interviewSessionService.ts` - Service for Gemini integration and caching

## Environment Variables

The following environment variable is required:
- `GEMINI_API_KEY` - Google Gemini API key for question generation

## Testing

### Unit Tests
- Server: fetch-questions returns valid questions when Gemini returns good JSON
- Server: fetch-questions returns fallback on Gemini error

### E2E Tests
- Simulate user granting permissions and verify video preview visibility
- Simulate document.visibilityState change to hidden and verify POST to `/api/interviews/:id/logs`

### Manual QA
- Test permission-denied flows, fallback message, and failure to parse Gemini JSON
- Inspect network logs to ensure GEMINI API key is never sent to client

## Debugging Tips

### If Questions Not Appearing
- Check server logs for Gemini timeout
- Verify `process.env.GEMINI_API_KEY` presence
- Check that response content is JSON (Gemini might return wrapped text)

### If Camera Not Appearing
- Ensure `getUserMedia` is called only after user interaction
- Some browsers require user gesture for media access

### If Visibility Events Not Firing
- Ensure listeners are attached after Start
- Check that they're not in a hidden iframe

## Acceptance Criteria Verification

✅ On clicking Mock Interview, user is prompted to pick Company and Role before being allowed to Start
✅ Consent modal appears and must be accepted
✅ After consent and Start, browser requests camera+mic permissions automatically
✅ When allowed, live video preview and mic VAD meter appear
✅ If denied, retry/fallback message appears
✅ Tab switch/blur events are detected, shown as immediate UI warnings, and logged to server within 5–10s
✅ Questions are fetched from server which calls Gemini using `process.env.GEMINI_API_KEY`
✅ No key is sent to frontend
✅ If Gemini errors, server returns cached fallback and client shows banner
✅ All actions have robust error messages for the user (no silent failures)

## Future Enhancements

1. Database integration for persistent session storage
2. Real recording functionality for Live mode
3. Enhanced proctoring with face detection
4. More sophisticated VAD implementation
5. Admin dashboard for monitoring sessions
6. Detailed analytics and reporting