import express, { Router, Request, Response } from 'express';
import { fetchQuestionsFromGemini, getCachedQuestions, saveQuestionToSession } from '../services/interviewSessionService';
import Ajv from 'ajv';
import axios from 'axios';
import { synthesizeTextToMp3 } from '../services/ttsService';

const router: Router = express.Router();
const ajv = new Ajv();

// AJV schema for question validation
const questionSchema = {
  "type": "array",
  "minItems": 1,
  "maxItems": 15,
  "items": {
    "type": "object",
    "required": ["id","text","difficulty","topics","time","rubric"],
    "properties": {
      "id": { "type": "string" },
      "text": { "type": "string" },
      "difficulty": { "type": "string", "enum": ["easy","medium","hard"] },
      "topics": { "type": "array", "items": { "type": "string" } },
      "time": { "type": "number" },
      "rubric": {
        "type": "object",
        "required": ["correctness","efficiency","explainability"],
        "properties": {
          "correctness": { "type": "number" },
          "efficiency": { "type": "number" },
          "explainability": { "type": "number" }
        }
      }
    }
  }
};

const validateQuestions = ajv.compile(questionSchema);

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Health check endpoint for API verification
router.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug route to list registered API routes (dev only)
router.get('/debug/routes', (req: Request, res: Response) => {
  // In a real implementation, you might want to limit this to dev environments only
  const routes = [
    'GET /health',
    'GET /api/health',
    'GET /debug/routes',
    'POST /interviews/create',
    'POST /interviews/:id/fetch-questions',
    'POST /interviews/:id/next',
    'POST /interviews/:id/logs',
    'POST /interviews/:sessionId/grade',
    'POST /support/reports'
  ];
  
  res.status(200).json({ 
    status: 'ok', 
    routes,
    timestamp: new Date().toISOString() 
  });
});

// Support report endpoint
router.post('/support/reports', async (req: Request, res: Response) => {
  try {
    const reportData = req.body;
    
    // In a real implementation, you would save this to a database
    // and possibly send it to a support system or email
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Support report received:', {
      reportId,
      ...reportData
    });
    
    // For now, we'll just log it and return a success response
    res.status(200).json({ 
      status: 'ok', 
      reportId,
      message: 'Report submitted successfully. Our team will review it shortly.' 
    });
  } catch (error) {
    console.error('Error processing support report:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to process support report' 
    });
  }
});

// Debug endpoint to view recent grading errors (dev only)
router.get('/debug/grading-errors', (req: Request, res: Response) => {
  // In a real implementation, you would query a database or log system
  // For now, we'll return a placeholder response
  res.status(200).json({ 
    status: 'ok', 
    message: 'In a real implementation, this would return recent grading errors',
    errors: [],
    timestamp: new Date().toISOString() 
  });
});

// Add a new interface for session storage
interface InterviewSession {
  sessionId: string;
  questions: any[];
  currentIndex: number;
  company: string;
  role: string;
  mode: string;
  strictness: string;
  consent: boolean;
  createdAt: Date;
}

// In-memory storage for sessions (in a real app, this would be a database)
const sessions: Map<string, InterviewSession> = new Map();

// Create interview session endpoint
router.post('/interviews/create', async (req: Request, res: Response) => {
  try {
    console.log('Incoming /api/interviews/create', { body: req.body });
    const { userId, company, role, mode, strictness, consent } = req.body;
    
    if (!userId || !company || !role || consent === undefined) {
      return res.status(400).json({ error: 'userId, company, role, and consent are required' });
    }

    // Generate a session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Mock expiration time (1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    // Mock ephemeral token
    const ephemeralToken = `token_${sessionId}`;
    
    // Create session object with currentIndex -1 so the first call to next returns index 0
    const session: InterviewSession = {
      sessionId,
      questions: [],
      currentIndex: -1, // Start at -1 so first next() call returns index 0
      company,
      role,
      mode,
      strictness,
      consent,
      createdAt: new Date()
    };
    
    // Store session
    sessions.set(sessionId, session);
    
    res.json({
      sessionId,
      expiresAt,
      ephemeralToken
    });
  } catch (error) {
    console.error('Error creating interview session:', error);
    res.status(500).json({ error: 'Failed to create interview session' });
  }
});

