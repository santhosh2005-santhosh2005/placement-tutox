'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  HomeIcon, 
  BarChartIcon, 
  GraduationCapIcon, 
  BriefcaseIcon, 
  CodeIcon, 
  UsersIcon, 
  PlugIcon,
  ChevronRightIcon,
  FileTextIcon,
  ScanIcon,
  TargetIcon,
  MapIcon,
  TrophyIcon,
  GitBranchIcon,
  LinkedinIcon,
  FileQuestionIcon,
  UserIcon,
  GitCommitIcon,
  MessageSquareIcon,
  GithubIcon,
  LayersIcon, // Using LayersIcon as a substitute for StackOverflowIcon
  XIcon
} from 'lucide-react';

export default function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    career: true,
    skill: true,
    interview: true,
    community: true,
    integrations: true
  });

  const navGroups = [
    {
      name: 'Dashboard',
      key: 'dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
      items: [
        { name: 'Home', path: '/', icon: <HomeIcon className="h-4 w-4" /> },
        { name: 'Progress', path: '/progress', icon: <BarChartIcon className="h-4 w-4" /> },
        { name: 'Learning Path', path: '/learning-path', icon: <GraduationCapIcon className="h-4 w-4" /> },
      ]
    },
    {
      name: 'Career Tools',
      key: 'career',
      icon: <BriefcaseIcon className="h-5 w-5" />,
      items: [
        { name: 'Resume', path: '/resume', icon: <FileTextIcon className="h-4 w-4" /> },
        { name: 'ATS Scanner', path: '/ats-scanner', icon: <ScanIcon className="h-4 w-4" /> },
        { name: 'Job Matching', path: '/job-matching', icon: <TargetIcon className="h-4 w-4" /> },
      ]
    },
    {
      name: 'Skill Development',
      key: 'skill',
      icon: <CodeIcon className="h-5 w-5" />,
      items: [
        { name: 'Skills', path: '/skills', icon: <CodeIcon className="h-4 w-4" /> },
        { name: 'Skill Gap Analyzer', path: '/skill-gap-analyzer', icon: <TargetIcon className="h-4 w-4" /> },
        { name: 'Roadmap', path: '/roadmap', icon: <MapIcon className="h-4 w-4" /> },
        { name: 'Coding Challenges', path: '/coding-challenges', icon: <GitBranchIcon className="h-4 w-4" /> },
      ]
    },
    {
      name: 'Interview Hub',
      key: 'interview',
      icon: <FileQuestionIcon className="h-5 w-5" />,
      items: [
        { name: 'Interview', path: '/interview', icon: <FileQuestionIcon className="h-4 w-4" /> },
        { name: 'Mock Interview', path: '/mock-interview', icon: <UserIcon className="h-4 w-4" /> },
        { name: 'Peer Comparison', path: '/peer-comparison', icon: <TrophyIcon className="h-4 w-4" /> },
      ]
    },
    {
      name: 'Community',
      key: 'community',
      icon: <UsersIcon className="h-5 w-5" />,
      items: [
        { name: 'Community', path: '/community', icon: <MessageSquareIcon className="h-4 w-4" /> },
        { name: 'GitHub Portfolio', path: '/github-portfolio', icon: <GithubIcon className="h-4 w-4" /> },
        { name: 'LinkedIn Profile', path: '/linkedin-profile', icon: <LinkedinIcon className="h-4 w-4" /> },
        { name: 'SO Reputation', path: '/stackoverflow-reputation', icon: <LayersIcon className="h-4 w-4" /> },
      ]
    },
    {
      name: 'Integrations',
      key: 'integrations',
      icon: <PlugIcon className="h-5 w-5" />,
      items: [
        { name: 'API Features', path: '/api-features', icon: <GitCommitIcon className="h-4 w-4" /> },
      ]
    }
  ];

  const toggleGroup = (groupKey: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          <div 
            className="relative flex flex-col w-80 max-w-sm h-full border-r rounded-tr-[var(--rounded)] rounded-br-[var(--rounded)]"
            style={{ 
              background: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
                <div className="bg-[#1A73E8] text-white p-2 rounded-lg">
                  <GraduationCapIcon className="h-6 w-6" />
                </div>
                <span className="text-xl font-medium" style={{ color: 'var(--text)' }}>UdaanIQ</span>
              </Link>
              <button 
                onClick={onClose}
                className="p-2 rounded-md hover:bg-[var(--hover)] transition-colors duration-200"
                style={{ color: 'var(--text-alt)' }}
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <nav className="space-y-1">
                {navGroups.map((group) => (
                  <div key={group.key} className="space-y-1">
                    <button
                      onClick={() => toggleGroup(group.key)}
                      className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200"
                      style={{ 
                        color: 'var(--text-alt)',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div className="flex items-center">
                        <span style={{ color: 'var(--text-alt)' }}>
                          {group.icon}
                        </span>
                        <span className="ml-3">{group.name}</span>
                      </div>
                      <ChevronRightIcon 
                        className={`h-4 w-4 transition-transform duration-200 ${
                          openGroups[group.key] ? 'rotate-90' : ''
                        }`} 
                        style={{ color: 'var(--text-alt)' }}
                      />
                    </button>
                    {openGroups[group.key] && (
                      <div className="ml-2 pl-4 border-l" style={{ borderColor: 'var(--border)' }}>
                        {group.items.map((item) => (
                          <Link
                            key={item.path}
                            href={item.path}
                            onClick={onClose}
                            className={`flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors duration-200 ${
                              pathname === item.path ? 'text-white' : ''
                            }`}
                            style={{ 
                              color: pathname === item.path ? 'white' : 'var(--text-alt)',
                              backgroundColor: pathname === item.path ? '#1A73E8' : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              if (pathname !== item.path) {
                                e.currentTarget.style.backgroundColor = 'var(--hover)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (pathname !== item.path) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <span className="mr-3">
                              {item.icon}
                            </span>
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}