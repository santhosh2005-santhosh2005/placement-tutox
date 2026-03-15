'use client';

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";

type Props = {
  onClose: (source?: string) => void;
  ariaControls?: string;
};

export default function SidebarCloseButton({ onClose, ariaControls = "sidebar" }: Props) {
  const isAnimatingRef = useRef(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Debounce to prevent multiple clicks during animation
    if (isAnimatingRef.current) return;
    
    isAnimatingRef.current = true;
    onClose("close-button");
    
    // Reset animation flag after a short delay
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 120);
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: 6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 6 }}
      transition={{ duration: 0.18 }}
      aria-controls={ariaControls}
      aria-label="Close sidebar"
      title="Close sidebar"
      className="sidebar-close-btn"
      onClick={handleClick}
      style={{
        width: 36,
        height: 36,
        borderRadius: "var(--rounded)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 8,
        color: "var(--text-secondary)",
      }}
      onMouseEnter={(e) => {
        const isDarkMode = document.documentElement.dataset.theme === "dark";
        if (isDarkMode) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
        } else {
          e.currentTarget.style.background = "rgba(26, 115, 232, 0.06)";
        }
        e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      <XIcon size={18} aria-hidden="true" />
    </motion.button>
  );
}