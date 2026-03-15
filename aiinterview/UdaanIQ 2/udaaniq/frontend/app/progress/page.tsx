'use client';

import React, { useState, useEffect } from 'react';
import { 
  getUserProgress, 
  getSkillRecommendations,
  getUserAchievements,
  UserProgress,
  SkillRecommendation,
  Achievement
} from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

export default function ProgressDashboard() {
  const [userId] = useState<string>('user123'); // In a real app, this would come from auth
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]); // New state for achievements
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user progress and recommendations on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const progress = await getUserProgress(userId);
        const recs = await getSkillRecommendations(userId);
        const userAchievements = await getUserAchievements(userId); // Fetch achievements
        
        setUserProgress(progress);
        setRecommendations(recs);
        setAchievements(userAchievements); // Set achievements
      } catch (err) {
        setError('Failed to load progress data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get skill level based on average score
  const getSkillLevel = (score: number) => {
    if (score >= 8) return 'Advanced';
    if (score >= 6) return 'Intermediate';
    if (score >= 4) return 'Beginner';
    return 'Novice';
  };

  // Get skill level color
  const getSkillLevelColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-blue-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Progress Dashboard</h1>
      
      {error && <ErrorMessage message={error} />}
      
      {loading && <LoadingSpinner />}
      
      {userProgress && !loading && (
        <div className="space-y-8">
          {/* Overall Progress Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Overall Progress</h2>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-4xl font-bold text-blue-600">{userProgress.overallProgress}%</p>
                <p className="text-gray-600">Completion</p>
              </div>
              <div className="w-32 h-32 relative">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200 stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <circle
                    className="text-blue-600  stroke-current"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * userProgress.overallProgress) / 100}
                    transform="rotate(-90 50 50)"
                  ></circle>
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-2xl font-bold">{userProgress.overallProgress}%</p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <a 
                href="/learning-path" 
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Your Personalized Learning Path
              </a>
              <p className="text-gray-600 text-sm mt-2">
                AI-generated roadmap to advance your career
              </p>
            </div>
            <p className="text-gray-600 mt-4">
              Last updated: {formatDate(userProgress.lastUpdated)}
            </p>
          </div>
          
          {/* Achievements Section */}
          {achievements.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Your Achievements</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="border rounded-lg p-4 text-center bg-gradient-to-br from-yellow-50 to-amber-50">
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Skills Progress Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Skills Progress</h2>
            
            {Object.keys(userProgress.skills).length === 0 ? (
              <p className="text-gray-600 text-center py-4">No skills tracked yet. Complete some activities to see your progress.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(userProgress.skills).map(([skillName, skillData]) => (
                  <div key={skillName} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">{skillName}</h3>
                      <span className={`px-2 py-1 rounded text-xs text-white ${getSkillLevelColor(skillData.averageScore)}`}>
                        {getSkillLevel(skillData.averageScore)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Score</span>
                        <span>{skillData.averageScore.toFixed(1)}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${skillData.averageScore * 10}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{skillData.activityCount} activities completed</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Recent Activities Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Recent Activities</h2>
            
            {userProgress.activities.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No activities recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {userProgress.activities.slice(-5).reverse().map((activity: any, index: number) => (
                  <div key={index} className="flex items-center p-3 border rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-800 font-medium">
                        {activity.type === 'interview' ? 'I' : 
                         activity.type === 'coding' ? 'C' : 
                         activity.type === 'resume' ? 'R' : 'A'}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium">
                          {activity.type === 'interview' ? 'Mock Interview' : 
                           activity.type === 'coding' ? 'Coding Challenge' : 
                           activity.type === 'resume' ? 'Resume Analysis' : 
                           'Activity'}
                        </h3>
                        <span className="text-sm text-gray-500">{formatDate(activity.timestamp)}</span>
                      </div>
                      {activity.skill && (
                        <p className="text-sm text-gray-600">Skill: {activity.skill}</p>
                      )}
                      {activity.score && (
                        <p className="text-sm">Score: <span className="font-medium">{activity.score}/10</span></p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Recommendations Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>
            
            {recommendations.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No recommendations available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">{recommendation.skill}</h3>
                    <p className="text-gray-700 mb-3">{recommendation.reason}</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Start Learning
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}