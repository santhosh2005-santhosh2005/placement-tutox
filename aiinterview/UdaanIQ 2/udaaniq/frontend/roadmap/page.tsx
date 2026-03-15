'use client';

import { useState, useEffect } from 'react';
import { getRoadmap, Roadmap } from '@/services/api';

export default function CareerRoadmap() {
  const [selectedYear, setSelectedYear] = useState('2nd-Year-CSE');
  const [completedTasks, setCompletedTasks] = useState<{[key: string]: boolean}>({});
  const [roadmapData, setRoadmapData] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock roadmap data as fallback
  const mockRoadmaps: any = {
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

  useEffect(() => {
    fetchRoadmap();
  }, [selectedYear]);

  const fetchRoadmap = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getRoadmap(selectedYear);
      setRoadmapData(data);
    } catch (err) {
      // Fallback to mock data if API fails
      console.error('Failed to fetch roadmap, using mock data:', err);
      setRoadmapData(mockRoadmaps[selectedYear]);
      setError('Using demo data. Connect to backend for real data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (task: string) => {
    setCompletedTasks({
      ...completedTasks,
      [task]: !completedTasks[task]
    });
  };

  const currentRoadmap = roadmapData || mockRoadmaps[selectedYear];
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const totalCount = currentRoadmap.to_do.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Career Roadmap</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Your Year & Branch</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.keys(mockRoadmaps).map((yearKey) => (
            <button
              key={yearKey}
              onClick={() => setSelectedYear(yearKey)}
              className={`py-3 px-4 rounded-lg transition duration-300 ${
                selectedYear === yearKey
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mockRoadmaps[yearKey].year}
            </button>
          ))}
        </div>
      </div>
      
      {error && (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentRoadmap.year} Roadmap</h2>
            <p className="text-gray-600">Focus Areas: {currentRoadmap.focus.join(', ')}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="text-right text-sm text-gray-600 mb-1">
              {completedCount} of {totalCount} tasks completed
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {currentRoadmap.to_do.map((task: string, index: number) => (
            <div 
              key={index} 
              className={`flex items-start p-4 rounded-lg border ${
                completedTasks[task] 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <button
                onClick={() => toggleTask(task)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 mt-1 ${
                  completedTasks[task]
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'
                }`}
              >
                {completedTasks[task] && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </button>
              <span className={`${completedTasks[task] ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                {task}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Pro Tips for This Year</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Set aside dedicated time each week for skill development</li>
            <li>Join online communities related to your field of interest</li>
            <li>Build projects that showcase your learning</li>
            <li>Seek feedback from mentors and peers regularly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}