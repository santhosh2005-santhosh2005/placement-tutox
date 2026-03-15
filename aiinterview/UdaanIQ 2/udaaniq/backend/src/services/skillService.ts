import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDfdmQb3szgheqZMGLXybiXQUqcOQKWe8c");

// Function to generate skill tests using Gemini
export async function generateSkillTests(skills: string[]): Promise<any> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for generating skill tests
    const prompt = `Generate AI-powered tests for the following skills:
    
    SKILLS: ${skills.join(", ")}
    
    For each skill, provide:
    1. A practical coding challenge
    2. 2-3 Multiple Choice Questions (MCQs)
    3. 1 conceptual question
    
    Output the result in JSON format with the following structure:
    {
      "tests": [
        {
          "skill": "React",
          "challenge": "Create a search bar with debounce and API integration.",
          "mcqs": [
            {
              "id": "react-1",
              "q": "Which hook replaces componentDidMount?",
              "options": ["useState","useEffect","useMemo","useRef"],
              "answer": "useEffect"
            },
            {
              "id": "react-2",
              "q": "What is the use of key prop in lists?",
              "options": ["Styling","Performance","DOM identification","All of these"],
              "answer": "DOM identification"
            }
          ],
          "conceptual": "How can React.memo improve component performance?"
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
    console.error('Error generating skill tests with Gemini:', error);
    // Fallback to mock data if API fails
    return {
      tests: skills.map((skill, index) => ({
        skill,
        challenge: `Practical challenge for ${skill}`,
        mcqs: [
          {
            id: `${skill.toLowerCase()}-${index}-1`,
            q: `What is a key concept in ${skill}?`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            answer: "Option A"
          },
          {
            id: `${skill.toLowerCase()}-${index}-2`,
            q: `What is another concept in ${skill}?`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            answer: "Option B"
          }
        ],
        conceptual: `Explain a conceptual aspect of ${skill}.`
      }))
    };
  }
}

// Function to submit test results and get feedback
export async function submitTestResults(results: any): Promise<any> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for evaluating test results
    const prompt = `Based on the user's test results, provide feedback:
    
    TEST RESULTS:
    ${JSON.stringify(results, null, 2)}
    
    Please provide:
    1. An overall score from 0-100
    2. Strengths
    3. Areas for improvement
    4. Motivational feedback
    
    Output the result in JSON format with the following structure:
    {
      "score": 85,
      "feedback": {
        "strengths": ["strength1", "strength2"],
        "improvements": ["improvement1", "improvement2"],
        "motivation": "You're making great progress! Keep learning and building projects."
      }
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
    console.error('Error submitting test results with Gemini:', error);
    // Fallback to mock data if API fails
    return {
      score: Math.floor(Math.random() * 40) + 60, // 60-99
      feedback: {
        strengths: ["Strong understanding of core concepts", "Good problem-solving approach"],
        improvements: ["Practice more advanced features", "Work on practical applications"],
        motivation: "You're making great progress! Keep learning and building projects."
      }
    };
  }
}

// New function to analyze skill gaps
export async function analyzeSkillGaps(userSkills: string[], targetRole: string): Promise<any> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for skill gap analysis
    const prompt = `Analyze the skill gaps between the user's current skills and the requirements for a ${targetRole} role.
    
    USER'S CURRENT SKILLS: ${userSkills.join(", ")}
    TARGET ROLE: ${targetRole}
    
    Please provide:
    1. A skill gap analysis score from 0-100 (higher means fewer gaps)
    2. Skills the user already has that are relevant to the role
    3. Critical skills missing for the target role
    4. A personalized learning path to bridge the gaps
    5. Estimated time to become job-ready for this role
    
    Output the result in JSON format with the following structure:
    {
      "gap_score": 75,
      "existing_skills": ["skill1", "skill2"],
      "missing_skills": ["skill3", "skill4"],
      "learning_path": [
        {
          "phase": "Foundation",
          "skills": ["skillA", "skillB"],
          "duration": "2-3 months"
        },
        {
          "phase": "Intermediate",
          "skills": ["skillC", "skillD"],
          "duration": "3-4 months"
        },
        {
          "phase": "Advanced",
          "skills": ["skillE", "skillF"],
          "duration": "2-3 months"
        }
      ],
      "time_to_job_ready": "8-10 months"
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
    console.error('Error analyzing skill gaps with Gemini:', error);
    // Fallback to mock data if API fails
    return {
      gap_score: Math.floor(Math.random() * 30) + 70, // 70-99
      existing_skills: userSkills.slice(0, Math.floor(userSkills.length / 2)),
      missing_skills: ["System Design", "Cloud Computing", "DevOps", "Data Structures"],
      learning_path: [
        {
          "phase": "Foundation",
          "skills": ["JavaScript", "HTML/CSS", "Basic Algorithms"],
          "duration": "2-3 months"
        },
        {
          "phase": "Intermediate",
          "skills": ["React", "Node.js", "Database Design"],
          "duration": "3-4 months"
        },
        {
          "phase": "Advanced",
          "skills": ["System Design", "Cloud Computing", "DevOps"],
          "duration": "2-3 months"
        }
      ],
      "time_to_job_ready": "8-10 months"
    };
  }
}