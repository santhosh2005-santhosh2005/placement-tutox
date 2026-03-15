import dotenv = require('dotenv');
dotenv.config();

import axios from 'axios';
import { synthesizeTextToMp3, generateAvatarVideo } from './ttsService';

// Function to fetch questions from Gemini using REST API with retry logic
export async function fetchQuestionsFromGeminiWithRetry(prompt: string, maxRetries: number = 2): Promise<any[]> {
  // Check for API key at function call time
  const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in environment");
  }
  
  const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  
  // Helper function for sleep
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Helper function to check if error is retryable
  function isRetryable(code: number) {
    return [429, 500, 502, 503, 504].includes(code);
  }
  
  let attempt = 0;
  let lastErr: any = null;
  
  while (attempt <= maxRetries) {
    try {
      console.log(`Attempt ${attempt + 1} to fetch questions from Gemini`);
      
      const response = await axios.post(
        `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          }
        },
        {
          timeout: 15000, // 15 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Extract the generated text from the response
      const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) {
        throw new Error("No candidates returned from Gemini");
      }
      
      // Try to parse JSON
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (parseError) {
        // Try to extract JSON from markdown
        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']');
        if (start >= 0 && end > start) {
          parsed = JSON.parse(raw.slice(start, end + 1));
        } else {
          throw new Error("Failed to parse Gemini response as JSON");
        }
      }
      
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Empty or invalid question array from Gemini");
      }
      
      return parsed;
    } catch (error: any) {
      lastErr = error;
      const statusCode = error?.response?.status;
      const retryable = statusCode ? isRetryable(statusCode) : /timeout|ETIMEDOUT|ECONNRESET/i.test(error.message);
      
      console.error(`Gemini API attempt ${attempt + 1} failed:`, {
        statusCode,
        message: error?.message || error,
        response: error?.response?.data,
        stack: error?.stack
      });
      
      if (retryable && attempt < maxRetries) { 
        attempt++; 
        console.log(`Retrying in ${500 * Math.pow(3, attempt)}ms...`);
        await sleep(500 * Math.pow(3, attempt)); 
        continue; 
      }
      
      throw error;
    }
  }
  
  throw lastErr;
}

// Function to get cached questions
export async function getCachedQuestions(company: string, role: string): Promise<any[]> {
  // This is a simplified cache implementation
  // In a real application, you would fetch from a database
  
  return [
    {
      id: "cached_q1",
      text: `How would you approach solving a complex problem as a ${role} at ${company}?`,
      difficulty: "medium",
      topics: ["problem-solving", "role-specific"],
      time: 5,
      rubric: {
        correctness: 0.5,
        efficiency: 0.25,
        explainability: 0.25
      }
    },
    {
      id: "cached_q2",
      text: `What are the key challenges you anticipate facing in this role at ${company}, and how would you address them?`,
      difficulty: "medium",
      topics: ["role-understanding", "adaptability"],
      time: 5,
      rubric: {
        correctness: 0.4,
        efficiency: 0.3,
        explainability: 0.3
      }
    },
    {
      id: "cached_q3",
      text: `Describe a time when you had to work with a difficult team member. How did you handle the situation?`,
      difficulty: "easy",
      topics: ["teamwork", "communication"],
      time: 3,
      rubric: {
        correctness: 0.4,
        efficiency: 0.2,
        explainability: 0.4
      }
    }
  ];
}

// Function to generate TTS for a question with fallback
export async function generateQuestionTTS(questionText: string, voice: string = 'en-US-Wavenet-D'): Promise<string> {
  try {
    const audioUrl = await synthesizeTextToMp3(questionText, voice);
    return audioUrl;
  } catch (error) {
    console.error('TTS generation failed, using mock URL:', error);
    // Return a mock URL as fallback
    return `https://example.com/audio/mock-${Date.now()}.mp3`;
  }
}

// Function to generate avatar video for a question with fallback
export async function generateQuestionAvatarVideo(questionText: string, audioUrl?: string): Promise<string> {
  try {
    const avatarVideoUrl = await generateAvatarVideo(questionText, audioUrl);
    return avatarVideoUrl;
  } catch (error) {
    console.error('Avatar video generation failed, using mock URL:', error);
    // Return a mock URL as fallback
    return `https://example.com/avatar/mock-${Date.now()}.mp4`;
  }
}