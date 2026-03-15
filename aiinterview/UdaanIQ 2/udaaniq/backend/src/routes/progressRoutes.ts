import express, { Router, Request, Response } from 'express';
import { recordActivity, getUserProgress, getSkillRecommendations, getPersonalizedLearningPath, getUserAchievements } from '../services/progressService';

const router: Router = express.Router();

// Record user activity endpoint
router.post('/record-activity', async (req: Request, res: Response) => {
  try {
    const { userId, activity } = req.body;
    
    if (!userId || !activity) {
      return res.status(400).json({ error: 'userId and activity are required' });
    }

    const result = await recordActivity(userId, activity);
    
    res.json(result);
  } catch (error) {
    console.error('Error recording activity:', error);
    res.status(500).json({ error: 'Failed to record activity' });
  }
});

// Get user progress endpoint
router.get('/progress/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const progress = await getUserProgress(userId);
    
    res.json(progress);
  } catch (error) {
    console.error('Error getting user progress:', error);
    res.status(500).json({ error: 'Failed to get user progress' });
  }
});

// Get skill recommendations endpoint
router.get('/recommendations/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const recommendations = await getSkillRecommendations(userId);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting skill recommendations:', error);
    res.status(500).json({ error: 'Failed to get skill recommendations' });
  }
});

// New endpoint for personalized learning path
router.get('/learning-path/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const learningPath = await getPersonalizedLearningPath(userId);
    
    res.json(learningPath);
  } catch (error) {
    console.error('Error getting personalized learning path:', error);
    res.status(500).json({ error: 'Failed to get personalized learning path' });
  }
});

// New endpoint for user achievements
router.get('/achievements/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const achievements = await getUserAchievements(userId);
    
    res.json(achievements);
  } catch (error) {
    console.error('Error getting user achievements:', error);
    res.status(500).json({ error: 'Failed to get user achievements' });
  }
});

export default router;