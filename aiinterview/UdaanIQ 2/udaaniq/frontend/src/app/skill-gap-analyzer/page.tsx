'use client';

import React, { useState, useEffect } from 'react';
import { analyzeSkillGaps, SkillGapAnalysisRequest, SkillGapAnalysisResponse, getUserProgress } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

export default function SkillGapAnalyzer() {
  const [userId] = useState<string>('user123'); // In a real app, this would come from auth
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [targetRole, setTargetRole] = useState<string>('Software Engineer');
  const [gapAnalysis, setGapAnalysis] = useState<SkillGapAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user skills on component mount
  useEffect(() => {
    const fetchUserSkills = async () => {
      try {
        const progress = await getUserProgress(userId);
        if (progress.skills) {
          const skills = Object.keys(progress.skills);
          setUserSkills(skills);
        }
      } catch (err) {
        console.error('Failed to fetch user skills:', err);
      }
    };

    fetchUserSkills();
  }, [userId]);

  const handleAnalyzeGaps = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userSkills.length === 0) {
      setError('Please add some skills to analyze.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const request: SkillGapAnalysisRequest = {
        userSkills,
        targetRole
      };
      
      const result = await analyzeSkillGaps(request);
      setGapAnalysis(result);
    } catch (err) {
      setError('Failed to analyze skill gaps. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setUserSkills(skillsArray);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Skill Gap Analyzer</h1>
      <p className="text-gray-600 text-center mb-8">
        Analyze the gap between your current skills and your target role requirements
      </p>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Analyze Your Skills</h2>
        <form onSubmit={handleAnalyzeGaps} className="space-y-4">
          <div>
            <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700 mb-1">
              Target Role
            </label>
            <select
              id="targetRole"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Mobile Developer">Mobile Developer</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
              Your Current Skills (comma separated)
            </label>
            <textarea
              id="skills"
              value={userSkills.join(', ')}
              onChange={handleSkillsChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., JavaScript, React, Node.js, Python, SQL"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Analyzing Skills...' : 'Analyze Skill Gaps'}
          </button>
        </form>
      </div>
      
      {error && <ErrorMessage message={error} />}
      
      {loading && <LoadingSpinner />}
      
      {gapAnalysis && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Skill Gap Analysis</h2>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-blue-800">Gap Analysis Score</h3>
              <span className="text-2xl font-bold text-blue-600">{gapAnalysis.gap_score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full" 
                style={{ width: `${gapAnalysis.gap_score}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {gapAnalysis.gap_score >= 80 
                ? 'Excellent! You have most of the skills needed for this role.' 
                : gapAnalysis.gap_score >= 60 
                  ? 'Good, but there are some skills you should focus on developing.' 
                  : 'You have significant gaps to fill for this role. Follow the learning path below.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Skills You Already Have</h3>
              <div className="flex flex-wrap gap-2">
                {gapAnalysis.existing_skills.map((skill, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Skills You Need to Develop</h3>
              <div className="flex flex-wrap gap-2">
                {gapAnalysis.missing_skills.map((skill, index) => (
                  <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Personalized Learning Path</h3>
            <div className="space-y-4">
              {gapAnalysis.learning_path.map((phase, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Phase {index + 1}: {phase.phase}</h4>
                    <span className="text-sm text-gray-500">{phase.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {phase.skills.map((skill, skillIndex) => (
                      <span key={skillIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Time to Job Ready</h3>
            <p className="text-yellow-700">{gapAnalysis.time_to_job_ready}</p>
          </div>
        </div>
      )}
      
      {!gapAnalysis && !loading && !error && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold mb-2">Ready to Analyze Your Skills?</h2>
          <p className="text-gray-600">
            Select your target role and enter your current skills to get a personalized gap analysis.
          </p>
        </div>
      )}
    </div>
  );
}