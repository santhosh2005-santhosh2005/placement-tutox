'use client';

import { useState, useEffect } from 'react';
import { getPeerComparison } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

export default function PeerComparisonPage() {
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setLoading(true);
        // In a real app, you would pass the actual user ID
        const data = await getPeerComparison('user123');
        setComparisonData(data);
      } catch (err) {
        setError('Failed to load peer comparison data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Peer Comparison</h1>
          <p className="text-slate-600">See how you stack up against other users</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall Ranking */}
          <div className="card">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Ranking</h2>
            <div className="text-center py-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                #{comparisonData?.ranking?.position || 'N/A'}
              </div>
              <p className="text-slate-600">
                out of {comparisonData?.ranking?.totalUsers || '0'} users
              </p>
              <div className="mt-4">
                <div className="w-full bg-slate-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full" 
                    style={{ width: `${comparisonData?.ranking?.percentile || 0}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  You're in the top {100 - (comparisonData?.ranking?.percentile || 0)}% of users
                </p>
              </div>
            </div>
          </div>

          {/* Skill Comparison */}
          <div className="card">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Skill Comparison</h2>
            <div className="space-y-4">
              {comparisonData?.skills?.map((skill: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{skill.name}</span>
                    <span>{skill.userScore} vs {skill.peerAverage}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (skill.userScore / 10) * 100)}%` }}
                    ></div>
                    <div 
                      className="bg-green-500 h-2.5 rounded-full -mt-2.5 opacity-70" 
                      style={{ width: `${Math.min(100, (skill.peerAverage / 10) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Comparison */}
          <div className="card md:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Activity Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-lg border border-slate-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {comparisonData?.activities?.completedChallenges || 0}
                </div>
                <p className="text-slate-600">Challenges Completed</p>
                <p className="text-sm text-slate-500 mt-1">
                  Peer avg: {comparisonData?.activities?.peerAvgChallenges || 0}
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg border border-slate-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {comparisonData?.activities?.interviewsTaken || 0}
                </div>
                <p className="text-slate-600">Interviews Taken</p>
                <p className="text-sm text-slate-500 mt-1">
                  Peer avg: {comparisonData?.activities?.peerAvgInterviews || 0}
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg border border-slate-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {comparisonData?.activities?.daysActive || 0}
                </div>
                <p className="text-slate-600">Days Active</p>
                <p className="text-sm text-slate-500 mt-1">
                  Peer avg: {comparisonData?.activities?.peerAvgDays || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}