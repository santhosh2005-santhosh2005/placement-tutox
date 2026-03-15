# AI HR Interviewer Feature

## Overview

This feature implements an AI-powered HR interviewer with spoken avatar, real-time Gemini questions, and repeat controls. The system allows candidates to practice interviews with a realistic AI avatar that asks questions out loud, while recording and transcribing their answers.

## Features

- 🤖 **AI Avatar**: Realistic speaking avatar that asks questions out loud with lip-sync animation
- 💬 **Real-time Questions**: Questions fetched from Gemini in real-time
- 🔁 **Repeat Controls**: Repeat current question or re-ask previous questions
- 🎙️ **Live Transcription**: Real-time transcription of candidate answers
- 📹 **Video Recording**: Candidate camera and microphone access
- 🔄 **Deterministic Sessions**: Persistent session state for consistent experience
- 🎧 **Text-to-Speech**: Server-generated audio with fallback to browser TTS
- 🎥 **Avatar Video**: Provider-based avatar videos with static fallback

## Technology Stack

### Backend
- Node.js with Express
- TypeScript
- Google Generative AI (Gemini) for question generation
- Google Cloud Text-to-Speech (TTS) for audio generation
- D-ID/Synthesia for avatar video generation (placeholder implementation)

### Frontend
- Next.js 14 with React Server Components
- TypeScript
- Tailwind CSS for styling
- Web Speech API for transcription

## API Endpoints

### Session Management
- `POST /api/interview/create` - Create a new interview session
- `POST /api/interview/:sessionId/next-question` - Get next/repeat/regenerate question
- `POST /api/interview/:sessionId/save-answer` - Save candidate answer
- `POST /api/interview/:sessionId/logs` - Log proctoring events

### Media Generation
- `POST /api/interview/tts` - Generate TTS audio from text

## Setup Instructions

### Prerequisites
1. Node.js 18+ installed
2. Google Generative AI API key
3. Google Cloud Text-to-Speech credentials (optional for real TTS)
4. D-ID/Synthesia API key (optional for real avatar videos)

### Environment Variables
Create a `.env` file in the backend directory with:

```env
# Server configuration
PORT=3000
NODE_ENV=development

# Google Generative AI (required)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Google Cloud TTS (optional)
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_service_account_key.json

# D-ID/Synthesia (optional)
DID_API_KEY=your_did_api_key_here
```

### Installation
1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Running the Application
1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open your browser to `http://localhost:3001/ai-hr-interview`

## Testing

### Unit Tests
Run unit tests for the AI HR interview routes:
```bash
cd backend
npm run test-ai-hr
```

### E2E Tests
Run end-to-end tests for the complete interview flow:
```bash
cd backend
npm run e2e-ai-hr
```

## Components

### Backend
- `src/routes/aiHrInterviewRoutes.ts` - API endpoints
- `src/services/aiHrInterviewService.ts` - Business logic
- `src/services/ttsService.ts` - Text-to-speech functionality
- `src/tests/aiHrInterviewRoutes.test.ts` - Unit tests

### Frontend
- `src/app/ai-hr-interview/page.tsx` - Main interview page
- `src/components/AIHRInterview/` - Interview components
  - `AIAvatar.tsx` - New AI avatar component with TTS and video fallback
  - `AIAvatarPlayer.tsx` - Original avatar video/audio player (deprecated)
  - `CandidateCamera.tsx` - Camera and recording component
  - `LiveTranscript.tsx` - Real-time transcription
  - `AIHRInterviewSession.tsx` - Main interview session component
- `src/services/aihrInterviewService.ts` - API service layer

## Usage

1. Navigate to the AI HR Interview page
2. Fill in the setup form:
   - Company name
   - Job role
   - Interview mode (Practice/Live)
   - Strictness level
3. Grant camera/microphone permissions
4. Start the interview
5. Listen to the AI avatar ask questions
6. Answer using your voice or type in the text box
7. Use the controls:
   - **Repeat Question**: Replay current question audio/avatar
   - **Re-ask Question**: Request server to re-ask same question
   - **Next Question**: Move to next question
   - **Replay Answer**: Play back your recorded answer
   - **End Interview**: Finish the interview session

## Future Improvements

1. **Real TTS Implementation**: Replace mock TTS with actual Google Cloud TTS
2. **Real Avatar Videos**: Integrate with D-ID or Synthesia for real avatar generation
3. **Server-side Transcription**: Implement Whisper or similar for transcription fallback
4. **Database Storage**: Replace in-memory storage with persistent database
5. **Authentication**: Add user authentication and session management
6. **Recording Upload**: Implement cloud storage for recorded answers
7. **Advanced Proctoring**: Add more sophisticated proctoring features
8. **Analytics Dashboard**: Create admin dashboard for interview analytics

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env`
2. **Port Conflicts**: Change `PORT` in `.env` if 3000 is already in use
3. **Camera/Mic Permissions**: Ensure browser permissions are granted
4. **Module Not Found**: Run `npm install` in both frontend and backend directories

### Testing the API

You can test the API endpoints using curl or Postman:

```bash
# Create session
curl -X POST http://localhost:3000/api/interview/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "company": "Google",
    "role": "Software Engineer",
    "mode": "Practice",
    "strictness": "medium",
    "consent": true
  }'

# Get next question
curl -X POST http://localhost:3000/api/interview/SESSION_ID/next-question \
  -H "Content-Type: application/json" \
  -d '{"fetchMode": "next"}'
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/ai-hr-interview`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m "Add AI HR interview feature"`
6. Push to the branch: `git push origin feature/ai-hr-interview`
7. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.