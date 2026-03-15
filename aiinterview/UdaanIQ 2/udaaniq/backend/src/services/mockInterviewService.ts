import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDfdmQb3szgheqZMGLXybiXQUqcOQKWe8c");

// Function to evaluate user's answer to an interview question using Gemini
export async function evaluateAnswer(question: string, userAnswer: string, questionType: string): Promise<any> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for evaluating the answer
    const prompt = `You are an experienced technical interviewer. Evaluate the candidate's answer to the following ${questionType} question:
    
    QUESTION:
    ${question}
    
    CANDIDATE'S ANSWER:
    ${userAnswer}
    
    Please provide:
    1. A score from 1-10 (where 1 is poor and 10 is excellent)
    2. Specific feedback on what was good
    3. Areas for improvement
    4. A more complete or better answer as a reference
    
    Output the result in JSON format with the following structure:
    {
      "score": 8,
      "strengths": ["strength1", "strength2"],
      "improvements": ["improvement1", "improvement2"],
      "betterAnswer": "A more complete answer"
    }`;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    
    // Parse and return the result
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error evaluating answer with Gemini:', error);
    // Fallback to mock data if API fails
    return {
      score: Math.floor(Math.random() * 4) + 6, // 6-9
      strengths: ["You addressed the core concepts", "Good structure in your response"],
      improvements: ["Add more specific examples", "Include technical details"],
      betterAnswer: `Here's a more comprehensive answer that covers additional aspects of the topic.`
    };
  }
}

// Function to generate a mock interview session
export async function generateMockInterview(skills: string[], experienceLevel: string = "Intermediate", jobRole: string = "Software Engineer"): Promise<any> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for generating a mock interview
    const prompt = `Generate a mock interview session for a candidate with the following profile:
    
    Job Role: ${jobRole}
    Experience Level: ${experienceLevel}
    Skills: ${skills.join(", ")}
    
    Create a sequence of 5-7 interview questions that would typically be asked in this type of interview.
    Include a mix of:
    1. Technical questions (2-3)
    2. Behavioral questions (1-2)
    3. Problem-solving/coding questions (1)
    4. System design questions (0-1, only if experience level is above entry-level)
    
    For each question, provide:
    - A unique ID
    - The question text
    - The type of question (technical, behavioral, problem-solving, system-design)
    - For technical questions, include the relevant skill
    
    Output the result in JSON format with the following structure:
    {
      "interview": [
        {
          "id": "q1",
          "question": "technical question 1",
          "type": "technical",
          "skill": "relevant skill"
        },
        {
          "id": "q2",
          "question": "behavioral question 1",
          "type": "behavioral"
        }
      ]
    }`;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    
    // Parse and return the result
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating mock interview with Gemini:', error);
    // Fallback to mock data if API fails
    return {
      interview: [
        {
          id: "q1",
          question: `Explain a key concept in ${skills[0] || 'JavaScript'}?`,
          type: "technical",
          skill: skills[0] || 'JavaScript'
        },
        {
          id: "q2",
          question: "Tell me about a time you faced a challenging problem and how you solved it.",
          type: "behavioral"
        },
        {
          id: "q3",
          question: "How would you design a URL shortening service like Bit.ly?",
          type: "system-design"
        }
      ]
    };
  }
}

// Function to generate overall feedback for the mock interview session
export async function generateInterviewFeedback(answers: any[]): Promise<any> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for generating overall feedback
    const prompt = `You are an experienced technical interviewer. Based on the candidate's answers to the interview questions, provide overall feedback:
    
    CANDIDATE'S ANSWERS:
    ${JSON.stringify(answers, null, 2)}
    
    Please provide:
    1. An overall score from 1-10 (where 1 is poor and 10 is excellent)
    2. Overall strengths
    3. Overall areas for improvement
    4. Recommendations for preparation
    
    Output the result in JSON format with the following structure:
    {
      "overallScore": 8,
      "overallStrengths": ["strength1", "strength2"],
      "overallImprovements": ["improvement1", "improvement2"],
      "recommendations": ["recommendation1", "recommendation2"]
    }`;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    
    // Parse and return the result
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating interview feedback with Gemini:', error);
    // Fallback to mock data if API fails
    return {
      overallScore: Math.floor(Math.random() * 4) + 6, // 6-9
      overallStrengths: ["Good technical knowledge", "Clear communication"],
      overallImprovements: ["Need more specific examples", "Work on system design concepts"],
      recommendations: ["Practice more coding problems", "Review system design principles"]
    };
  }
}

// Function to analyze a live interview chat transcript
export async function analyzeInterviewChat(messages: Array<{ role: string; content: string }>): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a senior interviewer analyzing an ongoing interview chat.

Chat Transcript (JSON):
${JSON.stringify(messages, null, 2)}

Provide:
1) Immediate feedback with 3 bullet points
2) A running score (1-10)
3) One actionable tip to improve the next answer
4) Propose the next most relevant interview question (single sentence)

Respond in JSON with keys: { "feedback": string[], "score": number, "tip": string, "nextQuestion": string }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error analyzing interview chat with Gemini:', error);
    return {
      feedback: [
        'Keep answers structured: context, approach, result',
        'Use concrete examples and metrics',
        'Clarify trade-offs briefly'
      ],
      score: Math.floor(Math.random() * 3) + 7,
      tip: 'State the problem, outline options, justify the choice in 1-2 lines.',
      nextQuestion: 'Can you walk me through how you would optimize a slow API endpoint end-to-end?'
    };
  }
}