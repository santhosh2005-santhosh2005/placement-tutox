import express, { Router, Request, Response } from 'express';
import { analyzeResume, scanResumeForATS } from '../services/resumeService';
import multer from 'multer';

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Resume analysis endpoint
router.post('/analyze-resume', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    const { jobDescription } = req.body;
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const analysisResult = await analyzeResume(resumeFile.buffer, resumeFile.mimetype, jobDescription);
    
    res.json(analysisResult);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

// New endpoint for ATS scanning
router.post('/scan-ats', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    const atsResult = await scanResumeForATS(resumeFile.buffer, resumeFile.mimetype);
    
    res.json(atsResult);
  } catch (error) {
    console.error('Error scanning resume for ATS:', error);
    res.status(500).json({ error: 'Failed to scan resume for ATS compatibility' });
  }
});

export default router;