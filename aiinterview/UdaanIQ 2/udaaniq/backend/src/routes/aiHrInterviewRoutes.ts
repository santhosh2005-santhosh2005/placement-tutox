import express, { Router, Request, Response } from 'express';
import Ajv from 'ajv';
import axios from 'axios';
import { synthesizeTextToMp3 } from '../services/ttsService';
import { fetchQuestionsFromGeminiWithRetry, getCachedQuestions, generateQuestionTTS, generateQuestionAvatarVideo } from '../services/aiHrInterviewService';

const router: Router = express.Router();
const ajv = new Ajv();

// AJV schema for question validation
const questionSchema = {
  "type": "object",
  "required": ["id", "text", "difficulty", "topics", "time", "rubric"],
  "properties": {
    "id": { "type": "string" },
    "text": { "type": "string" },
    "difficulty": { "type": "string", "enum": ["easy", "medium", "hard"] },
    "topics": { "type": "array", "items": { "type": "string" } },
    "time": { "type": "number" },
    "rubric": {
      "type": "object",
      "required": ["correctness", "efficiency", "explainability"],
      "properties": {
        "correctness": { "type": "number" },
        "efficiency": { "type": "number" },
        "explainability": { "type": "number" }
      }
    }
  }
};

const validateQuestion = ajv.compile(questionSchema);

// Interview session interface
interface AIInterviewSession {
  sessionId: string;
  userId: string;
  company: string;
  role: string;
  mode: 'Practice' | 'Live';
  strictness: string;
  consent: boolean;
  questions: any[];
  currentIndex: number;
  repeatCounts: { [questionId: string]: number };
  answers: any[];
  allowRepeat: boolean;
  createdAt: Date;
  proctorEvents: any[];
}

// In-memory storage for sessions (in a real app, this would be a database)
const aiInterviewSessions: Map<string, AIInterviewSession> = new Map();

// Helper function for sleep
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to check if error is retryable
function isRetryable(code: number) {
  return [429, 500, 502, 503, 504].includes(code);
}

