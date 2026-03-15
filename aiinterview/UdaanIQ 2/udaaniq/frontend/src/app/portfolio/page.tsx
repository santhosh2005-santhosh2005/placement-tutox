'use client';

import React, { useState, useEffect } from 'react';
import { 
  getPortfolio, 
  savePortfolio, 
  generateProjectDescription,
  generatePortfolioSuggestions,
  generatePortfolioWebsite,
  SavePortfolioRequest,
  Portfolio,
  Project,
  Experience,
  Education,
  PersonalInfo,
  GenerateProjectDescriptionRequest,
  PortfolioSuggestionsRequest,
  GeneratePortfolioWebsiteRequest
} from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

export default function PortfolioBuilder() {
  const [userId] = useState<string>('user123'); // In a real app, this would come from auth
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'projects' | 'experience' | 'education' | 'skills' | 'suggestions'>('personal');
  const [websiteHtml, setWebsiteHtml] = useState<string | null>(null);

  // Fetch portfolio data on component mount
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const data = await getPortfolio(userId);
        setPortfolio(data);
      } catch (err) {
        setError('Failed to load portfolio data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [userId]);

  // Handle personal info changes
  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    if (!portfolio) return;
    
    setPortfolio({
      ...portfolio,
      personalInfo: {
        ...portfolio.personalInfo,
        [field]: value
      }
    });
  };

  // Handle project changes
  const handleProjectChange = (index: number, field: keyof Project, value: any) => {
    if (!portfolio) return;
    
    const updatedProjects = [...portfolio.projects];
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value
    };
    
    setPortfolio({
      ...portfolio,
      projects: updatedProjects
    });
  };

  // Add a new project
  const addProject = () => {
    if (!portfolio) return;
    
    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: '',
      description: '',
      technologies: [],
      type: '',
      startDate: '',
      endDate: '',
      link: '',
      github: ''
    };
    
    setPortfolio({
      ...portfolio,
      projects: [...portfolio.projects, newProject]
    });
  };

  // Remove a project
  const removeProject = (index: number) => {
    if (!portfolio) return;
    
    const updatedProjects = [...portfolio.projects];
    updatedProjects.splice(index, 1);
    
    setPortfolio({
      ...portfolio,
      projects: updatedProjects
    });
  };

  // Handle experience changes
  const handleExperienceChange = (index: number, field: keyof Experience, value: any) => {
    if (!portfolio) return;
    
    const updatedExperience = [...portfolio.experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value
    };
    
    setPortfolio({
      ...portfolio,
      experience: updatedExperience
    });
  };

  // Add new experience
  const addExperience = () => {
    if (!portfolio) return;
    
    const newExperience: Experience = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      achievements: []
    };
    
    setPortfolio({
      ...portfolio,
      experience: [...portfolio.experience, newExperience]
    });
  };

  // Remove experience
  const removeExperience = (index: number) => {
    if (!portfolio) return;
    
    const updatedExperience = [...portfolio.experience];
    updatedExperience.splice(index, 1);
    
    setPortfolio({
      ...portfolio,
      experience: updatedExperience
    });
  };

  // Handle education changes
  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    if (!portfolio) return;
    
    const updatedEducation = [...portfolio.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    
    setPortfolio({
      ...portfolio,
      education: updatedEducation
    });
  };

  // Add new education
  const addEducation = () => {
    if (!portfolio) return;
    
    const newEducation: Education = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    
    setPortfolio({
      ...portfolio,
      education: [...portfolio.education, newEducation]
    });
  };

  // Remove education
  const removeEducation = (index: number) => {
    if (!portfolio) return;
    
    const updatedEducation = [...portfolio.education];
    updatedEducation.splice(index, 1);
    
    setPortfolio({
      ...portfolio,
      education: updatedEducation
    });
  };

  // Handle skills change
  const handleSkillsChange = (value: string) => {
    if (!portfolio) return;
    
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    setPortfolio({
      ...portfolio,
      skills: skillsArray
    });
  };

  // Save portfolio
  const handleSavePortfolio = async () => {
    if (!portfolio) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const request: SavePortfolioRequest = {
        userId,
        portfolioData: portfolio
      };
      
      const result = await savePortfolio(request);
      
      if (result.success) {
        // Portfolio saved successfully
      } else {
        setError(result.message || 'Failed to save portfolio');
      }
    } catch (err) {
      setError('Failed to save portfolio. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Generate AI-powered project description
  const handleGenerateDescription = async (index: number) => {
    if (!portfolio) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const project = portfolio.projects[index];
      const request: GenerateProjectDescriptionRequest = { project };
      
      const description = await generateProjectDescription(request);
      
      // Update the project with the generated description
      const updatedProjects = [...portfolio.projects];
      updatedProjects[index] = {
        ...updatedProjects[index],
        title: description.enhancedTitle,
        description: description.description
      };
      
      setPortfolio({
        ...portfolio,
        projects: updatedProjects
      });
    } catch (err) {
      setError('Failed to generate project description. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate portfolio suggestions
  const handleGenerateSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const request: PortfolioSuggestionsRequest = { userId };
      const result = await generatePortfolioSuggestions(request);
      setSuggestions(result);
      setActiveTab('suggestions');
    } catch (err) {
      setError('Failed to generate suggestions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate portfolio website
  const handleGenerateWebsite = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const request: GeneratePortfolioWebsiteRequest = { userId };
      const result = await generatePortfolioWebsite(request);
      setWebsiteHtml(result.html);
      
      // Create a new tab/window with the generated website
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(result.html);
        newWindow.document.close();
      }
    } catch (err) {
      setError('Failed to generate portfolio website. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Export portfolio
  const handleExportPortfolio = async () => {
    try {
      // In a real implementation, this would call the export API
      // For now, we'll just download the current portfolio data
      const dataStr = JSON.stringify(portfolio, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-${userId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export portfolio. Please try again.');
      console.error(err);
    }
  };

  if (loading && !portfolio) {
    return <LoadingSpinner />;
  }

  if (!portfolio) {
    return <ErrorMessage message="Failed to load portfolio data." />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Portfolio Builder</h1>
        <div className="flex gap-2">
          <button
            onClick={handleSavePortfolio}
            disabled={saving}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Portfolio'}
          </button>
          <button
            onClick={handleGenerateSuggestions}
            className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Get Suggestions
          </button>
          <button
            onClick={handleGenerateWebsite}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Generate Website
          </button>
          <button
            onClick={handleExportPortfolio}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Export
          </button>
        </div>
      </div>
      
      {error && <ErrorMessage message={error} />}
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'personal' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Info
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'projects' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('projects')}
        >
          Projects ({portfolio.projects.length})
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'experience' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('experience')}
        >
          Experience ({portfolio.experience.length})
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'education' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('education')}
        >
          Education ({portfolio.education.length})
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'skills' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('skills')}
        >
          Skills
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'suggestions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('suggestions')}
        >
          Suggestions
        </button>
      </div>
      
      {/* Personal Info Tab */}
      {activeTab === 'personal' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={portfolio.personalInfo.name}
                onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={portfolio.personalInfo.email}
                onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={portfolio.personalInfo.phone}
                onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn Profile
              </label>
              <input
                type="url"
                id="linkedin"
                value={portfolio.personalInfo.linkedin}
                onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            
            <div>
              <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
                GitHub Profile
              </label>
              <input
                type="url"
                id="github"
                value={portfolio.personalInfo.github}
                onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://github.com/username"
              />
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Personal Website
              </label>
              <input
                type="url"
                id="website"
                value={portfolio.personalInfo.website}
                onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Projects</h2>
            <button
              onClick={addProject}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Project
            </button>
          </div>
          
          {portfolio.projects.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No projects added yet. Click "Add Project" to get started.</p>
          ) : (
            <div className="space-y-6">
              {portfolio.projects.map((project, index) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Project #{index + 1}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGenerateDescription(index)}
                        className="text-sm bg-purple-600 text-white py-1 px-3 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      >
                        AI Enhance
                      </button>
                      <button
                        onClick={() => removeProject(index)}
                        className="text-sm bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Type
                      </label>
                      <input
                        type="text"
                        value={project.type}
                        onChange={(e) => handleProjectChange(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Web Application, Mobile App"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={project.startDate || ''}
                        onChange={(e) => handleProjectChange(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={project.endDate || ''}
                        onChange={(e) => handleProjectChange(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Description
                    </label>
                    <textarea
                      value={project.description}
                      onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your project, including key features, technologies used, and challenges overcome..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Technologies (comma separated)
                      </label>
                      <input
                        type="text"
                        value={project.technologies.join(', ')}
                        onChange={(e) => handleProjectChange(index, 'technologies', e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., React, Node.js, MongoDB"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Links
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={project.link || ''}
                          onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Live Demo"
                        />
                        <input
                          type="url"
                          value={project.github || ''}
                          onChange={(e) => handleProjectChange(index, 'github', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="GitHub"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Experience Tab */}
      {activeTab === 'experience' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Work Experience</h2>
            <button
              onClick={addExperience}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Experience
            </button>
          </div>
          
          {portfolio.experience.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No work experience added yet. Click "Add Experience" to get started.</p>
          ) : (
            <div className="space-y-6">
              {portfolio.experience.map((exp, index) => (
                <div key={exp.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Experience #{index + 1}</h3>
                    <button
                      onClick={() => removeExperience(index)}
                      className="text-sm bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your role and responsibilities..."
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Key Achievements (one per line)
                    </label>
                    <textarea
                      value={exp.achievements.join('\n')}
                      onChange={(e) => handleExperienceChange(index, 'achievements', e.target.value.split('\n').filter(a => a.trim()))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="List your key achievements and accomplishments..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Education Tab */}
      {activeTab === 'education' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Education</h2>
            <button
              onClick={addEducation}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Education
            </button>
          </div>
          
          {portfolio.education.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No education added yet. Click "Add Education" to get started.</p>
          ) : (
            <div className="space-y-6">
              {portfolio.education.map((edu, index) => (
                <div key={edu.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Education #{index + 1}</h3>
                    <button
                      onClick={() => removeEducation(index)}
                      className="text-sm bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Degree
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GPA
                      </label>
                      <input
                        type="text"
                        value={edu.gpa || ''}
                        onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Skills</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills (comma separated)
            </label>
            <textarea
              value={portfolio.skills.join(', ')}
              onChange={(e) => handleSkillsChange(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., JavaScript, React, Node.js, Python, SQL, Git, Docker"
            />
            <p className="text-sm text-gray-500 mt-1">List your technical skills, separated by commas.</p>
          </div>
          
          {portfolio.skills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Your Skills</h3>
              <div className="flex flex-wrap gap-2">
                {portfolio.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Portfolio Suggestions</h2>
          
          {loading && !suggestions && <LoadingSpinner />}
          
          {suggestions ? (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-blue-800">Overall Portfolio Strength</h3>
                  <span className="text-2xl font-bold text-blue-600">{suggestions.overallScore}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${suggestions.overallScore * 10}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Areas for Improvement</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {suggestions.improvements.map((improvement: string, index: number) => (
                    <li key={index} className="text-gray-700">{improvement}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Section-Specific Suggestions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Projects</h4>
                    <p className="text-yellow-700 text-sm">{suggestions.sectionSuggestions.projects}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Skills</h4>
                    <p className="text-green-700 text-sm">{suggestions.sectionSuggestions.skills}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">Experience</h4>
                    <p className="text-purple-700 text-sm">{suggestions.sectionSuggestions.experience}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Recommended Projects to Add</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.recommendedProjects.map((project: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-1">{project.title}</h4>
                      <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech: string, techIndex: number) => (
                          <span key={techIndex} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Get personalized suggestions to improve your portfolio.</p>
              <button
                onClick={handleGenerateSuggestions}
                className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Generate Suggestions
              </button>
            </div>
          )}
        </div>
      )}
      
      {saving && <LoadingSpinner />}
    </div>
  );
}