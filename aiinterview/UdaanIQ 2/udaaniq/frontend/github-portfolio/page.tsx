'use client';

import { useState } from 'react';
import { connectGitHub, getGitHubRepositories } from '@/services/api';

export default function GitHubPortfolioPage() {
  const [githubUsername, setGithubUsername] = useState('');
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const handleConnectGitHub = async () => {
    try {
      setLoading(true);
      setError(null);
      // In a real implementation, this would use the GitHub API
      // For now, we'll simulate the connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConnected(true);
    } catch (err) {
      setError('Failed to connect to GitHub');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      const repos = await getGitHubRepositories(githubUsername);
      setRepositories(repos);
    } catch (err) {
      setError('Failed to fetch repositories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">GitHub Portfolio Integration</h1>
          <p className="text-slate-600">Connect your GitHub account to showcase your projects</p>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Connect GitHub Account</h2>
          {!connected ? (
            <div>
              <div className="mb-4">
                <label htmlFor="githubUsername" className="block text-sm font-medium text-slate-700 mb-1">
                  GitHub Username
                </label>
                <input
                  type="text"
                  id="githubUsername"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your GitHub username"
                />
              </div>
              <button
                onClick={handleConnectGitHub}
                disabled={loading || !githubUsername}
                className="btn-primary"
              >
                {loading ? 'Connecting...' : 'Connect GitHub Account'}
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2 text-green-800">Successfully connected to GitHub!</span>
              </div>
            </div>
          )}
        </div>

        {connected && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Fetch Your Repositories</h2>
            <button
              onClick={handleFetchRepositories}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Fetching Repositories...' : 'Fetch My GitHub Repositories'}
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

        {repositories.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Your GitHub Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {repositories.map((repo) => (
                <div key={repo.id} className="card">
                  <div className="flex justify-between">
                    <h3 className="text-xl font-bold text-slate-900">{repo.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      repo.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {repo.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-600">{repo.description || 'No description provided.'}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {repo.languages.slice(0, 5).map((lang: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {lang}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center text-sm text-slate-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {repo.stars} stars
                    <svg className="w-4 h-4 ml-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    {repo.forks} forks
                  </div>
                  <div className="mt-4">
                    <button className="btn-secondary">
                      Add to Portfolio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}