// POST /api/interview/create
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { userId, company, role, mode, strictness, consent } = req.body;
    
    if (!userId || !company || !role || !mode || consent === undefined) {
      return res.status(400).json({ error: 'userId, company, role, mode, and consent are required' });
    }

    // Generate a session ID
    const sessionId = `ai_hr_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create session object
    const session: AIInterviewSession = {
      sessionId,
      userId,
      company,
      role,
      mode,
      strictness,
      consent,
      questions: [],
      currentIndex: -1,
      repeatCounts: {},
      answers: [],
      allowRepeat: true, // Default to allowing repeats
      createdAt: new Date(),
      proctorEvents: []
    };
    
    // Store session
    aiInterviewSessions.set(sessionId, session);
    
    res.json({
      sessionId,
      message: 'AI HR Interview session created successfully'
    });
  } catch (error) {
    console.error('Error creating AI HR interview session:', error);
    res.status(500).json({ error: 'Failed to create AI HR interview session' });
  }
});

// POST /api/interview/:sessionId/next-question
router.post('/:sessionId/next-question', async (req: Request, res: Response) => {
  console.log('Next question request received:', {
    sessionId: req.params.sessionId,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  const { sessionId } = req.params;
  const { fetchMode = 'next' } = req.body || {};
  
  if (!sessionId) {
    console.error('Missing session ID');
    return res.status(400).json({ error: 'Session ID is required' });
  }

  // Get session
  const session = aiInterviewSessions.get(sessionId);
  if (!session) {
    console.error('Session not found:', sessionId);
    return res.status(404).json({ error: 'Session not found' });
  }

  const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.error('Missing Gemini API key');
    return res.status(500).json({ error: 'missing_gemini_key' });
  }

  try {
    let question: any;
    let shouldGenerateNew = false;
    
    // Handle different fetch modes
    switch (fetchMode) {
      case 'repeat':
        // Return current question again
        if (session.currentIndex >= 0 && session.questions.length > 0) {
          question = session.questions[session.currentIndex];
          // Increment repeat count
          const questionId = question.id;
          session.repeatCounts[questionId] = (session.repeatCounts[questionId] || 0) + 1;
          aiInterviewSessions.set(sessionId, session);
        } else {
          return res.status(400).json({ error: 'No current question to repeat' });
        }
        break;
        
      case 'regenerate':
        // Generate a new question to replace current
        shouldGenerateNew = true;
        // Fall through to next case
        
      case 'next':
      default:
        // Move to next question
        if (!shouldGenerateNew) {
          session.currentIndex++;
        }
        
        // Check if we need to generate new questions
        if (session.currentIndex >= session.questions.length || shouldGenerateNew) {
          // Generate new questions in batch
          const systemPrompt = `You are a professional HR interviewer. Generate 8-12 interview questions as a JSON array with each question having fields: id,text,difficulty,topics,time,rubric. Return JSON only.`;
          const payload = { 
            prompt: `${systemPrompt}\n{"company":"${session.company}","role":"${session.role}","strictness":"${session.strictness}","mode":"${session.mode}"}` 
          };

          const GEMINI_URL = process.env.GENERATIVE_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

          let attempt = 0;
          const maxAttempts = 2;
          let lastErr: any = null;

          while (attempt <= maxAttempts) {
            try {
              console.log(`Attempt ${attempt + 1} to fetch questions from Gemini`);
              
              // Use our new service function
              const parsed = await fetchQuestionsFromGeminiWithRetry(payload.prompt, 2);
              
              // Validate with AJV schema
              const validate = ajv.compile({
                "type": "array",
                "items": questionSchema
              });
              
              if (!validate(parsed)) {
                throw new Error('schema_validation_failed ' + JSON.stringify(validate.errors));
              }

              // Add questions to session
              if (shouldGenerateNew && session.currentIndex >= 0) {
                // Replace current question
                session.questions[session.currentIndex] = parsed[0];
              } else {
                // Add new questions
                session.questions = session.questions.concat(parsed);
              }
              
              aiInterviewSessions.set(sessionId, session);
              
              // Set the question to return
              question = session.questions[session.currentIndex];
              break;
            } catch (err: any) {
              lastErr = err;
              const statusCode = err?.response?.status;
              const retryable = statusCode ? isRetryable(statusCode) : /timeout|ETIMEDOUT|ECONNRESET/i.test(err.message);
              
              console.error(`Next-question attempt ${attempt + 1} failed:`, {
                statusCode,
                message: err?.message || err,
                response: err?.response?.data,
                stack: err?.stack
              });
              
              if (retryable && attempt < maxAttempts) { 
                attempt++; 
                console.log(`Retrying in ${500 * Math.pow(3, attempt)}ms...`);
                await sleep(500 * Math.pow(3, attempt)); 
                continue; 
              }
              
              throw err;
            }
          }
        } else {
          // Return existing question
          question = session.questions[session.currentIndex];
        }
        break;
    }
    
    // Validate the question
    const valid = validateQuestion(question);
    if (!valid) {
      throw new Error('Question validation failed: ' + JSON.stringify(validateQuestion.errors));
    }
    
    // Pre-generate TTS audio for the question (server-side)
    console.log('Generating TTS for question:', question.text);
    const audioUrl = await generateQuestionTTS(question.text, 'en-US-Wavenet-D');
    console.log('TTS generated successfully:', audioUrl);
    
    // Pre-generate avatar video for the question (server-side)
    console.log('Generating avatar video for question:', question.text);
    const avatarVideoUrl = await generateQuestionAvatarVideo(question.text, audioUrl);
    console.log('Avatar video generated successfully:', avatarVideoUrl);
    
    return res.status(200).json({ 
      fallback: false, 
      question, 
      audioUrl,
      avatarVideoUrl,
      repeatCount: session.repeatCounts[question.id] || 0
    });
  } catch (err: any) {
    console.error('Next-question failed:', err);
    
    // final fallback: return cached questions
    try {
      const cachedQuestions = [
        {
          id: `cached_${Date.now()}`,
          text: `Can you tell me about your experience as a ${session.role} at ${session.company}?`,
          difficulty: "medium",
          topics: ["experience"],
          time: 3,
          rubric: {
            correctness: 0.4,
            efficiency: 0.3,
            explainability: 0.3
          }
        }
      ];
      
      const cachedQuestion = cachedQuestions[0];
      
      // Pre-generate TTS for cached question
      console.log('Generating TTS for cached question:', cachedQuestion.text);
      const audioUrl = await generateQuestionTTS(cachedQuestion.text, 'en-US-Wavenet-D');
      console.log('TTS for cached question generated successfully:', audioUrl);
      
      // Pre-generate avatar video for cached question
      console.log('Generating avatar video for cached question:', cachedQuestion.text);
      const avatarVideoUrl = await generateQuestionAvatarVideo(cachedQuestion.text, audioUrl);
      console.log('Avatar video for cached question generated successfully:', avatarVideoUrl);
      
      // Add to session if needed
      if (session.currentIndex >= session.questions.length) {
        session.questions.push(cachedQuestion);
        session.currentIndex = session.questions.length - 1;
        aiInterviewSessions.set(sessionId, session);
      }
      
      return res.status(200).json({ 
        fallback: true, 
        question: cachedQuestion, 
        audioUrl,
        avatarVideoUrl,
        repeatCount: session.repeatCounts[cachedQuestion.id] || 0,
        diagnostic: String(err?.message || err) 
      });
    } catch (cacheError: any) {
      console.error('Failed to get cached questions:', cacheError);
      return res.status(500).json({ 
        error: 'Failed to fetch questions', 
        message: 'Unable to retrieve questions from API or cache' 
      });
    }
  }
});

// POST /api/interview/tts
router.post('/tts', async (req: Request, res: Response) => {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { text, voice = 'en-US-Wavenet-D' } = req.body || {};
  
  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }
  
  try {
    const audioUrl = await synthesizeTextToMp3(text, voice);
    return res.json({ audioUrl });
  } catch (err: any) {
    console.error('TTS failed:', err);
    return res.status(500).json({ error: 'tts_failed', message: String(err.message) });
  }
});

// POST /api/interview/:sessionId/save-answer
router.post('/:sessionId/save-answer', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { questionId, transcript, audioRef, videoRef, duration, proctorEvents } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    if (!questionId || !transcript) {
      return res.status(400).json({ error: 'Question ID and transcript are required' });
    }
    
    const session = aiInterviewSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Save answer to session
    const answerData = {
      questionId,
      transcript,
      audioRef,
      videoRef,
      duration,
      proctorEvents,
      timestamp: new Date()
    };
    
    session.answers.push(answerData);
    aiInterviewSessions.set(sessionId, session);
    
    console.log(`Saving answer for session ${sessionId}, question ${questionId}:`, transcript);
    
    return res.status(200).json({ 
      status: 'ok', 
      message: 'Answer saved successfully' 
    });
  } catch (error) {
    console.error('Error saving answer:', error);
    return res.status(500).json({ error: 'Failed to save answer' });
  }
});

// POST /api/interview/:sessionId/logs
router.post('/:sessionId/logs', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { events } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'events array is required' });
    }
    
    const session = aiInterviewSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Add events to session
    session.proctorEvents.push(...events);
    aiInterviewSessions.set(sessionId, session);
    
    console.log(`Saving proctoring events for session ${sessionId}:`, events);
    
    return res.status(200).json({ 
      status: 'ok', 
      message: 'Proctoring events saved successfully' 
    });
  } catch (error) {
    console.error('Error saving proctoring events:', error);
    return res.status(500).json({ error: 'Failed to save proctoring events' });
  }
});

export default router;