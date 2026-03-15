'use client';

import { useState } from 'react';

export default function Feedback() {
  const [activeTab, setActiveTab] = useState('resume');

  // Mock feedback data
  const resumeFeedback = {
    score: 82,
    strengths: [
      "Strong in React fundamentals and project clarity",
      "Well-structured experience section",
      "Good use of action verbs"
    ],
    improvements: [
      "Add measurable results to project descriptions",
      "Include keyword: 'API integration'",
      "Reformat experience section for better ATS readability"
    ],
    motivation: "You're clearly on the right flight path — keep building upward!"
  };

  const skillFeedback = {
    score: 85,
    strengths: [
      "Strong understanding of core concepts",
      "Good problem-solving approach",
      "Clear explanation of principles"
    ],
    improvements: [
      "Practice more advanced features",
      "Work on practical applications",
      "Review fundamental concepts regularly"
    ],
    motivation: "You're making great progress! Keep learning and building projects."
  };

  const currentFeedback = activeTab === 'resume' ? resumeFeedback : skillFeedback;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Feedback</h1>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('resume')}
              className={`py-4 px-6 text-center flex-1 ${
                activeTab === 'resume'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Resume Feedback
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`py-4 px-6 text-center flex-1 ${
                activeTab === 'skills'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Skill Feedback
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          <div className="text-center py-6">
            <div className="inline-block bg-blue-100 rounded-full p-4 mb-4">
              <span className="text-4xl font-bold text-blue-600">{currentFeedback.score}%</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === 'resume' ? 'Resume Analysis' : 'Skill Assessment'}
            </h2>
            <p className="text-gray-600">Keep up the great work!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                What You're Doing Well ✅
              </h3>
              <ul className="space-y-2">
                {currentFeedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                Areas for Improvement 💡
              </h3>
              <ul className="space-y-2">
                {currentFeedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Motivational Message 🌟
            </h3>
            <p className="text-gray-700 text-lg italic">"{currentFeedback.motivation}"</p>
          </div>
          
          <div className="mt-8 text-center">
            <button className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
              View Detailed Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}