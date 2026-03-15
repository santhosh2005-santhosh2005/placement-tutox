import express from 'express';
import { connectLinkedIn, getLinkedInProfile } from '../services/linkedinService';

const router = express.Router();

// Connect to LinkedIn
router.post('/linkedin/connect', async (req, res) => {
  try {
    const { profileUrl } = req.body;
    
    if (!profileUrl) {
      return res.status(400).json({ error: 'LinkedIn profile URL is required' });
    }
    
    const result = await connectLinkedIn(profileUrl);
    res.json(result);
  } catch (error) {
    console.error('Error connecting to LinkedIn:', error);
    res.status(500).json({ error: 'Failed to connect to LinkedIn' });
  }
});

// Get user profile
router.get('/linkedin/profile', async (req, res) => {
  try {
    const { profileUrl } = req.query;
    
    if (!profileUrl || typeof profileUrl !== 'string') {
      return res.status(400).json({ error: 'LinkedIn profile URL is required' });
    }
    
    const profile = await getLinkedInProfile(profileUrl);
    res.json(profile);
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    res.status(500).json({ error: 'Failed to fetch LinkedIn profile' });
  }
});

export default router;