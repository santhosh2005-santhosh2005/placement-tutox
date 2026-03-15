# Proctored Interview Feature Documentation

## Overview

The Proctored Interview feature provides a realistic, company-specific interview experience with advanced proctoring capabilities. It integrates with Google's Gemini API to generate role-specific questions and evaluate candidate responses.

## Features

### 1. Interview Setup
- Company selection (Google, Facebook, Tesla, etc.)
- Job role selection (Frontend Engineer, Backend Engineer, etc.)
- Experience level configuration
- Interview mode options (Timed, Untimed, Behavioral, System Design)
- Interview duration options (30 minutes, 1 hour, 1.5 hours, 2 hours) for Timed mode
- Proctoring strictness levels (Low, Medium, High)
- Camera and microphone enable/disable options
- Practice vs. Live mode

### 2. Real-time Question Generation
- Dynamic question fetching from Gemini API based on company and role
- Questions include difficulty tags, topics, time allocations, and rubrics
- Fallback to cached questions when API is unavailable

### 3. Interview Flow
- Left-side progress rail with question index and time remaining
- Proctoring status indicators (green/yellow/red)
- Question display with suggested time allocation
- Answer submission interface
- Timer for timed interviews

### 4. Proctoring & Anti-Cheat Mechanisms
- Tab visibility detection using Page Visibility API
- Window focus/blur tracking
- Camera monitoring for face presence
- Microphone monitoring for voice activity
- Paste event tracking
- AI-generated content detection
- Suspicious pattern analysis

### 5. Scoring & Reporting
- Automated answer scoring using Gemini API
- Skill-based analysis
- Proctoring incident summary
- Personalized recommendations
- Skill gap identification

### 6. UI/UX Design
- Material 3 design principles
- Consistent color scheme:
  - Primary: #1A73E8
  - Secondary: #34A853
  - Accent: #FBBC05
  - Error: #EA4335
  - Background: #F9FAFB
  - Surface: #FFFFFF
  - Text Primary: #202124
  - Text Secondary: #5F6368
- Responsive layout for all devices
- Smooth animations with Framer Motion
- Dark mode support

## Technical Implementation

### Frontend
- Built with React and TypeScript
- Uses Next.js framework
- Styled with Tailwind CSS
- Animations with Framer Motion
- WebRTC for camera/microphone access
- Page Visibility API for tab detection

### Backend
- Node.js with Express
- Gemini API integration
- RESTful API endpoints
- JSON-based request/response handling

### API Endpoints

#### Generate Company Questions
```
POST /api/generate-company-questions
{
  "company": "Google",
  "role": "Frontend Engineer",
  "difficultyProfile": "mix"
}
```

#### Score Answer
```
POST /api/score-answer
{
  "question": { /* question object */ },
  "userAnswer": "Candidate's answer"
}
```

#### Generate Report
```
POST /api/generate-report
{
  "questions": [ /* array of questions */ ],
  "answers": [ /* array of answers */ ],
  "proctoringData": { /* proctoring data */ }
}
```

#### Detect AI Content
```
POST /api/detect-ai-content
{
  "text": "Text to analyze"
}
```

#### Analyze Voice
```
POST /api/analyze-voice
{
  "voiceActivity": true,
  "backgroundNoise": 0.3
}
```

#### Detect Suspicious Paste
```
POST /api/detect-suspicious-paste
{
  "pasteEvents": 5,
  "timeBetweenPastes": [2, 1, 3, 1]
}
```

## Security & Privacy

- All recordings encrypted at rest (AES-256)
- Transport over TLS
- Role-based access control for recorded content
- Audit logs for admin access
- Option to anonymize data for analytics
- Clear privacy page explaining data collection and retention

## Fallbacks & Graceful Degradation

- If camera/microphone denied: Practice mode with reduced features
- If Gemini API unavailable: Fallback to cached question set
- For low-bandwidth: Degrade video quality and prefer audio + text

## Admin Dashboard

- Proctoring strictness configuration
- Retention period settings
- Automatic fail vs flag-for-review triggers
- Company question lists management
- Custom question upload
- Session replay with synchronized events
- Analytics for candidate trends and failing topics

## Accessibility

- WCAG compliant components
- Keyboard navigable interface
- Captions for audio content
- Transcripts for all recorded content