import { fetchQuestionsFromGemini, getCachedQuestions } from '../services/interviewSessionService';

// Mock the environment variables
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn()
}));

describe('Interview Session Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchQuestionsFromGemini', () => {
    it('should fetch questions successfully from Gemini API', async () => {
      const mockResponse = {
        data: {
          candidates: [{
            content: {
              parts: [{
                text: '[{"id":"q1","text":"Test question","difficulty":"medium","topics":["test"],"time":5,"rubric":{"correctness":0.6,"efficiency":0.2,"explainability":0.2}}]'
              }]
            }
          }]
        }
      };

      const axios = require('axios');
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      process.env.GEMINI_API_KEY = 'test-key';

      const result = await fetchQuestionsFromGemini('test prompt');
      
      expect(result).toContain('Test question');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should throw error when API key is missing', async () => {
      delete process.env.GEMINI_API_KEY;

      await expect(fetchQuestionsFromGemini('test prompt'))
        .rejects
        .toThrow('Missing GEMINI_API_KEY in environment');
    });

    it('should throw error when no candidates returned', async () => {
      const mockResponse = {
        data: {}
      };

      const axios = require('axios');
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      process.env.GEMINI_API_KEY = 'test-key';

      await expect(fetchQuestionsFromGemini('test prompt'))
        .rejects
        .toThrow('No candidates returned from Gemini');
    });
  });

  describe('getCachedQuestions', () => {
    it('should return cached questions', async () => {
      const result = await getCachedQuestions('TestCompany', 'TestRole');
      
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('text');
      expect(result[0]).toHaveProperty('difficulty');
      expect(result[0]).toHaveProperty('topics');
      expect(result[0]).toHaveProperty('time');
      expect(result[0]).toHaveProperty('rubric');
    });
  });
});