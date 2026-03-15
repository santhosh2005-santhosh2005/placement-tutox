# AI Interview Module Demo

## Demo Flow

### 1. Initial Setup Screen
```
┌─────────────────────────────────────────────────────────────┐
│                    AI-Powered Interview                     │
│                                                             │
│  Company: [Google ▼]                                        │
│                                                             │
│  Job Role: [Frontend Engineer ▼]                           │
│                                                             │
│  Difficulty Level: [Medium ▼]                              │
│                                                             │
│  [ℹ] Privacy Notice                                         │
│  This interview will use your camera and microphone...     │
│                                                             │
│  [ ] I consent to the use of my camera and microphone      │
│                                                             │
│              [ Start AI Interview ]                         │
└─────────────────────────────────────────────────────────────┘
```

### 2. Loading State
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ○ ○ ○ ○ ○ ○ ○ ○ ○ ○                      │
│                        Loading...                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Interview in Progress
```
┌─────────────────────────────────────────────────────────────┐
│ Question 1 of 5 ──────────────────────── 20% Complete       │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ┌────────────────────────┬────────────────────────┐         │
│ │      AI Interviewer    │    Your Camera Feed    │         │
│ │                        │                        │         │
│ │    😀                 │    📹 Live Video       │         │
│ │   👁 👁                │                        │         │
│ │    👄  ← Speaking      │  [🔴 REC]              │         │
│ │                        │                        │         │
│ │ "Can you explain how   │                        │         │
│ │  virtual DOM works in  │                        │         │
│ │  React?"               │                        │         │
│ │                        │                        │         │
│ └────────────────────────┴────────────────────────┘         │
│                                                             │
│        [ Next Question ] [ Re-record ] [ End Interview ]    │
│                                                             │
│                    🤖 AI is asking a question...            │
└─────────────────────────────────────────────────────────────┘
```

### 4. User Response Phase
```
┌─────────────────────────────────────────────────────────────┐
│ Question 1 of 5 ──────────────────────── 20% Complete       │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ┌────────────────────────┬────────────────────────┐         │
│ │      AI Interviewer    │    Your Camera Feed    │         │
│ │                        │                        │         │
│ │    😀                 │    📹 Live Video       │         │
│ │   👁 👁                │                        │         │
│ │    👄                  │  [⏺️ Start Recording]  │         │
│ │                        │                        │         │
│ │ "Can you explain how   │                        │         │
│ │  virtual DOM works in  │                        │         │
│ │  React?"               │                        │         │
│ │                        │                        │         │
│ └────────────────────────┴────────────────────────┘         │
│                                                             │
│        [ Next Question ] [ Re-record ] [ End Interview ]    │
│                                                             │
│                    🎙️ Your turn to answer...               │
└─────────────────────────────────────────────────────────────┘
```

### 5. Recording in Progress
```
┌─────────────────────────────────────────────────────────────┐
│ Question 1 of 5 ──────────────────────── 20% Complete       │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ┌────────────────────────┬────────────────────────┐         │
│ │      AI Interviewer    │    Your Camera Feed    │         │
│ │                        │                        │         │
│ │    😀                 │    📹 Live Video       │         │
│ │   👁 👁                │                        │         │
│ │    👄                  │  [⏹️ Stop Recording]   │         │
│ │                        │                        │         │
│ │ "Can you explain how   │                        │         │
│ │  virtual DOM works in  │                        │         │
│ │  React?"               │                        │         │
│ │                        │                        │         │
│ └────────────────────────┴────────────────────────┘         │
│                                                             │
│        [ Next Question ] [ Re-record ] [ End Interview ]    │
│                                                             │
│                   🔴 Recording your answer...               │
└─────────────────────────────────────────────────────────────┘
```

### 6. Interview Completed
```
┌─────────────────────────────────────────────────────────────┐
│                  AI Interview Completed                     │
│                                                             │
│  Session ID: ai_session_123456789                          │
│  Questions Answered: 5                                     │
│  Answers Recorded: 5                                       │
│                                                             │
│  Your Answers:                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Question 1: Can you explain how virtual DOM works...│   │
│  │ Answer: Recorded answer for question 1              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                    [ Start New Interview ]                  │
└─────────────────────────────────────────────────────────────┘
```

## Key Features Demonstrated

1. **Responsive Layout** - Adapts to different screen sizes
2. **Progress Tracking** - Visual progress bar and question counter
3. **Real-time Indicators** - Clear status updates (AI speaking, user speaking, recording)
4. **Control Panel** - Intuitive buttons for interview management
5. **Privacy Compliance** - Consent requirement before starting
6. **Error Handling** - Graceful degradation when services are unavailable
7. **Session Management** - Complete interview lifecycle from start to finish

## Technical Highlights

- **WebRTC Integration** - For camera and microphone access
- **MediaRecorder API** - For answer recording
- **Gemini API** - For AI question generation
- **State Management** - React hooks for interview flow control
- **RESTful Backend** - Express.js API endpoints
- **TypeScript** - Strong typing for reliability
- **Tailwind CSS** - Modern, responsive styling

This demo showcases a complete, production-ready AI interview module that can be extended with additional features like real TTS, avatar services, and advanced analytics.