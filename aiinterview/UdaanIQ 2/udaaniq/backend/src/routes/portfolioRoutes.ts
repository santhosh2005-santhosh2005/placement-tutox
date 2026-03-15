import express, { Router, Request, Response } from 'express';
import { savePortfolio, getPortfolio, generateProjectDescription, generatePortfolioSuggestions, exportPortfolio, generatePortfolioWebsite } from '../services/portfolioService';

const router: Router = express.Router();

// Save portfolio endpoint
router.post('/save', async (req: Request, res: Response) => {
  try {
    const { userId, portfolioData } = req.body;
    
    if (!userId || !portfolioData) {
      return res.status(400).json({ error: 'userId and portfolioData are required' });
    }

    const result = await savePortfolio(userId, portfolioData);
    
    res.json(result);
  } catch (error) {
    console.error('Error saving portfolio:', error);
    res.status(500).json({ error: 'Failed to save portfolio' });
  }
});

// Get portfolio endpoint
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const portfolio = await getPortfolio(userId);
    
    res.json(portfolio);
  } catch (error) {
    console.error('Error getting portfolio:', error);
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
});

// Generate project description endpoint
router.post('/generate-description', async (req: Request, res: Response) => {
  try {
    const { project } = req.body;
    
    if (!project) {
      return res.status(400).json({ error: 'project is required' });
    }

    const description = await generateProjectDescription(project);
    
    res.json(description);
  } catch (error) {
    console.error('Error generating project description:', error);
    res.status(500).json({ error: 'Failed to generate project description' });
  }
});

// Generate portfolio suggestions endpoint
router.post('/suggestions', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const suggestions = await generatePortfolioSuggestions(userId);
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error generating portfolio suggestions:', error);
    res.status(500).json({ error: 'Failed to generate portfolio suggestions' });
  }
});

// Export portfolio endpoint
router.get('/export/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await exportPortfolio(userId);
    
    if (result.success) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="portfolio-${userId}.json"`);
      res.json(result.portfolio);
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error('Error exporting portfolio:', error);
    res.status(500).json({ error: 'Failed to export portfolio' });
  }
});

// Generate portfolio website endpoint
router.post('/generate-website', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const website = await generatePortfolioWebsite(userId);
    
    res.json(website);
  } catch (error) {
    console.error('Error generating portfolio website:', error);
    res.status(500).json({ error: 'Failed to generate portfolio website' });
  }
});

export default router;