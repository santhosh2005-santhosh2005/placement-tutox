import request from 'supertest';
import express from 'express';
import gradingRoutes from '../routes/gradingRoutes';

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api', gradingRoutes);

describe('Grading Routes', () => {
  describe('POST /api/interviews/:sessionId/grade', () => {
    it('should return 400 when questionId is missing', async () => {
      const response = await request(app)
        .post('/api/interviews/test-session/grade')
        .send({ answer: 'Test answer' })
        .expect(400);
      
      expect(response.body.status).toBe('failed');
      expect(response.body.message).toBe('missing questionId or answer');
    });

    it('should return 400 when answer is missing', async () => {
      const response = await request(app)
        .post('/api/interviews/test-session/grade')
        .send({ questionId: 'q1' })
        .expect(400);
      
      expect(response.body.status).toBe('failed');
      expect(response.body.message).toBe('missing questionId or answer');
    });

    it('should return 500 when Gemini API is not available', async () => {
      // This test will pass if the Gemini API key is not set or API is unreachable
      const response = await request(app)
        .post('/api/interviews/test-session/grade')
        .send({ 
          questionId: 'q1', 
          answer: 'Test answer' 
        })
        .expect(500);
      
      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('Could not evaluate answer');
    });
  });
});