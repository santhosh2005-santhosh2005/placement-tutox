'use client';

import React, { useState, useEffect } from 'react';
import { getPersonalizedLearningPath, LearningPathItem } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

export default function LearningPath() {
  const [userId] = useState<string>('user123'); // In a real app, this would come from auth
  const [learningPath, setLearningPath] = useState<LearningPathItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [completedPaths, setCompletedPaths] = useState<Set<string>>(new Set());

  // Fetch personalized learning path on component mount
  useEffect(() => {
    const fetchLearningPath = async () => {
      try {
        setLoading(true);
        const path = await getPersonalizedLearningPath(userId);
        setLearningPath(path);
      } catch (err) {
        setError('Failed to load learning path. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningPath();
  }, [userId]);

  // Toggle path completion
  const togglePathCompletion = (pathId: string) => {
    setCompletedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pathId)) {
        newSet.delete(pathId);
      } else {
        newSet.add(pathId);
      }
      return newSet;
    });
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Personalized Learning Path</h1>
      <p className="text-gray-600 text-center mb-8">
        Follow this AI-generated path to advance your career systematically
      </p>
      
      {error && <ErrorMessage message={error} />}
      
      {loading && <LoadingSpinner />}
      
      {!loading && learningPath.length > 0 && (
        <div className="space-y-6">
          {learningPath.map((pathItem) => (
            <div 
              key={pathItem.id} 
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                completedPaths.has(pathItem.id) 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <button
                    onClick={() => togglePathCompletion(pathItem.id)}
                    className={`mr-4 mt-1 w-6 h-6 rounded-full flex items-center justify-center ${
                      completedPaths.has(pathItem.id)
                        ? 'bg-green-500 text-white'
                        : 'border-2 border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {completedPaths.has(pathItem.id) && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </button>
                  <div>
                    <div className="flex items-center mb-2">
                      <h2 className={`text-xl font-semibold ${completedPaths.has(pathItem.id) ? 'line-through text-gray-500' : ''}`}>
                        {pathItem.title}
                      </h2>
                      <span className={`ml-3 text-xs px-2 py-1 rounded-full ${getPriorityColor(pathItem.priority)}`}>
                        {pathItem.priority.charAt(0).toUpperCase() + pathItem.priority.slice(1)} Priority
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{pathItem.description}</p>
                    
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2">Skills to Master:</h3>
                      <div className="flex flex-wrap gap-2">
                        {pathItem.skills.map((skill, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>Estimated time: {pathItem.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-blue-50 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">Learning Tips</h2>
            <ul className="list-disc pl-5 space-y-2 text-blue-700">
              <li>Complete high-priority paths first to build a strong foundation</li>
              <li>Practice each skill with real projects to solidify your understanding</li>
              <li>Track your progress regularly to stay motivated</li>
              <li>Don't rush - quality learning takes time</li>
            </ul>
          </div>
        </div>
      )}
      
      {!loading && learningPath.length === 0 && !error && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Learning Path Available</h2>
          <p className="text-gray-600">Complete some activities to generate your personalized learning path.</p>
        </div>
      )}
    </div>
  );
}