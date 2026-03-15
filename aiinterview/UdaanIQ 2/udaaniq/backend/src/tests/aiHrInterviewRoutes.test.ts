import request from 'supertest';
import express from 'express';
import aiHrInterviewRoutes from '../routes/aiHrInterviewRoutes';

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/interview', aiHrInterviewRoutes);

describe('AI HR Interview Routes', () => {
  describe('POST /api/interview/create', () => {
    it('should create a new interview session', async () => {
      const response = await request(app)
        .post('/api/interview/create')
        .send({
          userId: 'test_user_123',
          company: 'Google',
          role: 'Software Engineer',
          mode: 'Practice',
          strictness: 'medium',
          consent: true
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/interview/create')
        .send({
          company: 'Google',
          role: 'Software Engineer'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/interview/:sessionId/next-question', () => {
    let sessionId: string;

    // Create a session before running these tests
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/interview/create')
        .send({
          userId: 'test_user_123',
          company: 'Google',
          role: 'Software Engineer',
          mode: 'Practice',
          strictness: 'medium',
          consent: true
        });
      
      sessionId = response.body.sessionId;
    });

    it('should return next question with fallback=true when Gemini is not available', async () => {
      const response = await request(app)
        .post(`/api/interview/${sessionId}/next-question`)
        .send({
          fetchMode: 'next'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('fallback', true);
      expect(response.body).toHaveProperty('question');
      expect(response.body).toHaveProperty('audioUrl');
      expect(response.body).toHaveProperty('avatarVideoUrl');
    });

    it('should return same question with incremented repeat count when fetchMode is repeat', async () => {
      // First get a question
      await request(app)
        .post(`/api/interview/${sessionId}/next-question`)
        .send({
          fetchMode: 'next'
        });
      
      // Then repeat it
      const response = await request(app)
        .post(`/api/interview/${sessionId}/next-question`)
        .send({
          fetchMode: 'repeat'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('repeatCount');
    });
  });

  describe('POST /api/interview/:sessionId/save-answer', () => {
    let sessionId: string;

    // Create a session before running these tests
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/interview/create')
        .send({
          userId: 'test_user_123',
          company: 'Google',
          role: 'Software Engineer',
          mode: 'Practice',
          strictness: 'medium',
          consent: true
        });
      
      sessionId = response.body.sessionId;
    });

    it('should save answer successfully', async () => {
      const response = await request(app)
        .post(`/api/interview/${sessionId}/save-answer`)
        .send({
          questionId: 'test_question_123',
          transcript: 'This is a test answer',
          duration: 30
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post(`/api/interview/${sessionId}/save-answer`)
        .send({
          questionId: 'test_question_123'
          // missing transcript
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/interview/:sessionId/logs', () => {
    let sessionId: string;

    // Create a session before running these tests
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/interview/create')
        .send({
          userId: 'test_user_123',
          company: 'Google',
          role: 'Software Engineer',
          mode: 'Practice',
          strictness: 'medium',
          consent: true
        });
      
      sessionId = response.body.sessionId;
    });

    it('should log proctoring events successfully', async () => {
      const response = await request(app)
        .post(`/api/interview/${sessionId}/logs`)
        .send({
          events: [
            { type: 'visibility', value: 'hidden', timestamp: new Date().toISOString() }
          ]
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if events array is missing', async () => {
      const response = await request(app)
        .post(`/api/interview/${sessionId}/logs`)
        .send({
          // missing events
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });
});