import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDfdmQb3szgheqZMGLXybiXQUqcOQKWe8c");

// Function to get roadmap using Gemini
export async function getRoadmap(year: string): Promise<any> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for generating roadmap
    const prompt = `Generate a detailed career roadmap for ${year} engineering students.
    Provide:
    1. The year and branch (e.g., "2nd Year CSE")
    2. 3 key focus areas for this year
    3. 5-7 specific tasks or goals to accomplish this year
    
    Output the result in JSON format with the following structure:
    {
      "year": "${year}",
      "focus": ["focus area 1", "focus area 2", "focus area 3"],
      "to_do": [
        "specific task 1",
        "specific task 2",
        "specific task 3"
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
    console.error('Error generating roadmap with Gemini:', error);
    // Fallback to mock data if API fails
    const roadmaps: any = {
      "1st-Year-CSE": {
        year: "1st Year CSE",
        focus: ["Programming Basics", "Mathematics", "Problem Solving"],
        to_do: [
          "Learn C/Python programming fundamentals",
          "Practice basic algorithms and data structures",
          "Solve 100+ problems on HackerRank/LeetCode"
        ]
      },
      "2nd-Year-CSE": {
        year: "2nd Year CSE",
        focus: ["Data Structures", "Web Dev", "Hackathons"],
        to_do: [
          "Build 2 personal projects using HTML/CSS/JS",
          "Join a hackathon or coding club",
          "Start learning React basics"
        ]
      },
      "3rd-Year-CSE": {
        year: "3rd Year CSE",
        focus: ["Internships", "Advanced Tech", "System Design"],
        to_do: [
          "Apply for summer internships",
          "Learn about databases and backend development",
          "Study system design fundamentals"
        ]
      },
      "4th-Year-CSE": {
        year: "4th Year CSE",
        focus: ["Job Prep", "Interviews", "Specialization"],
        to_do: [
          "Prepare for technical interviews",
          "Build a portfolio website",
          "Apply to full-time positions"
        ]
      }
    };
    
    return roadmaps[year] || roadmaps["2nd-Year-CSE"];
  }
}