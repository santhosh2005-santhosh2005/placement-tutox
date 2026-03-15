import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDfdmQb3szgheqZMGLXybiXQUqcOQKWe8c");

// Function to generate interview questions using Gemini
export async function generateInterviewQuestions(skills: string[], experienceLevel: string = "Intermediate", jobRole: string = "Software Engineer"): Promise<any> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for generating interview questions
    const prompt = `Generate interview questions for a candidate with the following profile:
    
    Job Role: ${jobRole}
    Experience Level: ${experienceLevel}
    Skills: ${skills.join(", ")}
    
    Provide a mix of:
    1. 3-4 Technical questions (related to the skills listed)
    2. 2 Behavioral questions
    3. 1-2 System Design questions (if experience level is above entry-level)
    4. 1 Problem-solving/coding question
    
    Output the result in JSON format with the following structure:
    {
      "technical": [
        {
          "id": "tech-1",
          "question": "technical question 1",
          "skill": "relevant skill",
          "difficulty": "Easy/Medium/Hard"
        }
      ],
      "behavioral": [
        {
          "id": "beh-1",
          "question": "behavioral question 1"
        }
      ],
      "systemDesign": [
        {
          "id": "sys-1",
          "question": "system design question 1",
          "complexity": "Low/Medium/High"
        }
      ],
      "problemSolving": [
        {
          "id": "ps-1",
          "question": "problem solving question 1",
          "type": "Algorithm/Data Structure/Logic"
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
    console.error('Error generating interview questions with Gemini:', error);
    // Fallback to mock data if API fails
    return {
      technical: skills.map((skill, index) => ({
        id: `tech-${index + 1}`,
        question: `Explain a key concept in ${skill}?`,
        skill: skill,
        difficulty: "Medium"
      })),
      behavioral: [
        {
          id: "beh-1",
          question: "Tell me about a time you faced a challenging problem and how you solved it."
        },
        {
          id: "beh-2",
          question: "Describe a situation where you had to work with a difficult team member."
        }
      ],
      systemDesign: experienceLevel !== "Entry Level" ? [
        {
          id: "sys-1",
          question: "How would you design a URL shortening service like Bit.ly?",
          complexity: "Medium"
        }
      ] : [],
      problemSolving: [
        {
          id: "ps-1",
          question: "Given an array of integers, find two numbers that add up to a specific target.",
          type: "Algorithm"
        }
      ]
    };
  }
}