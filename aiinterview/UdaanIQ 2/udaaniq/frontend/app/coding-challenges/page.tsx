'use client';

import React, { useState, useEffect } from 'react';
import { 
  generateCodingChallenge, 
  evaluateCodingSolution,
  generateCodingPath,
  GenerateCodingChallengeRequest,
  CodingChallenge,
  EvaluateCodingSolutionRequest,
  GenerateCodingPathRequest,
  GenerateCodingPathResponse
} from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

export default function CodingChallenges() {
  // States for challenge generation
  const [skill, setSkill] = useState<string>('JavaScript');
  const [difficulty, setDifficulty] = useState<string>('Medium');
  
  // States for coding path
  const [codingPath, setCodingPath] = useState<GenerateCodingPathResponse | null>(null);
  const [pathLoading, setPathLoading] = useState<boolean>(false);
  const [pathError, setPathError] = useState<string | null>(null);
  
  // States for challenge
  const [challenge, setChallenge] = useState<CodingChallenge | null>(null);
  const [userSolution, setUserSolution] = useState<string>('');
  const [evaluation, setEvaluation] = useState<any>(null);
  
  // States for UI
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [challengeStarted, setChallengeStarted] = useState<boolean>(false);
  const [challengeCompleted, setChallengeCompleted] = useState<boolean>(false);

  // Generate coding path
  const handleGeneratePath = async () => {
    setPathLoading(true);
    setPathError(null);
    
    try {
      const request: GenerateCodingPathRequest = {
        skill,
        count: 5
      };
      
      const path = await generateCodingPath(request);
      setCodingPath(path);
    } catch (err) {
      setPathError('Failed to generate coding path. Please try again.');
      console.error(err);
    } finally {
      setPathLoading(false);
    }
  };

  // Generate coding challenge
  const handleGenerateChallenge = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const request: GenerateCodingChallengeRequest = {
        skill,
        difficulty
      };
      
      const newChallenge = await generateCodingChallenge(request);
      setChallenge(newChallenge);
      setChallengeStarted(true);
      setChallengeCompleted(false);
      setUserSolution('');
      setEvaluation(null);
    } catch (err) {
      setError('Failed to generate coding challenge. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Evaluate coding solution
  const handleEvaluateSolution = async () => {
    if (!userSolution.trim()) {
      setError('Please provide your solution before submitting.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const request: EvaluateCodingSolutionRequest = {
        challenge: challenge!,
        userSolution,
        testCases: challenge!.examples
      };
      
      const result = await evaluateCodingSolution(request);
      setEvaluation(result);
      setChallengeCompleted(true);
    } catch (err) {
      setError('Failed to evaluate solution. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset the challenge
  const handleReset = () => {
    setChallengeStarted(false);
    setChallengeCompleted(false);
    setChallenge(null);
    setUserSolution('');
    setEvaluation(null);
    setError(null);
  };

  // Initialize coding path on component mount
  useEffect(() => {
    handleGeneratePath();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Coding Challenges</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Coding Path Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Learning Path</h2>
          
          {pathLoading && <LoadingSpinner />}
          
          {pathError && <ErrorMessage message={pathError} />}
          
          {codingPath && codingPath.path.length > 0 && (
            <div className="space-y-4">
              {codingPath.path.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-lg border ${
                    index === 0 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.concepts.join(', ')}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.difficulty === 'Easy' 
                        ? 'bg-green-100 text-green-800' 
                        : item.difficulty === 'Medium' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {item.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{item.timeEstimate}</p>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6">
            <label htmlFor="skill" className="block text-sm font-medium text-gray-700 mb-1">
              Skill
            </label>
            <select
              id="skill"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
            </select>
            
            <button
              onClick={handleGeneratePath}
              disabled={pathLoading}
              className="w-full mt-3 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {pathLoading ? 'Updating Path...' : 'Update Path'}
            </button>
          </div>
        </div>
        
        {/* Main Challenge Area */}
        <div className="lg:col-span-2">
          {!challengeStarted && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Generate a Coding Challenge</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="challengeSkill" className="block text-sm font-medium text-gray-700 mb-1">
                    Skill
                  </label>
                  <select
                    id="challengeSkill"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="React">React</option>
                    <option value="Node.js">Node.js</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                
                <button
                  onClick={handleGenerateChallenge}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Generating Challenge...' : 'Generate Challenge'}
                </button>
              </div>
            </div>
          )}
          
          {error && <ErrorMessage message={error} />}
          
          {loading && <LoadingSpinner />}
          
          {challengeStarted && challenge && !challengeCompleted && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{challenge.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  challenge.difficulty === 'Easy' 
                    ? 'bg-green-100 text-green-800' 
                    : challenge.difficulty === 'Medium' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{challenge.description}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Input Format</h3>
                <p className="text-gray-700">{challenge.inputFormat}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Output Format</h3>
                <p className="text-gray-700">{challenge.outputFormat}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Examples</h3>
                {challenge.examples.map((example, index) => (
                  <div key={index} className="mb-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Input</h4>
                        <pre className="bg-gray-100 p-3 rounded text-sm">{example.input}</pre>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Output</h4>
                        <pre className="bg-gray-100 p-3 rounded text-sm">{example.output}</pre>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="font-medium text-gray-700 mb-1">Explanation</h4>
                      <p className="text-gray-700">{example.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Constraints</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {challenge.constraints.map((constraint, index) => (
                    <li key={index} className="text-gray-700">{constraint}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Hints</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {challenge.hints.map((hint, index) => (
                    <li key={index} className="text-gray-700">{hint}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-6">
                <label htmlFor="solution" className="block text-lg font-semibold mb-2">
                  Your Solution
                </label>
                <textarea
                  id="solution"
                  value={userSolution}
                  onChange={(e) => setUserSolution(e.target.value)}
                  placeholder="Write your solution here..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleEvaluateSolution}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Evaluating...' : 'Submit Solution'}
                </button>
                
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  New Challenge
                </button>
              </div>
            </div>
          )}
          
          {challengeCompleted && evaluation && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4 text-center">Evaluation Results</h2>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-2">Score: {evaluation.score}/10</h3>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full" 
                    style={{ width: `${evaluation.score * 10}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                  <h3 className="text-lg font-semibold mb-2 text-green-800">What You Did Well</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {evaluation.strengths.map((strength: string, index: number) => (
                      <li key={index} className="text-green-700">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                  <h3 className="text-lg font-semibold mb-2 text-yellow-800">Areas for Improvement</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {evaluation.improvements.map((improvement: string, index: number) => (
                      <li key={index} className="text-yellow-700">{improvement}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mb-6 p-4 rounded-lg border border-blue-200 bg-blue-50">
                <h3 className="text-lg font-semibold mb-2 text-blue-800">Complexity Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Time Complexity: <span className="font-normal">{evaluation.timeComplexity}</span></p>
                  </div>
                  <div>
                    <p className="font-medium">Space Complexity: <span className="font-normal">{evaluation.spaceComplexity}</span></p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-medium">Code Quality: <span className="font-normal">{evaluation.codeQuality}</span></p>
                </div>
              </div>
              
              <div className="mb-6 p-4 rounded-lg border border-purple-200 bg-purple-50">
                <h3 className="text-lg font-semibold mb-2 text-purple-800">Better Solution</h3>
                <p className="text-purple-700">{evaluation.betterSolution}</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Try Another Challenge
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}