import express, { Router, Request, Response } from 'express';
import { getRoadmap } from '../services/roadmapService';

const router: Router = express.Router();

// Get roadmap endpoint
router.get('/roadmap/:year', async (req: Request, res: Response) => {
  try {
    const { year } = req.params;
    
    if (!year) {
      return res.status(400).json({ error: 'Year parameter is required' });
    }

    const roadmap = await getRoadmap(year);
    
    res.json(roadmap);
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
});

export default router;