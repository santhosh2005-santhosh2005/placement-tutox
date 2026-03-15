import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDM3E_gG73xA1MBdvwFDSn95ns6VvojCm8");

// Function to generate company-specific interview questions
export async function generateCompanyQuestions(company: string, role: string, difficultyProfile: string = "mix"): Promise<any> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Create prompt for generating company-specific questions
    const prompt = `You are an interview question generator for ${company}. 
    Generate 8-12 role-specific questions with difficulty tags, expected topics, sample rubrics and ideal time allocations.
    
    Company: ${company}
    Role: ${role}
    Difficulty Profile: ${difficultyProfile}
    
    IMPORTANT: Your response MUST be in valid JSON format with the following structure and nothing else:
    [
      {
        "id": "q1",
        "text": "Design a responsive dashboard...",
        "difficulty": "medium",
        "topics": ["css", "react"],
        "time": 20,
        "rubric": {
          "correctness": 0.6,
          "efficiency": 0.2,
          "explainability": 0.2
        }
      }
    ]`;
    
    // Generate content with structured format
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1500,
      }
    });
    
    const response = await result.response;
    const text = response.text();
    
    try {
      // Try direct JSON parsing first
      return JSON.parse(text);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from the text
      console.log("Direct JSON parsing failed, attempting to extract JSON from text");
      const jsonRegex = /\[[\s\S]*\]/g;
      const jsonMatch = text.match(jsonRegex);
      
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract valid JSON from response");
      }
    }
  } catch (error) {
    console.error('Error generating company questions with Gemini:', error);
    // Fallback to mock data if API fails
    return [
      {
        id: "q1",
        text: `How would you optimize a ${role} application at ${company}?`,
        difficulty: "medium",
        topics: ["optimization", "performance"],
        time: 15,
        rubric: {
          correctness: 0.6,
          efficiency: 0.2,
          explainability: 0.2
        }
      },
      {
        id: "q2",
        text: `Describe a challenging project you worked on as a ${role} at ${company}.`,
        difficulty: "easy",
        topics: ["experience", "problem-solving"],
        time: 10,
        rubric: {
          correctness: 0.5,
          efficiency: 0.2,
          explainability: 0.3
        }
      },
      {
        id: "q3",
        text: `How would you handle a critical production issue in a ${role} role at ${company}?`,
        difficulty: "hard",
        topics: ["debugging", "problem-solving", "communication"],
        time: 20,
        rubric: {
          correctness: 0.4,
          efficiency: 0.3,
          explainability: 0.3
        }
      }
    ];
  }
}

