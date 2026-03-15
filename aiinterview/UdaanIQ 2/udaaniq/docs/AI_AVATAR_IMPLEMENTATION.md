# AI Avatar Implementation

## Overview

This document describes the implementation of the AI Avatar feature that displays a realistic avatar and speaks questions aloud using TTS (Text-to-Speech) or avatar provider services.

## Components

### 1. Frontend Component: AIAvatar.tsx

The `AIAvatar` component is responsible for:
- Displaying a visual avatar (either video or static image)
- Playing audio/video content when a question is received
- Providing fallback mechanisms when services fail
- Notifying parent components when speech ends

#### Features:
- **Provider-based avatar playback**: Uses pre-generated avatar videos if available
- **TTS fallback**: Uses browser's SpeechSynthesis API when no audio/video is available
- **Static avatar fallback**: Displays a gradient circle with "AI" text when no video is available
- **Automatic speech end detection**: Calls `onSpeechEnd` callback when speech finishes

#### Props:
- `text`: The question text to be spoken
- `avatarVideoUrl`: URL to a pre-generated avatar video (optional)
- `audioUrl`: URL to a pre-generated audio file (optional)
- `onSpeechEnd`: Callback function called when speech ends

### 2. Backend Implementation

The backend routes in `aiHrInterviewRoutes.ts` handle:
- Generating TTS audio using `synthesizeTextToMp3`
- Generating avatar videos using `generateAvatarVideo`
- Returning both URLs to the frontend

#### API Endpoints:
- `POST /api/interview/create`: Creates a new interview session
- `POST /api/interview/:sessionId/next-question`: Returns next question with audio/video URLs
- `POST /api/interview/:sessionId/save-answer`: Saves candidate answers
- `POST /api/interview/:sessionId/logs`: Logs proctoring events

### 3. Services

#### TTS Service (`ttsService.ts`)
- `synthesizeTextToMp3`: Generates TTS audio from text
- `generateAvatarVideo`: Generates avatar videos from text or audio

#### AI HR Interview Service (`aiHrInterviewService.ts`)
- `generateQuestionTTS`: Wrapper for TTS generation with error handling
- `generateQuestionAvatarVideo`: Wrapper for avatar video generation with error handling

## Implementation Flow

1. **Question Request**: Frontend requests next question from backend
2. **Question Generation**: Backend fetches/generates question from Gemini
3. **Media Generation**: Backend generates TTS audio and avatar video
4. **Response**: Backend returns question with audio/video URLs
5. **Avatar Display**: Frontend displays avatar and plays audio/video
6. **Speech End**: When speech ends, frontend activates microphone for user response

## Fallback Mechanisms

1. **Video → Audio**: If avatar video fails, fallback to audio playback
2. **Audio → TTS**: If pre-generated audio fails, fallback to browser TTS
3. **Static Avatar**: If no video is available, show static gradient avatar

## Testing

Run the AI Avatar test script:
```bash
cd backend
npm run test-ai-avatar
```

This will:
1. Create an interview session
2. Request a question with avatar/audio URLs
3. Verify that URLs are returned correctly

## Usage

The AIAvatar component is used in the AIHRInterviewSession component:

```tsx
<AIAvatar 
  text={currentQuestion?.text || ''} 
  avatarVideoUrl={avatarVideoUrl}
  audioUrl={audioUrl}
  onSpeechEnd={handleAISpeechEnd}
/>
```

When `text` changes, the component automatically:
1. Plays the avatar video if `avatarVideoUrl` is provided
2. Plays the audio if `audioUrl` is provided and no video is available
3. Uses browser TTS as a final fallback
4. Calls `onSpeechEnd` when playback completes

## Error Handling

- All media playback errors are caught and logged
- Fallback mechanisms ensure the user always gets some form of feedback
- Error messages are displayed to the user when appropriate

## Future Improvements

1. **Real TTS Implementation**: Replace mock TTS with actual Google Cloud TTS
2. **Real Avatar Videos**: Integrate with D-ID or Synthesia for real avatar generation
3. **Enhanced Animations**: Add more sophisticated animations to the static avatar
4. **Caching**: Cache generated media to reduce API calls
5. **Language Support**: Add support for multiple languages