import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDfdmQb3szgheqZMGLXybiXQUqcOQKWe8c");

// Mock data storage for user portfolios (in a real app, this would be a database)
let userPortfolios: any = {};

// Function to create or update user portfolio
export async function savePortfolio(userId: string, portfolioData: any): Promise<any> {
  try {
    userPortfolios[userId] = {
      userId,
      ...portfolioData,
      lastUpdated: new Date().toISOString()
    };
    
    return { success: true, message: 'Portfolio saved successfully', portfolio: userPortfolios[userId] };
  } catch (error) {
    console.error('Error saving portfolio:', error);
    return { success: false, message: 'Failed to save portfolio' };
  }
}

// Function to get user portfolio
export async function getPortfolio(userId: string): Promise<any> {
  try {
    if (!userPortfolios[userId]) {
      return {
        userId,
        personalInfo: {
          name: "",
          email: "",
          phone: "",
          linkedin: "",
          github: "",
          website: ""
        },
        projects: [],
        skills: [],
        experience: [],
        education: [],
        lastUpdated: new Date().toISOString()
      };
    }
    
    return userPortfolios[userId];
  } catch (error) {
    console.error('Error getting portfolio:', error);
    return { 
      userId,
      personalInfo: {
        name: "",
        email: "",
        phone: "",
        linkedin: "",
        github: "",
        website: ""
      },
      projects: [],
      skills: [],
      experience: [],
      education: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

// Function to generate project descriptions using AI
export async function generateProjectDescription(project: any): Promise<any> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for generating project descriptions
    const prompt = `Generate a professional project description for the following project:
    
    PROJECT TITLE: ${project.title}
    TECHNOLOGIES USED: ${project.technologies?.join(", ") || "Not specified"}
    PROJECT TYPE: ${project.type || "Not specified"}
    DESCRIPTION: ${project.description || "No description provided"}
    
    Please provide:
    1. An enhanced project title (if needed)
    2. A professional project description (2-3 paragraphs)
    3. Key achievements or outcomes
    4. Skills demonstrated
    
    Output the result in JSON format with the following structure:
    {
      "enhancedTitle": "Enhanced Project Title",
      "description": "Professional project description",
      "achievements": ["achievement1", "achievement2"],
      "skills": ["skill1", "skill2"]
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
    console.error('Error generating project description with Gemini:', error);
    // Fallback to mock data if API fails
    return {
      enhancedTitle: project.title,
      description: project.description || `This is a ${project.type || "software"} project that demonstrates proficiency in ${project.technologies?.join(", ") || "various technologies"}.`,
      achievements: ["Successfully implemented core features", "Demonstrated problem-solving skills"],
      skills: project.technologies || ["JavaScript", "React"]
    };
  }
}

// Function to generate portfolio suggestions
export async function generatePortfolioSuggestions(userId: string): Promise<any> {
  try {
    const portfolio = await getPortfolio(userId);
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for generating portfolio suggestions
    const prompt = `Based on the following portfolio data, provide suggestions for improvement:
    
    PORTFOLIO DATA:
    ${JSON.stringify(portfolio, null, 2)}
    
    Please provide:
    1. Overall portfolio strength (1-10)
    2. Areas that need improvement
    3. Specific suggestions for each section
    4. Recommended additional projects
    
    Output the result in JSON format with the following structure:
    {
      "overallScore": 7,
      "improvements": ["improvement1", "improvement2"],
      "sectionSuggestions": {
        "projects": "suggestion for projects section",
        "skills": "suggestion for skills section",
        "experience": "suggestion for experience section"
      },
      "recommendedProjects": [
        {
          "title": "Project Title",
          "description": "Project description",
          "technologies": ["tech1", "tech2"]
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
    console.error('Error generating portfolio suggestions with Gemini:', error);
    // Fallback to mock data if API fails
    return {
      overallScore: 6,
      improvements: ["Add more detailed project descriptions", "Include metrics or outcomes"],
      sectionSuggestions: {
        projects: "Add 2-3 more projects showcasing different skills",
        skills: "Organize skills by category (frontend, backend, etc.)",
        experience: "Include specific achievements with metrics"
      },
      recommendedProjects: [
        {
          title: "E-commerce Website",
          description: "A full-stack e-commerce platform with payment integration",
          technologies: ["React", "Node.js", "MongoDB"]
        }
      ]
    };
  }
}

// Function to export portfolio as JSON
export async function exportPortfolio(userId: string): Promise<any> {
  try {
    const portfolio = await getPortfolio(userId);
    return { success: true, portfolio };
  } catch (error) {
    console.error('Error exporting portfolio:', error);
    return { success: false, message: 'Failed to export portfolio' };
  }
}

// Function to generate a portfolio website
export async function generatePortfolioWebsite(userId: string): Promise<any> {
  try {
    const portfolio = await getPortfolio(userId);
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create prompt for generating a portfolio website
    const prompt = `Based on the following portfolio data, generate a complete, professional HTML/CSS portfolio website.
    The website should be modern, responsive, and showcase the person's skills and projects effectively.
    
    PORTFOLIO DATA:
    ${JSON.stringify(portfolio, null, 2)}
    
    Please provide:
    1. A complete HTML document with embedded CSS (no external dependencies)
    2. Responsive design that works on mobile and desktop
    3. Professional layout with header, about section, projects section, skills section, and contact section
    4. Clean, modern styling with a professional color scheme
    
    Output the result in JSON format with the following structure:
    {
      "html": "<!DOCTYPE html><html>...</html>",
      "theme": "professional"
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
    console.error('Error generating portfolio website with Gemini:', error);
    // Fallback to a simple HTML template if API fails
    const portfolio = await getPortfolio(userId);
    return {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${portfolio.personalInfo.name || 'Portfolio'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header { background: #2c3e50; color: white; padding: 1rem 0; }
        .header-content { display: flex; justify-content: space-between; align-items: center; }
        h1 { font-size: 2.5rem; }
        nav a { color: white; text-decoration: none; margin-left: 20px; }
        section { padding: 4rem 0; }
        h2 { text-align: center; margin-bottom: 2rem; font-size: 2rem; color: #2c3e50; }
        .about-content { display: flex; gap: 2rem; align-items: center; }
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
        .project-card { border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .skills-container { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; }
        .skill-tag { background: #3498db; color: white; padding: 0.5rem 1rem; border-radius: 20px; }
        footer { background: #34495e; color: white; text-align: center; padding: 2rem 0; }
    </style>
</head>
<body>
    <header>
        <div class="container header-content">
            <h1>${portfolio.personalInfo.name || 'Portfolio'}</h1>
            <nav>
                <a href="#about">About</a>
                <a href="#projects">Projects</a>
                <a href="#skills">Skills</a>
                <a href="#contact">Contact</a>
            </nav>
        </div>
    </header>
    
    <section id="about">
        <div class="container">
            <h2>About Me</h2>
            <div class="about-content">
                <div>
                    <p>Email: ${portfolio.personalInfo.email || 'Email not provided'}</p>
                    <p>Phone: ${portfolio.personalInfo.phone || 'Phone not provided'}</p>
                    <p>LinkedIn: ${portfolio.personalInfo.linkedin || 'LinkedIn not provided'}</p>
                </div>
            </div>
        </div>
    </section>
    
    <section id="projects" style="background: #f8f9fa;">
        <div class="container">
            <h2>Projects</h2>
            <div class="projects-grid">
                ${portfolio.projects.map((project: any) => `
                <div class="project-card">
                    <h3>${project.title || 'Untitled Project'}</h3>
                    <p>${project.description || 'No description provided.'}</p>
                    <div class="skills-container">
                        ${(project.technologies || []).map((tech: string) => `<span class="skill-tag">${tech}</span>`).join('')}
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
    
    <section id="skills">
        <div class="container">
            <h2>Skills</h2>
            <div class="skills-container">
                ${portfolio.skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>
    </section>
    
    <section id="contact" style="background: #f8f9fa;">
        <div class="container">
            <h2>Contact</h2>
            <p>Email: ${portfolio.personalInfo.email || 'Not provided'}</p>
            <p>Phone: ${portfolio.personalInfo.phone || 'Not provided'}</p>
        </div>
    </section>
    
    <footer>
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${portfolio.personalInfo.name || 'Portfolio'}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`,
      theme: "professional"
    };
  }
}