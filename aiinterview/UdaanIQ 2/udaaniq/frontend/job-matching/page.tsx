'use client';

import { useState, useEffect } from 'react';
import { getJobMatches } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

export default function JobMatchingPage() {
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    location: 'Remote',
    experience: 'Entry Level',
    jobType: 'Full-time'
  });

  useEffect(() => {
    const fetchJobMatches = async () => {
      try {
        setLoading(true);
        // In a real app, you would pass the actual user ID and preferences
        const data = await getJobMatches('user123', preferences);
        setJobMatches(data);
      } catch (err) {
        setError('Failed to load job matches');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobMatches();
  }, [preferences]);

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Job Matching</h1>
          <p className="text-slate-600">Discover jobs that match your skills and preferences</p>
        </div>

        {/* Preferences Filter */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Filter Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <select
                name="location"
                value={preferences.location}
                onChange={handlePreferenceChange}
                className="w-full rounded-md border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
              <select
                name="experience"
                value={preferences.experience}
                onChange={handlePreferenceChange}
                className="w-full rounded-md border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
              <select
                name="jobType"
                value={preferences.jobType}
                onChange={handlePreferenceChange}
                className="w-full rounded-md border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Matches */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Recommended Jobs</h2>
          <div className="grid grid-cols-1 gap-6">
            {jobMatches.map((job, index) => (
              <div key={index} className="card hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                    <p className="text-blue-600 font-medium">{job.company}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {job.location}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {job.experience}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">{job.matchScore}%</div>
                    <div className="text-sm text-slate-500">Match</div>
                  </div>
                </div>
                
                <p className="mt-4 text-slate-600">{job.description}</p>
                
                <div className="mt-4">
                  <h4 className="font-medium text-slate-900 mb-2">Required Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: string, skillIndex: number) => (
                      <span 
                        key={skillIndex} 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.userSkills.includes(skill) 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-slate-500">
                    Posted {job.postedDays} days ago
                  </div>
                  <button className="btn-primary">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}