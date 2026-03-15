// AI HR Interview Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// AI HR Interview Session interface
export interface AIHRInterviewSession {
  sessionId: string;
  company: string;
  role: string;
  mode: 'Practice' | 'Live';
  strictness: string;
}

// Create AI HR interview session
export async function createAIHRInterviewSession(
  company: string, 
  role: string, 
  mode: 'Practice' | 'Live',
  strictness: string
): Promise<{ sessionId: string }> {
  const response = await fetch(`${API_BASE_URL}/api/interview/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: 'user_123', // In a real app, this would come from auth
      company,
      role,
      mode,
      strictness,
      consent: true // In a real app, this would come from user consent
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create AI HR interview session');
  }
  
  return response.json();
}

// Get next question for AI HR interview
export async function getNextAIHRQuestion(
  sessionId: string,
  fetchMode: 'next' | 'repeat' | 'regenerate' = 'next'
): Promise<{ 
  question: any; 
  audioUrl?: string; 
  avatarVideoUrl?: string;
  repeatCount?: number;
  fallback: boolean;
}> {
  const response = await fetch(`${API_BASE_URL}/api/interview/${sessionId}/next-question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fetchMode
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch next question');
  }
  
  return response.json();
}

// Save candidate answer
export async function saveAIHRAnswer(
  sessionId: string,
  questionId: string,
  transcript: string,
  audioRef?: string,
  videoRef?: string,
  duration?: number,
  proctorEvents?: any[]
): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/interview/${sessionId}/save-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      questionId,
      transcript,
      audioRef,
      videoRef,
      duration,
      proctorEvents
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save answer');
  }
  
  return response.json();
}

// Log proctoring events
export async function logAIHREvents(
  sessionId: string,
  events: any[]
): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/interview/${sessionId}/logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      events
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to log events');
  }
  
  return response.json();
}