import dotenv = require('dotenv');
dotenv.config();

import axios from "axios";

// Function to fetch questions from Gemini using REST API
export async function fetchQuestionsFromGemini(prompt: string): Promise<string> {
  // Check for API key at function call time
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in environment");
  }
  
  try {
    // Use the official Gemini REST API endpoint with a supported model
    const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent";
    
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
          maxOutputTokens: 2048
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
    
    return raw;
  } catch (error: any) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw error;
  }
}

// Function to get cached questions
export async function getCachedQuestions(company: string, role: string): Promise<any[]> {
  // This is a simplified cache implementation
  // In a real application, you would fetch from a database
  
  return [
    {
      id: "q1",
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
      id: "q2",
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
      id: "q3",
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

// Function to save a question to a session
export async function saveQuestionToSession(sessionId: string, question: any): Promise<void> {
  // In a real implementation, this would save to a database
  // For now, we'll just log it
  console.log(`Saving question to session ${sessionId}:`, question);
}