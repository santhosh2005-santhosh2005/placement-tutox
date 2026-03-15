import express, { Router, Request, Response } from 'express';
import { generateInterviewQuestions } from '../services/interviewService';

const router: Router = express.Router();

// Generate interview questions endpoint
router.post('/generate-questions', async (req: Request, res: Response) => {
  try {
    const { skills, experienceLevel, jobRole } = req.body;
    
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: 'Skills array is required' });
    }

    const questions = await generateInterviewQuestions(skills, experienceLevel, jobRole);
    
    res.json({ questions });
  } catch (error) {
    console.error('Error generating interview questions:', error);
    res.status(500).json({ error: 'Failed to generate interview questions' });
  }
});

export default router;