import express from 'express';
import { getJobMatches } from '../services/jobMatchingService';

const router = express.Router();

// Get job matches
router.post('/job-matches/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;
    const jobMatches = await getJobMatches(userId, preferences);
    res.json(jobMatches);
  } catch (error) {
    console.error('Error getting job matches:', error);
    res.status(500).json({ error: 'Failed to get job matches' });
  }
});

export default router;