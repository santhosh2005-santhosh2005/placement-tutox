'use client';

import React, { useState } from 'react';
import AIHRInterviewSession from '../../components/AIHRInterview/AIHRInterviewSession';

export default function AIHRInterviewPage() {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [company, setCompany] = useState('Google');
  const [role, setRole] = useState('Software Engineer');
  const [mode, setMode] = useState<'Practice' | 'Live'>('Practice');
  const [strictness, setStrictness] = useState('medium');

  const handleStartInterview = () => {
    setInterviewStarted(true);
  };

  const handleInterviewEnd = (results: any) => {
    setInterviewStarted(false);
    console.log('Interview ended with results:', results);
    alert(`Interview completed! You answered ${results.questionCount} questions.`);
  };

  if (interviewStarted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">AI HR Interview</h1>
            <button
              onClick={() => setInterviewStarted(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Back to Setup
            </button>
          </div>
          <AIHRInterviewSession
            company={company}
            role={role}
            mode={mode}
            strictness={strictness}
            onInterviewEnd={handleInterviewEnd}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">AI HR Interview Setup</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter company name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter role"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'Practice' | 'Live')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Practice">Practice</option>
              <option value="Live">Live</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Strictness</label>
            <select
              value={strictness}
              onChange={(e) => setStrictness(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              id="consent"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="consent" className="ml-2 block text-sm text-gray-700">
              I consent to camera/mic access and data collection for this interview
            </label>
          </div>
          
          <button
            onClick={handleStartInterview}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start AI HR Interview
          </button>
        </div>
      </div>
    </div>
  );
}