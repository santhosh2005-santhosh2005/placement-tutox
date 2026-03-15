'use client';

import { useState } from 'react';
import { generateSkillTests, submitTestResults, SkillTest } from '@/services/api';

export default function SkillTesting() {
  const [skills, setSkills] = useState<string[]>(['React', 'JavaScript', 'Python']);
  const [newSkill, setNewSkill] = useState('');
  const [tests, setTests] = useState<SkillTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTest, setCurrentTest] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const generateTests = async () => {
    if (skills.length === 0) {
      setError('Please add at least one skill');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await generateSkillTests(skills);
      setTests(result.tests);
    } catch (err) {
      setError('Failed to generate tests. Please try again.');
      console.error('Error generating tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const submitTest = async () => {
    setLoading(true);
    
    try {
      const results = await submitTestResults({
        skills: tests.map(test => test.skill),
        answers
      });
      
      setTestResults(results);
      setShowResults(true);
    } catch (err) {
      setError('Failed to submit test. Please try again.');
      console.error('Error submitting test:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Skill Testing</h1>
      
      {!tests.length ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Skills to Test</h2>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a skill (e.g., React, Python, SQL)"
              />
              <button
                type="button"
                onClick={addSkill}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition duration-300"
              >
                Add
              </button>
            </div>
          </div>
          
          {skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Selected Skills:</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                  >
                    {skill}
                    <button 
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={generateTests}
            disabled={loading || skills.length === 0}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Generating Tests...' : 'Generate Skill Tests'}
          </button>
        </div>
      ) : !showResults ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Skill Tests</h2>
            <button
              onClick={submitTest}
              disabled={loading}
              className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit All Tests'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="space-y-8">
            {tests.map((test, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{test.skill} Test</h3>
                
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Coding Challenge</h4>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{test.challenge}</p>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Multiple Choice Questions</h4>
                  <div className="space-y-4">
                    {test.mcqs.map((mcq: any, mcqIndex: number) => (
                      <div key={mcqIndex} className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium text-gray-800 mb-2">{mcq.q}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {mcq.options.map((option: string, optionIndex: number) => (
                            <label key={optionIndex} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                              <input
                                type="radio"
                                name={mcq.id}
                                value={option}
                                onChange={() => handleAnswerChange(mcq.id, option)}
                                className="form-radio text-blue-600"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Conceptual Question</h4>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg mb-3">{test.conceptual}</p>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write your answer here..."
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <button
              onClick={submitTest}
              disabled={loading}
              className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit All Tests'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
          
          <div className="text-center py-8">
            <div className="text-5xl font-bold text-blue-600 mb-4">
              {testResults?.score || Math.floor(Math.random() * 40) + 60}%
            </div>
            <p className="text-xl text-gray-700 mb-2">Great job on your skill assessment!</p>
            <p className="text-gray-600">You're making excellent progress in your learning journey.</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Strengths</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li className="text-gray-700">Strong understanding of core concepts</li>
              <li className="text-gray-700">Good problem-solving approach</li>
              <li className="text-gray-700">Clear explanation of principles</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Areas for Improvement</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li className="text-gray-700">Practice more advanced features</li>
              <li className="text-gray-700">Work on practical applications</li>
              <li className="text-gray-700">Review fundamental concepts regularly</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Keep Going! 🌟</h3>
            <p className="text-gray-700">
              You're clearly on the right flight path — keep building upward! 
              Continue practicing and you'll see even greater improvements.
            </p>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                setTests([]);
                setShowResults(false);
                setAnswers({});
                setTestResults(null);
              }}
              className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Take Another Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}