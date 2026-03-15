import express, { Router, Request, Response } from 'express';
import { generateCodingChallenge, evaluateCodingSolution, generateCodingPath } from '../services/codingChallengeService';

const router: Router = express.Router();

// Generate coding challenge endpoint
router.post('/generate-challenge', async (req: Request, res: Response) => {
  try {
    const { skill, difficulty } = req.body;
    
    if (!skill) {
      return res.status(400).json({ error: 'Skill is required' });
    }

    const challenge = await generateCodingChallenge(skill, difficulty);
    
    res.json(challenge);
  } catch (error) {
    console.error('Error generating coding challenge:', error);
    res.status(500).json({ error: 'Failed to generate coding challenge' });
  }
});

// Evaluate coding solution endpoint
router.post('/evaluate-solution', async (req: Request, res: Response) => {
  try {
    const { challenge, userSolution, testCases } = req.body;
    
    if (!challenge || !userSolution) {
      return res.status(400).json({ error: 'Challenge and userSolution are required' });
    }

    const evaluation = await evaluateCodingSolution(challenge, userSolution, testCases);
    
    res.json(evaluation);
  } catch (error) {
    console.error('Error evaluating coding solution:', error);
    res.status(500).json({ error: 'Failed to evaluate coding solution' });
  }
});

// Generate coding path endpoint
router.post('/generate-path', async (req: Request, res: Response) => {
  try {
    const { skill, count } = req.body;
    
    if (!skill) {
      return res.status(400).json({ error: 'Skill is required' });
    }

    const path = await generateCodingPath(skill, count);
    
    res.json(path);
  } catch (error) {
    console.error('Error generating coding path:', error);
    res.status(500).json({ error: 'Failed to generate coding path' });
  }
});

export default router;