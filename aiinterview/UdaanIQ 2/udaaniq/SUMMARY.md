# UdaanIQ - AI Career Coach & Resume Analyzer

## Project Summary

UdaanIQ is a full-stack web application designed to help engineering students enhance their career prospects through AI-powered tools. The application provides resume analysis, skill testing, personalized feedback, and year-wise career roadmaps.

## Features Implemented

### 1. Resume Analysis
- Upload PDF/DOCX resumes
- Paste job descriptions for comparison
- Get a Job Fit Score (0-100%) with detailed breakdown
- Receive personalized improvement suggestions

### 2. Skill Testing
- Identify top skills from resume
- AI-generated challenges for each skill:
  - Coding/problem-solving challenges
  - Multiple choice questions
  - Conceptual questions

### 3. Career Roadmap
- Year-wise engineering roadmaps
- Branch-specific guidance
- Progress tracking with checkboxes
- Pro tips for each academic year

### 4. Mock Interview Practice
- Company-specific interview questions
- Proctoring features (tab detection, camera/mic monitoring)
- Real-time answer evaluation
- Detailed feedback and scoring

### 5. Proctored Interview Experience
- Realistic interview simulation
- Advanced proctoring (focus loss detection, paste tracking)
- AI-powered question generation
- Comprehensive reporting

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: (Not implemented in demo)
- **File Processing**: pdf-parse, mammoth
- **AI Integration**: (Mocked in demo)

## Project Structure

```
udaaniq/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/              # App router pages
│   │   ├── components/       # Reusable components
│   │   └── services/         # API service layer
│   └── ...
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── server.ts         # Main server file
│   └── ...
├── docs/                     # Documentation
└── README.md                 # Project overview
```

## How to Run the Application

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
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

1. Open your browser and navigate to http://localhost:3000
2. Explore the different features:
   - **Home Page**: Overview of all features
   - **Mock Interview**: Practice interviews with proctoring
   - **Proctored Interview**: Realistic proctored interview experience
   - **Resume Analysis**: Upload resume and job description
   - **Skill Testing**: Test your technical skills
   - **Career Roadmap**: Year-wise guidance
   - **Feedback**: Personalized feedback

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

## Development Notes

### Frontend
- Built with Next.js App Router
- Responsive design with TailwindCSS
- TypeScript for type safety
- Component-based architecture

### Backend
- RESTful API with Express
- TypeScript for type safety
- File processing with pdf-parse and mammoth
- Modular structure with routes and services

### Mock Data
- In this demo implementation, AI services are mocked
- Resume analysis returns random scores
- Skill tests are generated with placeholder content
- Roadmaps use predefined data

## Future Enhancements

1. **AI Integration**
   - Integrate with OpenAI GPT for real AI-powered analysis
   - Implement natural language processing for resume-JD comparison

2. **Database Integration**
   - Add MongoDB or Firebase for user data storage
   - Implement user authentication and profiles

3. **Advanced Features**
   - Mock interview functionality
   - Portfolio website builder
   - Job application tracking
   - Community features

4. **Performance Improvements**
   - Implement caching mechanisms
   - Optimize file processing
   - Add loading states and progress indicators

5. **Security Enhancements**
   - Implement proper authentication
   - Add input validation and sanitization
   - Implement rate limiting

## Deployment

The application can be deployed to:
- **Frontend**: Vercel, Netlify, or similar static hosting
- **Backend**: Railway, Render, or similar Node.js hosting
- **Database**: MongoDB Atlas, Firebase, or similar database services

See `docs/deployment.md` for detailed deployment instructions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.