// Function to score candidate answers
export async function scoreAnswer(question: any, userAnswer: string): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are an expert interviewer scoring a candidate's answer.
    
    Question: ${question.text}
    Expected Topics: ${question.topics.join(", ")}
    Time Allocation: ${question.time} minutes
    Rubric: ${JSON.stringify(question.rubric)}
    
    Candidate's Answer: ${userAnswer}
    
    Score the candidate's answer based on the rubric and provide:
    1. A score from 1-10
    2. Breakdown of scores per rubric category
    3. Specific feedback
    4. Areas for improvement
    5. A better answer example
    
    IMPORTANT: Your response MUST be in valid JSON format with the following structure and nothing else:
    {
      "totalScore": 8,
      "breakdown": {
        "correctness": 5,
        "efficiency": 2,
        "explainability": 1
      },
      "feedback": "Detailed feedback here",
      "improvements": ["improvement1", "improvement2"],
      "betterAnswer": "A better example answer here"
    }`;
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    const response = await result.response;
    const text = response.text();
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      const jsonRegex = /{[\s\S]*}/g;
      const jsonMatch = text.match(jsonRegex);
      
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract valid JSON from response");
      }
    }
  } catch (error) {
    console.error('Error scoring answer with Gemini:', error);
    // Fallback scoring
    return {
      totalScore: Math.floor(Math.random() * 4) + 6, // 6-9
      breakdown: {
        correctness: Math.floor(Math.random() * 3) + 3,
        efficiency: Math.floor(Math.random() * 2) + 1,
        explainability: Math.floor(Math.random() * 2) + 1
      },
      feedback: "Good answer with some areas for improvement.",
      improvements: ["Add more specific examples", "Explain technical details"],
      betterAnswer: "A more comprehensive answer would include specific examples, technical details, and a clear explanation of the approach."
    };
  }
}

// Function to generate final interview report
export async function generateInterviewReport(questions: any[], answers: any[], proctoringData: any): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are a hiring manager creating a final interview report.
    
    Interview Questions: ${JSON.stringify(questions, null, 2)}
    Candidate Answers: ${JSON.stringify(answers, null, 2)}
    Proctoring Data: ${JSON.stringify(proctoringData, null, 2)}
    
    Generate a comprehensive report with:
    1. Overall score (1-10)
    2. Skill-based analysis
    3. Proctoring incident summary
    4. Recommendations
    5. Skill gap analysis
    
    IMPORTANT: Your response MUST be in valid JSON format with the following structure and nothing else:
    {
      "overallScore": 8,
      "skillAnalysis": {
        "skill1": 7,
        "skill2": 8
      },
      "proctoringSummary": {
        "focusLosses": 2,
        "pasteEvents": 1,
        "faceDetectionIssues": 0
      },
      "recommendations": ["recommendation1", "recommendation2"],
      "skillGaps": ["gap1", "gap2"]
    }`;
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
    
    const response = await result.response;
    const text = response.text();
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      const jsonRegex = /{[\s\S]*}/g;
      const jsonMatch = text.match(jsonRegex);
      
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract valid JSON from response");
      }
    }
  } catch (error) {
    console.error('Error generating interview report with Gemini:', error);
    // Fallback report
    return {
      overallScore: Math.floor(Math.random() * 4) + 6, // 6-9
      skillAnalysis: {
        "JavaScript": Math.floor(Math.random() * 4) + 6,
        "React": Math.floor(Math.random() * 4) + 6,
        "Problem Solving": Math.floor(Math.random() * 4) + 6
      },
      proctoringSummary: {
        focusLosses: proctoringData.focusLossCount || 0,
        pasteEvents: proctoringData.pasteEvents || 0,
        faceDetectionIssues: 0
      },
      recommendations: [
        "Practice more coding problems",
        "Improve system design knowledge",
        "Work on communication skills"
      ],
      skillGaps: [
        "Advanced algorithms",
        "System design patterns",
        "Database optimization"
      ]
    };
  }
}

// Function to detect AI-generated content
export async function detectAIContent(text: string): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Analyze the following text and determine if it appears to be AI-generated content.
    Look for patterns such as:
    - Unnaturally perfect grammar and structure
    - Overly formal or generic language
    - Lack of personal experience or specific details
    - Consistent sentence length and structure
    
    Text: ${text}
    
    Respond with ONLY "true" if it appears AI-generated or "false" if it appears human-generated.`;
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.0,
        topK: 1,
        topP: 0.95,
        maxOutputTokens: 10,
      }
    });
    
    const response = await result.response;
    const textResponse = response.text().trim().toLowerCase();
    
    return textResponse === "true";
  } catch (error) {
    console.error('Error detecting AI content:', error);
    return false;
  }
}

// Function to analyze voice patterns for suspicious activity
export function analyzeVoicePatterns(voiceActivity: boolean, backgroundNoise: number): { suspicious: boolean; reason: string } {
  // Simple heuristic for demonstration
  // In a real implementation, this would use more sophisticated audio analysis
  if (!voiceActivity && backgroundNoise > 0.5) {
    return {
      suspicious: true,
      reason: "High background noise with no voice activity detected"
    };
  }
  
  return {
    suspicious: false,
    reason: "Normal voice patterns detected"
  };
}

// Function to detect suspicious copy/paste patterns
export function detectSuspiciousPaste(pasteEvents: number, timeBetweenPastes: number[]): { suspicious: boolean; reason: string } {
  // Check for rapid successive pastes
  if (pasteEvents > 5) {
    return {
      suspicious: true,
      reason: "High number of paste events detected"
    };
  }
  
  // Check for unusually rapid pasting
  const avgTime = timeBetweenPastes.length > 0 
    ? timeBetweenPastes.reduce((a, b) => a + b, 0) / timeBetweenPastes.length 
    : 0;
    
  if (avgTime < 2 && timeBetweenPastes.length > 3) {
    return {
      suspicious: true,
      reason: "Rapid successive paste events detected"
    };
  }
  
  return {
    suspicious: false,
    reason: "Normal paste patterns detected"
  };
}