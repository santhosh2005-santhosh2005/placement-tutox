import express, { Router, Request, Response } from 'express';
import { generateMockInterview, evaluateAnswer, generateInterviewFeedback, analyzeInterviewChat } from '../services/mockInterviewService';

const router: Router = express.Router();

// Generate mock interview endpoint
router.post('/generate-mock-interview', async (req: Request, res: Response) => {
  try {
    const { skills, experienceLevel, jobRole } = req.body;
    
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: 'Skills array is required' });
    }

    const mockInterview = await generateMockInterview(skills, experienceLevel, jobRole);
    
    res.json(mockInterview);
  } catch (error) {
    console.error('Error generating mock interview:', error);
    res.status(500).json({ error: 'Failed to generate mock interview' });
  }
});

// Evaluate answer endpoint
router.post('/evaluate-answer', async (req: Request, res: Response) => {
  try {
    const { question, userAnswer, questionType } = req.body;
    
    if (!question || !userAnswer || !questionType) {
      return res.status(400).json({ error: 'Question, userAnswer, and questionType are required' });
    }

    const evaluation = await evaluateAnswer(question, userAnswer, questionType);
    
    res.json(evaluation);
  } catch (error) {
    console.error('Error evaluating answer:', error);
    res.status(500).json({ error: 'Failed to evaluate answer' });
  }
});

// Robust grading endpoint with retry logic and proper error handling
router.post('/grade-answer', async (req: Request, res: Response) => {
  try {
    const { question, userAnswer, questionType } = req.body;
    
    // Input validation - check if fields exist
    if (question === undefined || userAnswer === undefined || questionType === undefined) {
      return res.status(400).json({ 
        error: 'Question, userAnswer, and questionType are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Sanitize inputs
    const sanitizedQuestion = String(question).trim().substring(0, 2000);
    const sanitizedUserAnswer = String(userAnswer).trim().substring(0, 5000);
    const sanitizedQuestionType = String(questionType).trim().substring(0, 50);

    // Check if fields are empty after trimming
    if (sanitizedQuestion.length === 0 || sanitizedUserAnswer.length === 0 || sanitizedQuestionType.length === 0) {
      return res.status(400).json({ 
        error: 'Question, userAnswer, and questionType cannot be empty',
        code: 'EMPTY_FIELDS'
      });
    }

    // Retry logic with exponential backoff
    let attempts = 0;
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    while (attempts <= maxRetries) {
      try {
        const evaluation = await evaluateAnswer(sanitizedQuestion, sanitizedUserAnswer, sanitizedQuestionType);
        
        // Validate the response structure
        if (!evaluation || typeof evaluation !== 'object') {
          throw new Error('Invalid evaluation response structure');
        }
        
        // Ensure all required fields are present
        const validatedEvaluation = {
          score: typeof evaluation.score === 'number' ? Math.max(1, Math.min(10, Math.round(evaluation.score))) : 5,
          strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths.slice(0, 5) : [],
          improvements: Array.isArray(evaluation.improvements) ? evaluation.improvements.slice(0, 5) : [],
          betterAnswer: typeof evaluation.betterAnswer === 'string' ? evaluation.betterAnswer.substring(0, 2000) : 'No better answer provided'
        };
        
        return res.json({
          success: true,
          evaluation: validatedEvaluation,
          metadata: {
            attempts: attempts + 1,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        attempts++;
        console.error(`Attempt ${attempts} failed:`, error);
        
        // If this was the last attempt, return error
        if (attempts > maxRetries) {
          return res.status(500).json({
            error: 'Failed to evaluate answer after multiple attempts',
            code: 'EVALUATION_FAILED',
            attempts: attempts,
            lastError: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        
        // Wait before retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempts - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  } catch (error) {
    console.error('Error in robust grading endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error during grading',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Generate overall feedback endpoint
router.post('/interview-feedback', async (req: Request, res: Response) => {
  try {
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    const feedback = await generateInterviewFeedback(answers);
    
    res.json(feedback);
  } catch (error) {
    console.error('Error generating interview feedback:', error);
    res.status(500).json({ error: 'Failed to generate interview feedback' });
  }
});

// Live chat analysis endpoint
router.post('/analyze-chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }
    const analysis = await analyzeInterviewChat(messages);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing interview chat:', error);
    res.status(500).json({ error: 'Failed to analyze chat' });
  }
});

export default router;