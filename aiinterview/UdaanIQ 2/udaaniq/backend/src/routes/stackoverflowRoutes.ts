import express from 'express';
import { connectStackOverflow, getStackOverflowReputation } from '../services/stackoverflowService';

const router = express.Router();

// Connect to Stack Overflow
router.post('/stackoverflow/connect', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Stack Overflow user ID is required' });
    }
    
    const result = await connectStackOverflow(userId);
    res.json(result);
  } catch (error) {
    console.error('Error connecting to Stack Overflow:', error);
    res.status(500).json({ error: 'Failed to connect to Stack Overflow' });
  }
});

// Get user reputation
router.get('/stackoverflow/reputation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'Stack Overflow user ID is required' });
    }
    
    const reputation = await getStackOverflowReputation(userId);
    res.json(reputation);
  } catch (error) {
    console.error('Error fetching Stack Overflow reputation:', error);
    res.status(500).json({ error: 'Failed to fetch Stack Overflow reputation' });
  }
});

export default router;