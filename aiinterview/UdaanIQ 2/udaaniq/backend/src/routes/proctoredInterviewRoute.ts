import express from 'express';
import { 
  generateCompanyQuestions, 
  scoreAnswer, 
  generateInterviewReport,
  detectAIContent,
  analyzeVoicePatterns,
  detectSuspiciousPaste
} from '../services/proctoredInterviewService';

const router = express.Router();

// Generate company-specific interview questions
router.post('/generate-company-questions', async (req, res) => {
  try {
    const { company, role, difficultyProfile } = req.body;
    
    if (!company || !role) {
      return res.status(400).json({ error: 'Company and role are required' });
    }
    
    const questions = await generateCompanyQuestions(company, role, difficultyProfile);
    res.json(questions);
  } catch (error) {
    console.error('Error generating company questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

// Score candidate's answer
router.post('/score-answer', async (req, res) => {
  try {
    const { question, userAnswer } = req.body;
    
    if (!question || !userAnswer) {
      return res.status(400).json({ error: 'Question and user answer are required' });
    }
    
    const score = await scoreAnswer(question, userAnswer);
    res.json(score);
  } catch (error) {
    console.error('Error scoring answer:', error);
    res.status(500).json({ error: 'Failed to score answer' });
  }
});

// Generate final interview report
router.post('/generate-report', async (req, res) => {
  try {
    const { questions, answers, proctoringData } = req.body;
    
    if (!questions || !answers) {
      return res.status(400).json({ error: 'Questions and answers are required' });
    }
    
    const report = await generateInterviewReport(questions, answers, proctoringData);
    res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Detect AI-generated content
router.post('/detect-ai-content', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const isAI = await detectAIContent(text);
    res.json({ isAI });
  } catch (error) {
    console.error('Error detecting AI content:', error);
    res.status(500).json({ error: 'Failed to detect AI content' });
  }
});

// Analyze voice patterns
router.post('/analyze-voice', async (req, res) => {
  try {
    const { voiceActivity, backgroundNoise } = req.body;
    
    if (voiceActivity === undefined || backgroundNoise === undefined) {
      return res.status(400).json({ error: 'Voice activity and background noise are required' });
    }
    
    const result = analyzeVoicePatterns(voiceActivity, backgroundNoise);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing voice patterns:', error);
    res.status(500).json({ error: 'Failed to analyze voice patterns' });
  }
});

// Detect suspicious paste patterns
router.post('/detect-suspicious-paste', async (req, res) => {
  try {
    const { pasteEvents, timeBetweenPastes } = req.body;
    
    if (pasteEvents === undefined || !timeBetweenPastes) {
      return res.status(400).json({ error: 'Paste events and time between pastes are required' });
    }
    
    const result = detectSuspiciousPaste(pasteEvents, timeBetweenPastes);
    res.json(result);
  } catch (error) {
    console.error('Error detecting suspicious paste:', error);
    res.status(500).json({ error: 'Failed to detect suspicious paste' });
  }
});

export default router;