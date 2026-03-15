'use client';

import { useDarkMode } from '@/hooks/useDarkMode';
import Sidebar from '@/components/Sidebar';
import TopAppBar from '@/components/TopAppBar';
import Chatbot from '@/components/Chatbot';
import Footer from '@/components/Footer';
import { useState, useEffect, createContext, useContext } from 'react';

// Create context for sidebar state
const SidebarContext = createContext({
  isSidebarOpen: true,
  toggleSidebar: () => {},
  setIsSidebarOpen: (open: boolean) => {}
});

export const useSidebar = () => useContext(SidebarContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const { darkMode, toggleDarkMode, mounted } = useDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('udaaniQ_sidebar_open');
    if (savedSidebarState !== null) {
      setIsSidebarOpen(savedSidebarState === 'true');
    } else {
      // Default to true on desktop and false on mobile
      setIsSidebarOpen(window.innerWidth >= 900);
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('udaaniQ_sidebar_open', isSidebarOpen.toString());
  }, [isSidebarOpen]);

  // Keep sidebar state in sync with window resize
  useEffect(() => {
    const onResize = () => {
      // Only update default state if no user preference is set
      if (localStorage.getItem('udaaniQ_sidebar_open') === null) {
        setIsSidebarOpen(window.innerWidth >= 900);
      }
    };
    
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Handle body overflow for mobile sidebar
  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 900) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Don't render anything on the server to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-1">
          <div className="hidden md:block w-64 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-16"></div>
            <main className="p-6">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, setIsSidebarOpen }}>
      <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
        <TopAppBar 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
        />
        <div className="flex flex-1">
          <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 overflow-y-auto p-6">
              <div className="max-w-7xl mx-auto w-full">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </div>
        <Chatbot />
      </div>
    </SidebarContext.Provider>
  );
}