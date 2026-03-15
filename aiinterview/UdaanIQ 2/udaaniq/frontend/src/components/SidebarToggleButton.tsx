'use client';

import React, { useEffect, useCallback } from "react";
import { useSidebar } from '@/components/Providers';
import { GraduationCapIcon } from 'lucide-react';

type Props = { 
  isSidebarOpen: boolean; 
  setIsSidebarOpen: (v: boolean) => void 
};

export default function SidebarToggleButton({ isSidebarOpen, setIsSidebarOpen }: Props) {
  const { toggleSidebar } = useSidebar();

  const toggle = useCallback(() => {
    // Debug log to verify clicks reach handler
    console.debug("Sidebar toggled via logo", { open: !isSidebarOpen });
    
    // Toggle sidebar state
    const next = !isSidebarOpen;
    setIsSidebarOpen(next);
    
    // Persist to localStorage
    try { 
      localStorage.setItem("udaaniQ_sidebar_open", JSON.stringify(next)); 
    } catch (e) {
      console.warn("Failed to persist sidebar state to localStorage", e);
    }
  }, [isSidebarOpen, setIsSidebarOpen]);

  // Keyboard shortcut: Ctrl/Cmd + B
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return (
    <button
      id="udaaniQ-logo-toggle"
      aria-controls="sidebar"
      aria-expanded={isSidebarOpen}
      aria-label="Toggle sidebar"
      onClick={(e) => { 
        e.stopPropagation(); 
        e.preventDefault(); 
        toggle(); 
      }}
      onKeyDown={(e) => { 
        if (e.key === "Enter" || e.key === " ") { 
          e.preventDefault(); 
          toggle(); 
        } 
      }}
      className="logo-toggle-btn flex items-center cursor-pointer"
      style={{ display: "flex", alignItems: "center", gap: 8 }}
    >
      <div className="bg-[#1A73E8] text-white p-1.5 rounded-lg">
        <GraduationCapIcon className="h-5 w-5" />
      </div>
      <span 
        className="logo-title text-lg font-medium hidden sm:block"
        style={{ color: 'var(--text)' }}
      >
        UdaanIQ
      </span>
    </button>
  );
}