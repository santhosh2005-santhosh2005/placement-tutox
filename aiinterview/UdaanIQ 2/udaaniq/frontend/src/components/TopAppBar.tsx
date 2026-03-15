'use client';

import { useState, useRef, useEffect } from 'react';
import { useSidebar } from '@/components/Providers';
import { MoonIcon, SunIcon, SearchIcon, BellIcon, UserIcon, MenuIcon, MessageSquareIcon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SidebarToggleButton from '@/components/SidebarToggleButton';

export default function TopAppBar({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
    setSearchOpen(false);
  };

  // Keyboard shortcut for sidebar toggle (Ctrl+B) is now handled in SidebarToggleButton

  return (
    <div 
      className="sticky top-0 z-10 shadow-[var(--elevation-1)]"
      style={{ 
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile menu button and logo */}
        <div className="flex items-center">
          <button 
            className="md:hidden mr-3 p-1 rounded-md hover:bg-[var(--hover)] transition-colors duration-200"
            onClick={() => setMobileMenuOpen(true)}
            style={{ color: 'var(--text-alt)' }}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <SidebarToggleButton isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
          
          {/* AI Tutor Button - placed next to sidebar toggle */}
          <button
            onClick={() => window.open('http://localhost:5500', '_blank')}
            className="ml-2 flex items-center p-2 rounded-[var(--rounded)] hover:bg-[var(--hover)] transition-colors duration-200 border border-blue-500"
            style={{ color: 'var(--text)' }}
            title="Open AI Tutor"
          >
            <MessageSquareIcon className="h-5 w-5 text-blue-500" />
            <span className="ml-2 hidden md:inline text-sm font-medium">TUTIX</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="flex-1 mx-4 max-w-2xl" ref={searchRef}>
          {searchOpen ? (
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5" style={{ color: 'var(--text-alt)' }} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search features, tools, and resources"
                className="w-full pl-10 pr-4 py-2 rounded-[var(--rounded)] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                style={{ 
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)'
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-75 transition-opacity duration-200"
                style={{ color: 'var(--text-alt)' }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
          ) : (
            <div 
              className="flex items-center w-full px-4 py-2 rounded-[var(--rounded)] cursor-pointer transition-colors duration-200"
              style={{ 
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-alt)'
              }}
              onClick={() => setSearchOpen(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
              }}
            >
              <SearchIcon className="h-5 w-5 mr-3" style={{ color: 'var(--text-alt)' }} />
              <span>Search features, tools, and resources</span>
            </div>
          )}
        </div>

        {/* User actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-[var(--hover)] transition-colors duration-200"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            style={{ color: 'var(--text-alt)' }}
          >
            {darkMode ? (
              <motion.div
                initial={{ scale: 0.8, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20,
                  duration: 0.3 
                }}
              >
                <SunIcon className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, rotate: 45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20,
                  duration: 0.3 
                }}
              >
                <MoonIcon className="h-5 w-5" />
              </motion.div>
            )}
          </button>
          
          <button 
            className="p-2 rounded-full hover:bg-[var(--hover)] transition-colors duration-200 relative"
            style={{ color: 'var(--text-alt)' }}
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-[#EA4335] rounded-full"></span>
          </button>
          
          <button 
            className="p-2 rounded-full hover:bg-[var(--hover)] transition-colors duration-200"
            style={{ color: 'var(--text-alt)' }}
          >
            <UserIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}