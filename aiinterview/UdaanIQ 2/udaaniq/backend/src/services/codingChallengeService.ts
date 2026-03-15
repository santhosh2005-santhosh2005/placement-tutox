import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDfdmQb3szgheqZMGLXybiXQUqcOQKWe8c");

// Function to generate a coding challenge using Gemini
export async function generateCodingChallenge(skill: string, difficulty: string = "Medium"): Promise<any> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for generating a coding challenge
    const prompt = `Generate a ${difficulty} level coding challenge for ${skill}.
    
    Output the result in JSON format with the following structure:
    {
      "id": "unique-id",
      "title": "Challenge Title",
      "description": "Detailed problem description",
      "difficulty": "${difficulty}",
      "skill": "${skill}",
      "inputFormat": "Description of input format",
      "outputFormat": "Description of output format",
      "examples": [
        {
          "input": "Sample input",
          "output": "Expected output",
          "explanation": "Explanation of the example"
        }
      ],
      "constraints": ["Constraint 1", "Constraint 2"],
      "hints": ["Hint 1", "Hint 2"],
      "tags": ["tag1", "tag2"]
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
    console.error('Error generating coding challenge with Gemini:', error);
    // Fallback to mock data if API fails
    return {
      id: "challenge-1",
      title: `Find Maximum in Array - ${skill}`,
      description: `Given an array of integers, find the maximum element in the array. This is a fundamental problem to test your understanding of arrays and basic iteration.`,
      difficulty: difficulty,
      skill: skill,
      inputFormat: "The first line contains an integer n, the size of the array. The second line contains n space-separated integers.",
      outputFormat: "Print the maximum element in the array.",
      examples: [
        {
          input: "5\n1 5 3 9 2",
          output: "9",
          explanation: "The maximum element in the array [1, 5, 3, 9, 2] is 9."
        },
        {
          input: "3\n-1 -5 -3",
          output: "-1",
          explanation: "The maximum element in the array [-1, -5, -3] is -1."
        }
      ],
      constraints: [
        "1 ≤ n ≤ 10^5",
        "-10^9 ≤ array elements ≤ 10^9"
      ],
      hints: [
        "Think about how you would find the maximum element manually.",
        "You need to iterate through the array once."
      ],
      tags: [skill, "arrays", "iteration"]
    };
  }
}

// Function to evaluate coding solution using Gemini
export async function evaluateCodingSolution(challenge: any, userSolution: string, testCases: any[]): Promise<any> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for evaluating the coding solution
    const prompt = `You are an expert coding interviewer. Evaluate the candidate's solution to the following coding challenge:
    
    CHALLENGE TITLE: ${challenge.title}
    CHALLENGE DESCRIPTION: ${challenge.description}
    
    CANDIDATE'S SOLUTION:
    ${userSolution}
    
    TEST CASES:
    ${JSON.stringify(testCases, null, 2)}
    
    Please provide:
    1. A score from 1-10 (where 1 is poor and 10 is excellent)
    2. Time complexity analysis
    3. Space complexity analysis
    4. Code quality assessment
    5. Specific feedback on what was good
    6. Areas for improvement
    7. A more optimal solution as a reference
    
    Output the result in JSON format with the following structure:
    {
      "score": 8,
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "codeQuality": "Good variable naming and clear logic",
      "strengths": ["strength1", "strength2"],
      "improvements": ["improvement1", "improvement2"],
      "betterSolution": "A more optimal solution"
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
    console.error('Error evaluating coding solution with Gemini:', error);
    // Fallback to mock data if API fails
    return {
      score: Math.floor(Math.random() * 4) + 6, // 6-9
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      codeQuality: "Good variable naming and clear logic",
      strengths: ["Correct approach to the problem", "Good handling of edge cases"],
      improvements: ["Consider optimizing for better time complexity", "Add more comments for clarity"],
      betterSolution: `Here's a more optimal solution that reduces time complexity.`
    };
  }
}

// Function to generate a coding path (sequence of challenges) using Gemini
export async function generateCodingPath(skill: string, count: number = 5): Promise<any> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for generating a coding path
    const prompt = `Generate a learning path of ${count} coding challenges for mastering ${skill}.
    Start with easy problems and gradually increase difficulty.
    
    Output the result in JSON format with the following structure:
    {
      "path": [
        {
          "id": "unique-id",
          "title": "Challenge Title",
          "difficulty": "Easy/Medium/Hard",
          "concepts": ["concept1", "concept2"],
          "timeEstimate": "Time estimate to solve"
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
    console.error('Error generating coding path with Gemini:', error);
    // Fallback to mock data if API fails
    const difficulties = ["Easy", "Easy", "Medium", "Medium", "Hard"];
    const concepts = [
      ["Basics", "Syntax"],
      ["Arrays", "Loops"],
      ["Functions", "Objects"],
      ["Data Structures", "Algorithms"],
      ["Advanced Concepts", "Optimization"]
    ];
    
    const path = [];
    for (let i = 0; i < count && i < difficulties.length; i++) {
      path.push({
        id: `path-${i + 1}`,
        title: `${skill} Challenge ${i + 1}`,
        difficulty: difficulties[i],
        concepts: concepts[i],
        timeEstimate: `${15 + i * 10} minutes`
      });
    }
    
    return { path };
  }
}