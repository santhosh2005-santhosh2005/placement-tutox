import express, { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';

const router: Router = express.Router();

// In-memory storage for AI interview sessions (in a real app, this would be a database)
const aiInterviewSessions: Map<string, any> = new Map();

// AI Interview Session interface
interface AIInterviewSession {
  sessionId: string;
  company: string;
  role: string;
  difficulty: string;
  questions: any[];
  currentQuestionIndex: number;
  answers: any[];
  createdAt: Date;
}

// Start AI interview session
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { company, role, difficulty = 'medium' } = req.body;
    
    if (!company || !role) {
      return res.status(400).json({ error: 'Company and role are required' });
    }

    // Generate a session ID
    const sessionId = `ai_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create session object
    const session: AIInterviewSession = {
      sessionId,
      company,
      role,
      difficulty,
      questions: [],
      currentQuestionIndex: -1,
      answers: [],
      createdAt: new Date()
    };
    
    // Store session
    aiInterviewSessions.set(sessionId, session);
    
    res.json({
      sessionId,
      message: 'AI Interview session started successfully'
    });
  } catch (error) {
    console.error('Error starting AI interview session:', error);
    res.status(500).json({ error: 'Failed to start AI interview session' });
  }
});

// Get next question for AI interview
router.post('/next-question', async (req: Request, res: Response) => {
  try {
    const { sessionId, previousAnswers = [] } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Get session
    const session = aiInterviewSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Increment current question index
    session.currentQuestionIndex++;
    
    // Update session
    aiInterviewSessions.set(sessionId, session);
    
    // Generate question using Gemini
    const question = await generateAIQuestion(
      session.company, 
      session.role, 
      session.difficulty, 
      previousAnswers
    );
    
    // Add question to session
    session.questions.push(question);
    aiInterviewSessions.set(sessionId, session);
    
    res.json({
      question: question.text,
      questionId: question.id
    });
  } catch (error) {
    console.error('Error generating next question:', error);
    res.status(500).json({ error: 'Failed to generate next question' });
  }
});

// Upload candidate answer
router.post('/upload-answer', async (req: Request, res: Response) => {
  try {
    const { sessionId, questionId, answer, recordingUrl } = req.body;
    
    if (!sessionId || !questionId || !answer) {
      return res.status(400).json({ error: 'Session ID, question ID, and answer are required' });
    }

    // Get session
    const session = aiInterviewSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Store answer
    const answerData = {
      questionId,
      answer,
      recordingUrl,
      timestamp: new Date()
    };
    
    session.answers.push(answerData);
    aiInterviewSessions.set(sessionId, session);
    
    res.json({
      message: 'Answer uploaded successfully',
      answerId: `answer_${Date.now()}`
    });
  } catch (error) {
    console.error('Error uploading answer:', error);
    res.status(500).json({ error: 'Failed to upload answer' });
  }
});

// End AI interview session
router.post('/end', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Get session
    const session = aiInterviewSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Remove session from memory
    aiInterviewSessions.delete(sessionId);
    
    res.json({
      message: 'AI Interview session ended successfully',
      sessionId,
      summary: {
        totalQuestions: session.questions.length,
        totalAnswers: session.answers.length
      }
    });
  } catch (error) {
    console.error('Error ending AI interview session:', error);
    res.status(500).json({ error: 'Failed to end AI interview session' });
  }
});

// Generate AI question using Gemini
async function generateAIQuestion(company: string, role: string, difficulty: string, previousAnswers: any[] = []): Promise<any> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Build prompt
    const previousAnswersText = previousAnswers.length > 0 
      ? `\nPrevious answers:\n${previousAnswers.map((a, i) => `${i+1}. ${a}`).join('\n')}`
      : '';
      
    const prompt = `You are a professional interviewer for technical roles. Ask one clear question at a time.
    
Context:
Company: ${company}
Role: ${role}
Difficulty: ${difficulty}
${previousAnswersText}

Return ONLY a JSON object with these fields:
- id: a unique identifier for the question
- text: the actual question text
- type: the type of question (technical, behavioral, system-design)
- estimatedTime: estimated time to answer in minutes

Example:
{
  "id": "q1",
  "text": "Can you explain how virtual DOM works in React?",
  "type": "technical",
  "estimatedTime": 3
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from response
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonString = text.slice(jsonStart, jsonEnd + 1);
        return JSON.parse(jsonString);
      }
      throw new Error('Could not extract JSON from response');
    } catch (parseError) {
      // Fallback to a simple question structure
      return {
        id: `q_${Date.now()}`,
        text: text.trim() || `Tell me about your experience as a ${role} at ${company}.`,
        type: 'technical',
        estimatedTime: 2
      };
    }
  } catch (error) {
    console.error('Error generating AI question:', error);
    // Return a fallback question
    return {
      id: `fallback_${Date.now()}`,
      text: `Tell me about your experience as a ${role} at ${company}.`,
      type: 'behavioral',
      estimatedTime: 2
    };
  }
}

export default router;