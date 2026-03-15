'use client';

import { useState } from 'react';
import { connectLinkedIn, getLinkedInProfile } from '@/services/api';

export default function LinkedInProfilePage() {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const handleConnectLinkedIn = async () => {
    try {
      setLoading(true);
      setError(null);
      // In a real implementation, this would use the LinkedIn API
      // For now, we'll simulate the connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConnected(true);
    } catch (err) {
      setError('Failed to connect to LinkedIn');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await getLinkedInProfile(linkedinUrl);
      setProfile(profileData);
    } catch (err) {
      setError('Failed to fetch LinkedIn profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">LinkedIn Profile Integration</h1>
          <p className="text-slate-600">Connect your LinkedIn profile to enhance your career portfolio</p>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Connect LinkedIn Profile</h2>
          {!connected ? (
            <div>
              <div className="mb-4">
                <label htmlFor="linkedinUrl" className="block text-sm font-medium text-slate-700 mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="text"
                  id="linkedinUrl"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://www.linkedin.com/in/your-profile"
                />
              </div>
              <button
                onClick={handleConnectLinkedIn}
                disabled={loading || !linkedinUrl}
                className="btn-primary"
              >
                {loading ? 'Connecting...' : 'Connect LinkedIn Profile'}
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2 text-green-800">Successfully connected to LinkedIn!</span>
              </div>
            </div>
          )}
        </div>

        {connected && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Fetch Your LinkedIn Profile</h2>
            <button
              onClick={handleFetchProfile}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Fetching Profile...' : 'Fetch My LinkedIn Profile'}
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

        {profile && (
          <div className="card">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 mb-6 md:mb-0 md:mr-6">
                <img 
                  src={profile.profileImage} 
                  alt={profile.name} 
                  className="w-32 h-32 rounded-full mx-auto md:mx-0 object-cover"
                />
              </div>
              <div className="md:w-2/3">
                <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                <p className="text-blue-600 font-medium">{profile.headline}</p>
                <p className="mt-2 text-slate-600">{profile.summary}</p>
                
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Experience</h3>
                  <div className="space-y-4">
                    {profile.experiences.map((exp: any, index: number) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-4 py-1">
                        <h4 className="font-bold text-slate-900">{exp.title}</h4>
                        <p className="text-blue-600">{exp.company}</p>
                        <p className="text-sm text-slate-500">{exp.duration}</p>
                        <p className="mt-1 text-slate-600">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Education</h3>
                  <div className="space-y-4">
                    {profile.educations.map((edu: any, index: number) => (
                      <div key={index} className="border-l-2 border-green-500 pl-4 py-1">
                        <h4 className="font-bold text-slate-900">{edu.degree}</h4>
                        <p className="text-green-600">{edu.institution}</p>
                        <p className="text-sm text-slate-500">{edu.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button className="btn-primary">
                Add to My Portfolio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}