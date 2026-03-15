'use client';

import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedDarkMode = localStorage.getItem('darkMode');
    
    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    } else {
      setDarkMode(prefersDark);
    }
  }, []);
  
  useEffect(() => {
    if (!mounted) return;
    
    // Apply dark mode theme to document
    if (darkMode) {
      document.documentElement.dataset.theme = 'dark';
    } else {
      document.documentElement.dataset.theme = 'light';
    }
    
    // Store preference in localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode, mounted]);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  return { darkMode, toggleDarkMode, mounted };
}