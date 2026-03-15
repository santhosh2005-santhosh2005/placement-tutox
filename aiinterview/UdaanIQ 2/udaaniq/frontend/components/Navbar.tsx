'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Resume', path: '/resume' },
    { name: 'ATS Scanner', path: '/ats-scanner' },
    { name: 'Skills', path: '/skills' },
    { name: 'Skill Gap Analyzer', path: '/skill-gap-analyzer' },
    { name: 'Roadmap', path: '/roadmap' },
    { name: 'Interview', path: '/interview' },
    { name: 'Mock Interview', path: '/mock-interview' },
    { name: 'Coding Challenges', path: '/coding-challenges' },
    { name: 'Progress', path: '/progress' },
    { name: 'Learning Path', path: '/learning-path' },
    { name: 'Peer Comparison', path: '/peer-comparison' },
    { name: 'Job Matching', path: '/job-matching' },
    { name: 'Community', path: '/community' },
    { name: 'GitHub Portfolio', path: '/github-portfolio' },
    { name: 'LinkedIn Profile', path: '/linkedin-profile' },
    { name: 'SO Reputation', path: '/stackoverflow-reputation' },
    { name: 'API Features', path: '/api-features' },
  ];

  const handleSwitchApp = () => {
    // Navigate to Tutix app - using the correct port
    window.open('http://localhost:5000', '_blank');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">UdaanIQ</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${
                    pathname === item.path
                      ? 'border-b-2 border-blue-500 text-slate-900'
                      : 'text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <button 
              onClick={handleSwitchApp}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
            >
              <span>Switch to Tutix</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}