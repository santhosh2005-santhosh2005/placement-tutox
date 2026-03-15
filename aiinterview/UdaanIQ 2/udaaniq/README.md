# UdaanIQ - AI Career Coach & Interview Platform

## Overview

UdaanIQ is a comprehensive full-stack web application designed to help engineering students enhance their career prospects through AI-powered tools. The platform provides resume analysis, skill testing, personalized feedback, year-wise career roadmaps, and realistic interview preparation with proctoring capabilities.

## Key Features

### 📋 Resume Analysis
- Upload PDF/DOCX resumes
- Paste job descriptions for comparison
- Get a Job Fit Score (0-100%) with detailed breakdown
- Receive personalized improvement suggestions

### 💪 Skill Testing
- Identify top skills from resume
- AI-generated challenges for each skill:
  - Coding/problem-solving challenges
  - Multiple choice questions
  - Conceptual questions

### 🗺️ Career Roadmap
- Year-wise engineering roadmaps
- Branch-specific guidance
- Progress tracking with checkboxes
- Pro tips for each academic year

### 🎯 Mock Interview Practice
- Company-specific interview questions
- Proctoring features (tab detection, camera/mic monitoring)
- Real-time answer evaluation
- Detailed feedback and scoring

### 🛡️ Proctored Interview Experience
- Realistic interview simulation
- Advanced proctoring (focus loss detection, paste tracking)
- AI-powered question generation
- Comprehensive reporting

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS with Material 3 design principles
- **State Management**: React hooks
- **Animations**: Framer Motion
- **UI Components**: Custom-built with accessibility in mind

### Backend
- **Framework**: Node.js with Express
- **Language**: TypeScript
- **API Design**: RESTful endpoints
- **Validation**: AJV for JSON schema validation
- **Security**: CORS configuration, environment variable management

### AI Integration
- **Gemini API**: For intelligent question generation and answer evaluation
- **Fallback Mechanisms**: Cached questions when API is unavailable

## Project Structure

```
udaaniq/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/              # App router pages
│   │   ├── components/       # Reusable components
│   │   ├── services/         # API service layer
│   │   └── utils/            # Utility functions
│   └── ...
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── server.ts         # Main server file
│   └── ...
├── docs/                     # Documentation
└── scripts/                  # Utility scripts
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd udaaniq
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

3. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```

### Environment Configuration

Create a `.env` file in the backend directory with the following variables:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### Running the Application

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will be running on http://localhost:3000

2. **Start the Frontend Server:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be running on http://localhost:3000

### Accessing the Application

Open your browser and navigate to http://localhost:3000 to access the application.

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/analyze-resume | Upload resume + JD → return score |
| POST | /api/generate-tests | Generate skill tests for resume skills |
| POST | /api/submit-results | Evaluate user responses + feedback |
| GET | /api/roadmap/:year | Fetch roadmap for selected branch/year |
| POST | /api/interviews/create | Create a new interview session |
| POST | /api/interviews/:id/fetch-questions | Fetch interview questions for a session |
| POST | /api/interviews/:id/logs | Log proctoring events for a session |
| GET | /api/health | Check backend health status |

## Testing

### Verify Backend Health
```bash
cd backend
npm run verify
```

### Manual Testing
1. Navigate to http://localhost:3000/mock-interview
2. Configure an interview with your preferred settings
3. Give consent and start the interview
4. Verify that no "TypeError: Failed to fetch" errors occur

## Troubleshooting

### Common Issues

1. **"TypeError: Failed to fetch" errors:**
   - Ensure the backend server is running on port 3000
   - Check that both frontend and backend are using the same port
   - Verify there are no CORS issues in the browser console

2. **Health check warnings:**
   - Make sure the backend server is running
   - Check network connectivity between frontend and backend

3. **Camera/Microphone access issues:**
   - Ensure you've given proper permissions in the browser
   - Check that your device has working camera/microphone hardware

## Documentation

For more detailed information, please refer to the following documents in the `docs/` directory:
- [IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md) - Detailed implementation overview
- [FIXES_DOCUMENTATION.md](docs/FIXES_DOCUMENTATION.md) - Specific fixes for the "TypeError: Failed to fetch" issue
- [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) - Comprehensive testing guide
- [PROCTORED_INTERVIEW.md](docs/PROCTORED_INTERVIEW.md) - Proctored interview feature documentation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.