// Fetch questions endpoint
router.post('/interviews/:id/fetch-questions', async (req: Request, res: Response) => {
  const { company, role, difficulty_profile='mix' } = req.body;
  const sessionId = req.params.id;
  
  try {
    // Validate session ID
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Get session
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Build improved Gemini prompt with explicit JSON formatting instructions
    const prompt = `You are an interview question generator for ${company}. 
Generate 8-12 ${role}-specific technical interview questions.

Each question must be a JSON object with these exact fields:
- id: string (unique identifier)
- text: string (the actual question)
- difficulty: string (must be one of: "easy", "medium", "hard")
- topics: array of strings (relevant technical topics)
- time: number (estimated time in minutes to answer)
- rubric: object with these fields:
  - correctness: number (0-1, weight for technical correctness)
  - efficiency: number (0-1, weight for solution efficiency)
  - explainability: number (0-1, weight for explanation clarity)

Return ONLY a valid JSON array of these question objects. No other text, no markdown, no explanations.

Example format:
[
  {
    "id": "q1",
    "text": "How would you optimize this algorithm?",
    "difficulty": "medium",
    "topics": ["algorithms", "optimization"],
    "time": 5,
    "rubric": {
      "correctness": 0.5,
      "efficiency": 0.3,
      "explainability": 0.2
    }
  }
]

Generate questions for:
Company: ${company}
Role: ${role}
Difficulty profile: ${difficulty_profile}`;

    console.log('Sending prompt to Gemini API for company:', company, 'role:', role);
    
    // Call Gemini API using env key
    const geminiResponse = await fetchQuestionsFromGemini(prompt);
    
    // Clean the response - remove any markdown or extra text
    let cleanResponse = geminiResponse.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.substring(7);
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.substring(3);
    }
    if (cleanResponse.endsWith('```')) {
      cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3);
    }
    
    // Parse response
    let parsed;
    try {
      parsed = JSON.parse(cleanResponse);
      console.log('Successfully parsed Gemini response with', parsed.length, 'questions');
    
    // Add detailed logging for debugging
    if (parsed.length > 0) {
      console.log('First question sample:', JSON.stringify(parsed[0], null, 2));
    }
    } catch (parseError: any) {
      console.error('Failed to parse Gemini response as JSON. Raw response:', cleanResponse.substring(0, 200));
      throw new Error('Failed to parse Gemini response as JSON: ' + parseError.message);
    }
    
    // Validate with AJV schema
    const valid = validateQuestions(parsed);
    if (!valid) {
      console.error('Gemini response failed schema validation:', validateQuestions.errors);
      throw new Error('Gemini response failed schema validation: ' + JSON.stringify(validateQuestions.errors));
    }
    
    // Store questions in session
    session.questions = parsed;
    sessions.set(sessionId, session);
    
    // Map text field to question field for frontend compatibility
    const questionsWithQuestionField = parsed.map((q: any) => ({
      ...q,
      question: q.text
    }));
    
    console.log('Successfully returning', questionsWithQuestionField.length, 'questions with question field');
    
    return res.json({ questions: questionsWithQuestionField, fallback: false });
  } catch (err: any) {
    console.error('Gemini fetch failed:', err.message);
    console.error('Error stack:', err.stack);
    
    // Return cached fallback
    try {
      const cached = await getCachedQuestions(company, role);
      // Map text field to question field for frontend compatibility
      const cachedWithQuestionField = cached.map((q: any) => ({
        ...q,
        question: q.text || q.question // Use text if available, otherwise keep question
      }));
      
      // Store cached questions in session
      const session = sessions.get(sessionId);
      if (session) {
        session.questions = cached;
        sessions.set(sessionId, session);
      }
      
      console.log('Returning cached questions with question field');
      
      return res.json({ 
        questions: cachedWithQuestionField, 
        fallback: true, 
        message: 'Using cached questions due to API error' 
      });
    } catch (cacheError) {
      console.error('Failed to get cached questions', cacheError);
      return res.status(500).json({ 
        error: 'Failed to fetch questions', 
        message: 'Unable to retrieve questions from API or cache' 
      });
    }
  }
});

// Get next question endpoint
router.post('/interviews/:id/next', async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    
    // Validate session ID
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Get session
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Increment current index
    session.currentIndex++;
    
    // Check if we've reached the end
    if (session.currentIndex >= session.questions.length || session.questions.length === 0) {
      return res.status(404).json({ error: 'No more questions available' });
    }
    
    // Update session
    sessions.set(sessionId, session);
    
    // Get current question
    const question = session.questions[session.currentIndex];
    
    // Map text field to question field for frontend compatibility
    const questionWithQuestionField = {
      ...question,
      question: question.text
    };
    
    return res.json({
      question: questionWithQuestionField,
      index: session.currentIndex
    });
  } catch (error) {
    console.error('Error getting next question:', error);
    return res.status(500).json({ error: 'Failed to get next question' });
  }
});

// Log proctoring events endpoint
router.post('/interviews/:id/logs', async (req: Request, res: Response) => {
  try {
    const { events } = req.body;
    
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'events array is required' });
    }

    // In a real implementation, you would save events to the database
    // For now, we'll just log them
    console.log(`Proctoring events for session ${req.params.id}:`, events);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error logging proctoring events:', error);
    res.status(500).json({ error: 'Failed to log proctoring events' });
  }
});

