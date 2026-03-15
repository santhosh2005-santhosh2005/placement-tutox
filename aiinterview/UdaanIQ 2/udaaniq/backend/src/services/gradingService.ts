import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { gradingSchema, validateGrading } from "../schemas/gradingSchema";

// Function to determine if an HTTP status is retryable
export function isRetryableStatus(status: number): boolean {
  return [429, 500, 502, 503, 504].includes(status);
}

// Function to call Gemini API with timeout
export async function callGemini(prompt: string, timeoutMs: number = 15000): Promise<string> {
  try {
    // Using Google Generative AI SDK
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    
    const response = await result.response;
    const text = response.text();
    
    if (!text) throw new Error("Empty LLM response");
    return text;
  } catch (error: any) {
    console.error("Gemini SDK error:", error.message);
    // If Google SDK fails, try direct API call
    if (process.env.GEMINI_API_KEY) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const resp = await axios.post(url, {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }, { timeout: timeoutMs });
        
        // Adapt to Gemini response shape
        const raw = resp?.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                    resp?.data?.output || null;
        
        if (!raw) throw new Error("Empty LLM response from direct API call");
        return raw;
      } catch (axiosError: any) {
        console.error("Direct API call error:", axiosError.message);
        console.error("Response status:", axiosError.response?.status);
        console.error("Response data:", axiosError.response?.data);
        
        // Re-throw the original error with more context
        throw new Error(`Gemini API error: ${axiosError.message} (Status: ${axiosError.response?.status})`);
      }
    }
    throw error;
  }
}

// Function to parse and extract JSON from LLM response
export function parseLLMResponse(raw: string): any {
  try {
    // Try direct JSON parsing first
    return JSON.parse(raw);
  } catch (e) {
    // If direct parsing fails, try to extract JSON from the text
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    } else {
      throw new Error("LLM returned non-JSON");
    }
  }
}

// Function to save evaluation to session (placeholder implementation)
export async function saveEvaluationToSession(sessionId: string, questionId: string, evaluation: any): Promise<void> {
  // In a real implementation, this would save to a database
  console.log(`Saving evaluation for session ${sessionId}, question ${questionId}:`, evaluation);
  
  // For now, we'll just log it
  // TODO: Implement actual database persistence
}

// Function to record metrics (placeholder implementation)
export function recordMetric(metric: string, data?: any): void {
  // In a real implementation, this would send metrics to a monitoring system
  console.log(`Metric recorded: ${metric}`, data);
}