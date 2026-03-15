'use client';

import Link from 'next/link';

export default function APIFeaturesPage() {
  const features = [
    {
      id: 1,
      title: 'GitHub Portfolio Integration',
      description: 'Automatically populate your portfolio with real projects from your GitHub account.',
      icon: '🐙',
      path: '/github-portfolio',
      api: 'GitHub API',
      benefit: 'Showcase real code and contributions to potential employers'
    },
    {
      id: 2,
      title: 'LinkedIn Profile Enrichment',
      description: 'Enhance your profile with professional data from LinkedIn.',
      icon: '💼',
      path: '/linkedin-profile',
      api: 'LinkedIn API',
      benefit: 'Automatically sync your professional experience and skills'
    },
    {
      id: 3,
      title: 'Stack Overflow Reputation Tracker',
      description: 'Track your technical reputation and expertise on Stack Overflow.',
      icon: '📈',
      path: '/stackoverflow-reputation',
      api: 'Stack Overflow API',
      benefit: 'Demonstrate your technical knowledge and problem-solving skills'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">API-Powered Features</h1>
          <p className="text-slate-600">Enhance your career profile with integrations from popular platforms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.id} className="card hover:shadow-md transition-shadow duration-300">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h2>
              <p className="text-slate-600 mb-4">{feature.description}</p>
              
              <div className="mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {feature.api}
                </span>
              </div>
              
              <p className="text-sm text-slate-500 mb-4">
                <span className="font-medium">Benefit:</span> {feature.benefit}
              </p>
              
              <Link href={feature.path} className="btn-primary inline-block">
                Connect {feature.api.split(' ')[0]}
              </Link>
            </div>
          ))}
        </div>

        <div className="card mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Connect Your Account</h3>
              <p className="text-slate-600">
                Simply provide your username or profile URL to connect to the platform.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Fetch Your Data</h3>
              <p className="text-slate-600">
                We securely retrieve your information using the platform's API.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enhance Your Profile</h3>
              <p className="text-slate-600">
                Your career profile is automatically updated with real data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}