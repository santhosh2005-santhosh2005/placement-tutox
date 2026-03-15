import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import resumeRoutes from './routes/resumeRoutes';
import skillRoutes from './routes/skillRoutes';
import roadmapRoutes from './routes/roadmapRoutes';
import interviewRoutes from './routes/interviewRoutes';
import mockInterviewRoutes from './routes/mockInterviewRoutes';
import codingChallengeRoutes from './routes/codingChallengeRoutes';
import progressRoutes from './routes/progressRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import authRoutes from './routes/authRoutes';
import peerComparisonRoutes from './routes/peerComparisonRoutes';
import jobMatchingRoutes from './routes/jobMatchingRoutes';
import forumRoutes from './routes/forumRoutes';
import githubRoutes from './routes/githubRoutes';
import linkedinRoutes from './routes/linkedinRoutes';
import stackoverflowRoutes from './routes/stackoverflowRoutes';
import proctoredInterviewRoutes from './routes/proctoredInterviewRoute';
import interviewSessionRoutes from './routes/interviewSessionRoutes';
import geminiTestRoute from './routes/geminiTestRoute';
import gradingRoutes from './routes/gradingRoutes';
import aiInterviewRoutes from './routes/aiInterviewRoutes';
import aiHrInterviewRoutes from './routes/aiHrInterviewRoutes';
import cookieParser from 'cookie-parser';

const app: Express = express();
const port = process.env.PORT || 3000;

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:3007', 'http://localhost:4005', 'http://localhost:5020'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api', resumeRoutes);
app.use('/api', skillRoutes);
app.use('/api', roadmapRoutes);
app.use('/api', interviewRoutes);
app.use('/api', mockInterviewRoutes);
app.use('/api', codingChallengeRoutes);
app.use('/api', progressRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api', authRoutes);
app.use('/api', peerComparisonRoutes);
app.use('/api', jobMatchingRoutes);
app.use('/api', forumRoutes);
app.use('/api', githubRoutes);
app.use('/api', linkedinRoutes);
app.use('/api', stackoverflowRoutes);
app.use('/api', proctoredInterviewRoutes);
app.use('/api', interviewSessionRoutes);
app.use('/api', geminiTestRoute);
app.use('/api', gradingRoutes);
app.use('/api/ai-interview', aiInterviewRoutes);
app.use('/api/interview', aiHrInterviewRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('UdaanIQ Backend Server is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});