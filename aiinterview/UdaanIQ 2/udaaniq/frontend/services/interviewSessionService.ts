import { MockInterviewQuestion } from './api';

// Interview session data
export interface InterviewSession {
  sessionId: string;
  expiresAt: string;
  ephemeralToken: string;
}

// Proctoring event
export interface ProctoringEvent {
  type: string;
  value?: string;
  timestamp: string;
}

// Fetch questions request
export interface FetchQuestionsRequest {
  company: string;
  role: string;
  difficulty_profile: string;
}

// Fetch questions response
export interface FetchQuestionsResponse {
  questions: MockInterviewQuestion[];
  fallback: boolean;
  message?: string;
}

// Log events request
export interface LogEventsRequest {
  events: ProctoringEvent[];
}

// Create interview request
export interface CreateInterviewRequest {
  userId: string;
  company: string;
  role: string;
  mode: string;
  strictness: string;
  consent: boolean;
}

// Create interview response
export interface CreateInterviewResponse {
  sessionId: string;
  expiresAt: string;
  ephemeralToken: string;
}

// Next question response
export interface NextQuestionResponse {
  question: MockInterviewQuestion;
  index: number;
}

// Use relative path for same-origin requests or environment variable for different setups
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Retry function for fetch requests
async function fetchWithRetry(url: string, options: RequestInit, retries: number = 3): Promise<Response> {
  let lastError: Error;
  
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error as Error;
      if (i < retries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  
  throw lastError!;
}

// Create a new interview session with improved error handling and retry logic
export async function createInterviewSession(request: CreateInterviewRequest): Promise<CreateInterviewResponse> {
  try {
    const res = await fetchWithRetry(`${API_BASE_URL}/api/interviews/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin', // important if auth/session cookies used
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const text = await res.text().catch(()=>null);
      throw new Error(`Server responded ${res.status}: ${text || res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error('createInterviewSession failed', err);
    // Show user-friendly error message
    if (err instanceof Error && err.message.includes('Failed to fetch')) {
      throw new Error('Network error - please check your connection and try again');
    }
    throw err;
  }
}

// Fetch questions for an interview session
export async function fetchInterviewQuestions(sessionId: string, request: FetchQuestionsRequest): Promise<FetchQuestionsResponse> {
  const response = await fetchWithRetry(`${API_BASE_URL}/api/interviews/${sessionId}/fetch-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch interview questions');
  }
  
  return response.json();
}

// Get next question for an interview session
export async function getNextQuestion(sessionId: string): Promise<NextQuestionResponse> {
  const response = await fetchWithRetry(`${API_BASE_URL}/api/interviews/${sessionId}/next`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to get next question');
  }
  
  return response.json();
}

// Log proctoring events
export async function logProctoringEvents(sessionId: string, request: LogEventsRequest): Promise<void> {
  const response = await fetchWithRetry(`${API_BASE_URL}/api/interviews/${sessionId}/logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to log proctoring events');
  }
}