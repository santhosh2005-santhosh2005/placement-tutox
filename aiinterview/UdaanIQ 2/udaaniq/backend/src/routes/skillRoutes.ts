import express, { Router, Request, Response } from 'express';
import { generateSkillTests, submitTestResults, analyzeSkillGaps } from '../services/skillService';

const router: Router = express.Router();

// Generate skill tests endpoint
router.post('/generate-tests', async (req: Request, res: Response) => {
  try {
    const { skills } = req.body;
    
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: 'Skills array is required' });
    }

    const tests = await generateSkillTests(skills);
    
    res.json(tests);
  } catch (error) {
    console.error('Error generating skill tests:', error);
    res.status(500).json({ error: 'Failed to generate skill tests' });
  }
});

// Submit test results endpoint
router.post('/submit-results', async (req: Request, res: Response) => {
  try {
    const { results } = req.body;
    
    if (!results) {
      return res.status(400).json({ error: 'Results are required' });
    }

    const feedback = await submitTestResults(results);
    
    res.json(feedback);
  } catch (error) {
    console.error('Error submitting test results:', error);
    res.status(500).json({ error: 'Failed to submit test results' });
  }
});

// New endpoint for skill gap analysis
router.post('/analyze-gaps', async (req: Request, res: Response) => {
  try {
    const { userSkills, targetRole } = req.body;
    
    if (!userSkills || !Array.isArray(userSkills) || userSkills.length === 0) {
      return res.status(400).json({ error: 'userSkills array is required' });
    }
    
    if (!targetRole) {
      return res.status(400).json({ error: 'targetRole is required' });
    }

    const gapAnalysis = await analyzeSkillGaps(userSkills, targetRole);
    
    res.json(gapAnalysis);
  } catch (error) {
    console.error('Error analyzing skill gaps:', error);
    res.status(500).json({ error: 'Failed to analyze skill gaps' });
  }
});

export default router;