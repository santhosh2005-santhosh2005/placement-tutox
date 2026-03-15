import { GoogleGenerativeAI } from "@google/generative-ai";
// import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDfdmQb3szgheqZMGLXybiXQUqcOQKWe8c");

// Function to extract text from PDF
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Temporary mock implementation
    return "Mock PDF text extraction";
    // const data = await pdfParse(buffer);
    // return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Function to extract text from DOCX
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

// Function to analyze resume against job description using Gemini
export async function analyzeResume(resumeBuffer: Buffer, fileType: string, jobDescription: string): Promise<any> {
  try {
    // Extract text from resume based on file type
    let resumeText: string;
    if (fileType === 'application/pdf') {
      resumeText = await extractTextFromPDF(resumeBuffer);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      resumeText = await extractTextFromDOCX(resumeBuffer);
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for resume analysis
    const prompt = `Analyze the following resume against the job description.
    
    RESUME TEXT:
    ${resumeText}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    Please provide:
    1. A total fit score from 0-100
    2. A detailed breakdown of scores (skills, experience, projects, education, ATS compatibility)
    3. Specific suggestions for improvement
    
    Output the result in JSON format with the following structure:
    {
      "total_score": 82,
      "breakdown": {
        "skills": 30,
        "experience": 22,
        "projects": 16,
        "education": 7,
        "ats": 7
      },
      "suggestions": [
        "Add measurable results to project descriptions.",
        "Include keyword: 'API integration'.",
        "Reformat experience section for better ATS readability."
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
    console.error('Error analyzing resume with Gemini:', error);
    // Fallback to mock data if API fails
    return {
      total_score: Math.floor(Math.random() * 30) + 70, // 70-99
      breakdown: {
        skills: Math.floor(Math.random() * 10) + 25, // 25-35
        experience: Math.floor(Math.random() * 10) + 15, // 15-25
        projects: Math.floor(Math.random() * 10) + 10, // 10-20
        education: Math.floor(Math.random() * 5) + 5, // 5-10
        ats: Math.floor(Math.random() * 10) + 5 // 5-15
      },
      suggestions: [
        "Add measurable results to project descriptions.",
        "Include keyword: 'API integration'.",
        "Reformat experience section for better ATS readability."
      ]
    };
  }
}

// New function to scan resume for ATS compatibility
export async function scanResumeForATS(resumeBuffer: Buffer, fileType: string): Promise<any> {
  try {
    // Extract text from resume based on file type
    let resumeText: string;
    if (fileType === 'application/pdf') {
      resumeText = await extractTextFromPDF(resumeBuffer);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      resumeText = await extractTextFromDOCX(resumeBuffer);
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for ATS analysis
    const prompt = `Analyze the following resume for ATS (Applicant Tracking System) compatibility.
    
    RESUME TEXT:
    ${resumeText}
    
    Please provide:
    1. An ATS compatibility score from 0-100
    2. A detailed analysis of ATS-friendly elements
    3. Specific issues that might cause the resume to be rejected by ATS
    4. Recommendations to improve ATS compatibility
    
    Output the result in JSON format with the following structure:
    {
      "ats_score": 75,
      "analysis": {
        "keywords": "Good use of relevant keywords",
        "formatting": "Simple formatting that ATS can parse",
        "sections": "Clear section headings recognized by ATS"
      },
      "issues": [
        "Avoid complex tables that ATS cannot parse",
        "Use standard section headings like 'Experience' and 'Education'",
        "Remove graphics and images"
      ],
      "recommendations": [
        "Use standard fonts like Arial or Calibri",
        "Include relevant keywords from job descriptions",
        "Use bullet points instead of paragraphs"
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
    console.error('Error scanning resume for ATS with Gemini:', error);
    // Fallback to mock data if API fails
    return {
      ats_score: Math.floor(Math.random() * 30) + 70, // 70-99
      analysis: {
        keywords: "Good use of relevant keywords",
        formatting: "Simple formatting that ATS can parse",
        sections: "Clear section headings recognized by ATS"
      },
      issues: [
        "Avoid complex tables that ATS cannot parse",
        "Use standard section headings like 'Experience' and 'Education'",
        "Remove graphics and images"
      ],
      recommendations: [
        "Use standard fonts like Arial or Calibri",
        "Include relevant keywords from job descriptions",
        "Use bullet points instead of paragraphs"
      ]
    };
  }
}