'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  LayersIcon // Using LayersIcon as a substitute for StackOverflowIcon
} from 'lucide-react';
import MobileSidebar from '@/components/MobileSidebar';
import { useSidebar } from '@/components/Providers';
import SidebarCloseButton from '@/components/SidebarCloseButton';

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }: { 
  isSidebarOpen: boolean; 
  setIsSidebarOpen: (open: boolean) => void;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isSidebarOpen: isMainSidebarOpen } = useSidebar();
  const isAnimatingRef = useRef(false);
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

  const handleClose = useCallback((source = "close-button") => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    
    setIsSidebarOpen(false);
    
    try { 
      localStorage.setItem("udaaniQ_sidebar_open", JSON.stringify(false)); 
    } catch (e) {
      console.warn("Failed to persist sidebar state to localStorage", e);
    }
    
    // Restore scroll for mobile
    if (window.innerWidth < 900) {
      document.body.style.overflow = "";
    }
    
    // Return focus to logo toggle after animation
    setTimeout(() => {
      document.getElementById("udaaniQ-logo-toggle")?.focus();
      isAnimatingRef.current = false;
    }, 220);
    
    // Optional analytics event
    // emitAnalytics('ui.sidebar.toggled', { open: false, source });
  }, [setIsSidebarOpen]);

  // Handle click outside to close mobile sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar && !sidebar.contains(event.target as Node) && isMainSidebarOpen && window.innerWidth < 900) {
        handleClose("backdrop");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMainSidebarOpen, handleClose]);

  return (
    <>
      {/* Mobile sidebar */}
      <MobileSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      
      {/* Desktop sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            id="sidebar"
            className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-30"
            animate={{ width: isSidebarOpen ? (window.innerWidth < 900 ? '80vw' : 260) : 72 }}
            initial={{ width: 72 }}
            exit={{ width: 72 }}
            transition={{ 
              type: "spring", 
              stiffness: 160, 
              damping: 18,
              duration: 0.18,
              ease: [0.65, 0, 0.35, 1]
            }}
          >
            <div 
              className="flex flex-col flex-grow pt-5"
              style={{ 
                background: 'var(--surface)',
                borderRight: '1px solid var(--border)'
              }}
            >
              <div className="flex items-center justify-between flex-shrink-0 px-4">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="bg-[#1A73E8] text-white p-2 rounded-lg">
                    <GraduationCapIcon className="h-6 w-6" />
                  </div>
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span 
                        className="text-xl font-medium whitespace-nowrap"
                        style={{ color: 'var(--text)' }}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        UdaanIQ
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <SidebarCloseButton onClose={handleClose} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="mt-5 flex-1 flex flex-col">
                <nav className="flex-1 px-2 space-y-1">
                  {navGroups.map((group) => (
                    <div key={group.key} className="space-y-1">
                      <button
                        onClick={() => toggleGroup(group.key)}
                        className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
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
                          <AnimatePresence>
                            {isSidebarOpen && (
                              <motion.span 
                                className="ml-3 whitespace-nowrap"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                {group.name}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                        <AnimatePresence>
                          {isSidebarOpen && (
                            <motion.div
                              initial={{ rotate: 0 }}
                              animate={{ rotate: openGroups[group.key] ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRightIcon 
                                className="h-4 w-4"
                                style={{ color: 'var(--text-alt)' }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                      <AnimatePresence>
                        {isSidebarOpen && openGroups[group.key] && (
                          <motion.div
                            className="ml-2 pl-4 border-l"
                            style={{ borderColor: 'var(--border)' }}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {group.items.map((item) => (
                              <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors duration-200 ${
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Backdrop for mobile */}
      {isSidebarOpen && window.innerWidth < 900 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20"
          onClick={() => handleClose("backdrop")}
        />
      )}
    </>
  );
}