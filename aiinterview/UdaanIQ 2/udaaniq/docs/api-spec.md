# UdaanIQ API Specification

## Base URL

```
http://localhost:3001/api
```

## Endpoints

### 1. Resume Analysis

#### POST /analyze-resume

Analyze a student's resume against a job description.

**Request:**

Form data with:
- `resume`: File (PDF or DOCX)
- `jobDescription`: String

**Response:**

```json
{
  "total_score": 82,
  "breakdown": {
    "skills": 30,
    "experience": 22,
    "projects": 16,
    "education": 7,
    "ats": 7
  },
  "suggestions": [
    "Add measurable results to project descriptions.",
    "Include keyword: 'API integration'.",
    "Reformat experience section for better ATS readability."
  ]
}
```

**Response Codes:**
- `200`: Success
- `400`: Bad Request (missing file or job description)
- `500`: Internal Server Error

### 2. Generate Skill Tests

#### POST /generate-tests

Generate AI-powered tests for specified skills.

**Request:**

```json
{
  "skills": ["React", "JavaScript", "Python"]
}
```

**Response:**

```json
{
  "tests": [
    {
      "skill": "React",
      "challenge": "Create a search bar with debounce and API integration.",
      "mcqs": [
        {
          "id": "react-1",
          "q": "Which hook replaces componentDidMount?",
          "options": ["useState","useEffect","useMemo","useRef"],
          "answer": "useEffect"
        },
        {
          "id": "react-2",
          "q": "What is the use of key prop in lists?",
          "options": ["Styling","Performance","DOM identification","All of these"],
          "answer": "DOM identification"
        }
      ],
      "conceptual": "How can React.memo improve component performance?"
    }
  ]
}
```

**Response Codes:**
- `200`: Success
- `400`: Bad Request (missing skills array)
- `500`: Internal Server Error

### 3. Submit Test Results

#### POST /submit-results

Submit test results for evaluation and feedback.

**Request:**

```json
{
  "results": {
    "skills": ["React", "JavaScript"],
    "answers": {
      "react-1": "useEffect",
      "react-2": "DOM identification"
    }
  }
}
```

**Response:**

```json
{
  "score": 85,
  "feedback": {
    "strengths": [
      "Strong understanding of core concepts",
      "Good problem-solving approach"
    ],
    "improvements": [
      "Practice more advanced features",
      "Work on practical applications"
    ],
    "motivation": "You're making great progress! Keep learning and building projects."
  }
}
```

**Response Codes:**
- `200`: Success
- `400`: Bad Request (missing results)
- `500`: Internal Server Error

### 4. Get Career Roadmap

#### GET /roadmap/:year

Get a year-specific career roadmap.

**Parameters:**
- `year`: String (e.g., "1st-Year-CSE", "2nd-Year-CSE")

**Response:**

```json
{
  "year": "2nd Year CSE",
  "focus": ["Data Structures", "Web Dev", "Hackathons"],
  "to_do": [
    "Build 2 personal projects using HTML/CSS/JS.",
    "Join a hackathon or coding club.",
    "Start learning React basics."
  ]
}
```

**Response Codes:**
- `200`: Success
- `400`: Bad Request (missing year parameter)
- `500`: Internal Server Error

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per hour per IP address
- Exceeding the limit returns a 429 status code

## Authentication

Currently, the API does not require authentication. In a production environment, authentication would be implemented using JWT tokens or similar mechanisms.

## CORS Policy

The API allows requests from all origins in development. In production, it would be restricted to specific domains.

## Data Validation

All input data is validated:
- File types are restricted to PDF and DOCX for resumes
- Required fields are checked
- Data types are validated

## Versioning

The API is currently at version 1. Future versions would be accessed through:
```
http://localhost:3001/api/v1/...
```

## Changelog

### v1.0.0
- Initial release
- Implemented all core endpoints
- Basic error handling
- Mock data for demonstration