// Robust server endpoint: /api/interview/:sessionId/next-question
router.post('/interviews/:sessionId/next-question', async (req: Request, res: Response) => {
  // Add detailed logging for debugging
  console.log('Next question request received:', {
    sessionId: req.params.sessionId,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  if (req.method !== 'POST') return res.status(405).end();
  
  const { sessionId } = req.params;
  const { company, role, difficulty_profile = 'mix' } = req.body || {};
  
  if (!sessionId) {
    console.error('Missing session ID');
    return res.status(400).json({ error: 'Session ID is required' });
  }
  
  if (!company || !role) {
    console.error('Missing company or role:', { company, role });
    return res.status(400).json({ error: 'missing company or role' });
  }

  const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.error('Missing Gemini API key');
    return res.status(500).json({ error: 'missing_gemini_key' });
  }

  // Get session
  const session = sessions.get(sessionId);
  if (!session) {
    console.error('Session not found:', sessionId);
    return res.status(404).json({ error: 'Session not found' });
  }

  const systemPrompt = `You are a professional interviewer. Return a JSON array of 1 question with fields id,text,difficulty,topics,time,rubric. Return JSON only.`;
  const payload = { 
    prompt: `${systemPrompt}\n{"company":"${company}","role":"${role}","difficulty_profile":"${difficulty_profile}"}` 
  };

  const GEMINI_URL = process.env.GENERATIVE_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  function sleep(ms: number) { 
    return new Promise(r => setTimeout(r, ms)); 
  }
  
  function isRetryable(code: number) { 
    return [429, 500, 502, 503, 504].includes(code); 
  }

  let attempt = 0;
  const maxAttempts = 2;
  let lastErr: any = null;

  while (attempt <= maxAttempts) {
    try {
      console.log(`Attempt ${attempt + 1} to fetch question from Gemini`);
      
      const startTime = Date.now();
      const response = await axios.post(
        `${GEMINI_URL}?key=${API_KEY}`, 
        {
          contents: [{
            parts: [{
              text: payload.prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1200,
            responseMimeType: "application/json"
          }
        },
        { 
          timeout: 15000,
          headers: { 
            'Content-Type': 'application/json' 
          } 
        }
      );
      
      const endTime = Date.now();
      console.log(`Gemini response received in ${endTime - startTime}ms`);
      
      const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || response.data?.output || null;
      console.log('Raw Gemini response snippet:', raw?.substring(0, 200));
      
      if (!raw) {
        throw new Error('empty_gemini_response');
      }

      // robust JSON extraction
      let parsed;
      try { 
        parsed = JSON.parse(raw); 
      } catch (e) {
        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']');
        if (start >= 0 && end > start) {
          parsed = JSON.parse(raw.slice(start, end + 1));
        } else {
          throw new Error('invalid_json_from_gemini');
        }
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('empty_parsed_questions');
      }
      
      // Validate with AJV schema
      const validate = ajv.compile(questionSchema);
      if (!validate([parsed[0]])) {
        throw new Error('schema_validation_failed ' + JSON.stringify(validate.errors));
      }

      const question = parsed[0];
      console.log('Valid question received:', question);
      
      // persist to session so session uses same questions
      await saveQuestionToSession(sessionId, question);
      
      // Store question in session
      session.questions.push(question);
      session.currentIndex = session.questions.length - 1;
      sessions.set(sessionId, session);

      // Pre-generate TTS audio for the question (server-side)
      console.log('Generating TTS for question:', question.text);
      const audioUrl = await synthesizeTextToMp3(question.text, 'en-US-Wavenet-D');
      console.log('TTS generated successfully:', audioUrl);

      return res.status(200).json({ fallback: false, question, audioUrl });
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
      
      // final fallback: return cached questions
      console.log('All retries exhausted, using cached questions');
      try {
        const cached = await getCachedQuestions(company, role);
        const cachedQuestion = cached[0]; // Return first cached question
        
        // Pre-generate TTS for cached question
        console.log('Generating TTS for cached question:', cachedQuestion.text);
        const audioUrl = await synthesizeTextToMp3(cachedQuestion.text, 'en-US-Wavenet-D');
        console.log('TTS for cached question generated successfully:', audioUrl);
        
        // Store cached question in session
        session.questions.push(cachedQuestion);
        session.currentIndex = session.questions.length - 1;
        sessions.set(sessionId, session);
        
        return res.status(200).json({ 
          fallback: true, 
          question: cachedQuestion, 
          audioUrl,
          diagnostic: String(lastErr?.message || lastErr) 
        });
      } catch (cacheError: any) {
        console.error('Failed to get cached questions:', cacheError);
        return res.status(500).json({ 
          error: 'Failed to fetch questions', 
          message: 'Unable to retrieve questions from API or cache' 
        });
      }
    }
  }
});

// Add TTS endpoint
router.post('/interview/tts', async (req: Request, res: Response) => {
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

// Add transcribe endpoint (server fallback)
router.post('/interviews/:sessionId/transcribe', async (req: Request, res: Response) => {
  // This is a placeholder for server-side transcription
  // In a real implementation, you would use Whisper or similar ASR service
  return res.status(200).json({ 
    transcript: 'Server-side transcription not implemented in this demo', 
    confidence: 0.0 
  });
});

// Add save answer endpoint
router.post('/interviews/:sessionId/save-answer', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { questionId, transcript } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    if (!questionId || !transcript) {
      return res.status(400).json({ error: 'Question ID and transcript are required' });
    }
    
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Save transcript to session (in a real app, this would go to a database)
    // For now, we'll just log it
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

export default router;