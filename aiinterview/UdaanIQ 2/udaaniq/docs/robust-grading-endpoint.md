# Robust Grading Endpoint

## Overview

The robust grading endpoint (`/api/grade-answer`) is a new API endpoint that provides enhanced reliability and error handling for answer evaluation in mock interviews. It includes retry logic, input sanitization, and structured error responses.

## Endpoint

```
POST /api/grade-answer
```

## Request Body

```json
{
  "question": "string",
  "userAnswer": "string",
  "questionType": "string"
}
```

### Fields

- `question` (required): The interview question being answered
- `userAnswer` (required): The candidate's answer to the question
- `questionType` (required): The type of question (e.g., "technical", "behavioral")

## Response Format

### Success Response

```json
{
  "success": true,
  "evaluation": {
    "score": 8,
    "strengths": ["Good explanation", "Clear examples"],
    "improvements": ["Add more details"],
    "betterAnswer": "A more comprehensive answer would include..."
  },
  "metadata": {
    "attempts": 1,
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```

### Error Response

```json
{
  "error": "Failed to evaluate answer after multiple attempts",
  "code": "EVALUATION_FAILED",
  "attempts": 4,
  "lastError": "API Error"
}
```

## Features

1. **Input Validation**: Validates all required fields are present and not empty
2. **Input Sanitization**: Trims whitespace and limits input length
3. **Retry Logic**: Automatically retries failed evaluations up to 3 times with exponential backoff
4. **Structured Responses**: Consistent response format with success/error indicators
5. **Error Handling**: Comprehensive error handling with detailed error codes
6. **Response Validation**: Ensures the evaluation response has the correct structure

## Error Codes

- `MISSING_REQUIRED_FIELDS`: One or more required fields are missing
- `EMPTY_FIELDS`: One or more required fields are empty after trimming
- `EVALUATION_FAILED`: Failed to evaluate answer after all retry attempts
- `INTERNAL_ERROR`: Internal server error during grading

## Usage in Frontend

The frontend should use the `gradeAnswer` function from the API service:

```typescript
import { gradeAnswer, GradeAnswerRequest } from '../../services/api';

const request: GradeAnswerRequest = {
  question: currentQuestion.question,
  userAnswer: currentAnswer,
  questionType: currentQuestion.type
};

try {
  const gradeResponse = await gradeAnswer(request);
  setEvaluations([...evaluations, gradeResponse.evaluation]);
} catch (gradeError) {
  // Fallback to original evaluation method if robust grading fails
  console.error('Robust grading failed, falling back to standard evaluation:', gradeError);
  // ... fallback logic
}
```

## Benefits

1. **Improved Reliability**: Retry logic helps handle temporary API failures
2. **Better User Experience**: Structured error responses provide clearer feedback
3. **Enhanced Security**: Input sanitization helps prevent potential issues
4. **Consistent Data**: Response validation ensures consistent data structure
5. **Debugging Support**: Metadata provides information about retry attempts