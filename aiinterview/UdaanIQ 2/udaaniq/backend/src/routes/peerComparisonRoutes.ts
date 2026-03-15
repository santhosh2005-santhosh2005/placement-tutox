import express from 'express';
import { getPeerComparison } from '../services/peerComparisonService';

const router = express.Router();

// Get peer comparison data
router.get('/comparison/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const comparisonData = await getPeerComparison(userId);
    res.json(comparisonData);
  } catch (error) {
    console.error('Error getting peer comparison data:', error);
    res.status(500).json({ error: 'Failed to get peer comparison data' });
  }
});

export default router;