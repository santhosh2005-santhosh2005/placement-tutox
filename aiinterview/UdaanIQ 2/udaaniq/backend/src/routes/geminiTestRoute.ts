import express, { Router, Request, Response } from 'express';
import axios from 'axios';

const router: Router = express.Router();

// Test Gemini API connectivity
router.get('/test/gemini', async (req: Request, res: Response) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    console.log('GEMINI_API_KEY exists:', !!GEMINI_API_KEY);
    if (GEMINI_API_KEY) {
      console.log('GEMINI_API_KEY length:', GEMINI_API_KEY.length);
      console.log('GEMINI_API_KEY starts with:', GEMINI_API_KEY.substring(0, 10) + '...');
    }
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not found in environment' });
    }

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await axios.post(
      GEMINI_URL,
      {
        contents: [{
          parts: [{
            text: "Return JSON: [{\"id\":\"1\",\"text\":\"Test question\"}]"
          }]
        }]
      },
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    console.error('Gemini Test Fail:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.message, 
      details: error.response?.data 
    });
  }
});

// Check environment variables
router.get('/test/env', (req: Request, res: Response) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  
  res.json({
    geminiKeyExists: !!geminiKey,
    geminiKeyLength: geminiKey ? geminiKey.length : 0,
    geminiKeyPreview: geminiKey ? geminiKey.substring(0, 10) + '...' : null,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('API') || key.includes('KEY'))
  });
});

// List available models
router.get('/test/models', async (req: Request, res: Response) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not found in environment' });
    }

    const MODELS_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    
    const response = await axios.get(MODELS_URL, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    console.error('Models List Fail:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.message, 
      details: error.response?.data 
    });
  }
});

export default router;