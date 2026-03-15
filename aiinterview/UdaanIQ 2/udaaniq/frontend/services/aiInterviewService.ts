// AI Interview Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// AI Interview Session interface
export interface AIInterviewSession {
  sessionId: string;
  company: string;
  role: string;
  difficulty: string;
}

// Start AI interview session
export async function startAIInterviewSession(
  company: string, 
  role: string, 
  difficulty: string
): Promise<{ sessionId: string }> {
  const response = await fetch(`${API_BASE_URL}/api/ai-interview/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      company,
      role,
      difficulty
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start AI interview session');
  }
  
  return response.json();
}

// Get next question for AI interview
export async function getNextAIQuestion(
  sessionId: string,
  previousAnswers: string[] = []
): Promise<{ question: string; questionId: string }> {
  const response = await fetch(`${API_BASE_URL}/api/ai-interview/next-question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      previousAnswers
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch next question');
  }
  
  return response.json();
}

// Upload candidate answer
export async function uploadAIAnswer(
  sessionId: string,
  questionId: string,
  answer: string,
  recordingUrl?: string
): Promise<{ message: string; answerId: string }> {
  const response = await fetch(`${API_BASE_URL}/api/ai-interview/upload-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      questionId,
      answer,
      recordingUrl
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload answer');
  }
  
  return response.json();
}

// End AI interview session
export async function endAIInterviewSession(
  sessionId: string
): Promise<{ message: string; sessionId: string; summary: any }> {
  const response = await fetch(`${API_BASE_URL}/api/ai-interview/end`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to end AI interview session');
  }
  
  return response.json();
}