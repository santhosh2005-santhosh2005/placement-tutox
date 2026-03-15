'use client';

import { useState } from 'react';
import { connectStackOverflow, getStackOverflowReputation } from '@/services/api';

export default function StackOverflowReputationPage() {
  const [stackoverflowId, setStackoverflowId] = useState('');
  const [reputationData, setReputationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const handleConnectStackOverflow = async () => {
    try {
      setLoading(true);
      setError(null);
      // In a real implementation, this would use the Stack Overflow API
      // For now, we'll simulate the connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConnected(true);
    } catch (err) {
      setError('Failed to connect to Stack Overflow');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchReputation = async () => {
    try {
      setLoading(true);
      setError(null);
      const reputation = await getStackOverflowReputation(stackoverflowId);
      setReputationData(reputation);
    } catch (err) {
      setError('Failed to fetch Stack Overflow reputation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Stack Overflow Reputation Tracker</h1>
          <p className="text-slate-600">Connect your Stack Overflow account to track your technical reputation</p>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Connect Stack Overflow Account</h2>
          {!connected ? (
            <div>
              <div className="mb-4">
                <label htmlFor="stackoverflowId" className="block text-sm font-medium text-slate-700 mb-1">
                  Stack Overflow User ID
                </label>
                <input
                  type="text"
                  id="stackoverflowId"
                  value={stackoverflowId}
                  onChange={(e) => setStackoverflowId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your Stack Overflow user ID"
                />
              </div>
              <button
                onClick={handleConnectStackOverflow}
                disabled={loading || !stackoverflowId}
                className="btn-primary"
              >
                {loading ? 'Connecting...' : 'Connect Stack Overflow Account'}
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2 text-green-800">Successfully connected to Stack Overflow!</span>
              </div>
            </div>
          )}
        </div>

        {connected && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Fetch Your Reputation Data</h2>
            <button
              onClick={handleFetchReputation}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Fetching Reputation...' : 'Fetch My Stack Overflow Reputation'}
            </button>
          </div>
        )}

        {error && (
          <div className="card mb-8 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ml-2 text-red-800">{error}</span>
            </div>
          </div>
        )}

        {reputationData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card lg:col-span-1">
              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-orange-600">{reputationData.reputation}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Reputation Score</h3>
                <p className="text-slate-600 mt-2">Your overall reputation on Stack Overflow</p>
              </div>
              
              <div className="mt-8">
                <h4 className="font-bold text-slate-900 mb-4">Badges</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                      <span>Gold</span>
                    </div>
                    <span className="font-bold">{reputationData.badges.gold}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                      <span>Silver</span>
                    </div>
                    <span className="font-bold">{reputationData.badges.silver}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-amber-800 rounded-full mr-2"></div>
                      <span>Bronze</span>
                    </div>
                    <span className="font-bold">{reputationData.badges.bronze}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card lg:col-span-2">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Top Tags</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reputationData.topTags.map((tag: any, index: number) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{tag.name}</span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {tag.score} pts
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, tag.score / 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      {tag.answerCount} answers • {tag.questionCount} questions
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {reputationData.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 mr-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'answer' ? 'bg-green-100 text-green-800' : 
                        activity.type === 'question' ? 'bg-blue-100 text-blue-800' : 
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {activity.type === 'answer' ? 'A' : activity.type === 'question' ? 'Q' : 'B'}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <p className="text-slate-900">{activity.title}</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-slate-500">{activity.date}</span>
                        <span className="text-sm font-medium text-slate-900">+{activity.reputationChange}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}