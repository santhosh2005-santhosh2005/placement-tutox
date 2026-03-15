import express from 'express';
import { connectGitHub, getGitHubRepositories } from '../services/githubService';

const router = express.Router();

// Connect to GitHub
router.post('/github/connect', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'GitHub username is required' });
    }
    
    const result = await connectGitHub(username);
    res.json(result);
  } catch (error) {
    console.error('Error connecting to GitHub:', error);
    res.status(500).json({ error: 'Failed to connect to GitHub' });
  }
});

// Get user repositories
router.get('/github/repositories/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ error: 'GitHub username is required' });
    }
    
    const repositories = await getGitHubRepositories(username);
    res.json(repositories);
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub repositories' });
  }
});

export default router;