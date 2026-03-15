'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AIAvatarProps {
  question: string;
  onSpeechEnd: () => void;
  isSpeaking: boolean;
}

const AIAvatar: React.FC<AIAvatarProps> = ({ question, onSpeechEnd, isSpeaking }) => {
  const [avatarState, setAvatarState] = useState<'idle' | 'speaking' | 'thinking'>('idle');
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>(0);

  // Handle avatar speaking animation
  useEffect(() => {
    if (isSpeaking) {
      setAvatarState('speaking');
    } else {
      setAvatarState('idle');
    }
  }, [isSpeaking]);

  // Handle audio playback when question changes
  useEffect(() => {
    if (question && isSpeaking) {
      // In a real implementation, we would play the TTS audio here
      // For now, we'll simulate the speech duration
      const speechDuration = Math.max(2000, question.length * 50); // Minimum 2 seconds
      
      const timer = setTimeout(() => {
        setAvatarState('idle');
        onSpeechEnd();
      }, speechDuration);
      
      return () => clearTimeout(timer);
    }
  }, [question, isSpeaking, onSpeechEnd]);

  // Simple animation effect
  useEffect(() => {
    if (avatarState === 'speaking') {
      const animate = () => {
        // This would be replaced with actual avatar animation
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [avatarState]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 rounded-lg p-4">
      <div className="relative w-64 h-64 mb-4">
        {/* Simple avatar representation */}
        <div className="w-full h-full bg-blue-200 rounded-full flex items-center justify-center">
          <div className="w-48 h-48 bg-blue-300 rounded-full flex items-center justify-center">
            {/* Eyes */}
            <div className="flex space-x-8 mb-8">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full"></div>
              </div>
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full"></div>
              </div>
            </div>
            
            {/* Mouth - changes based on speaking state */}
            <div className="absolute bottom-12 w-24 h-4 bg-white rounded-full">
              {avatarState === 'speaking' && (
                <div className="w-full h-full bg-red-400 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        </div>
        
        {/* Speaking indicator */}
        {avatarState === 'speaking' && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>
      
      {/* Question text */}
      <div className="w-full bg-white rounded-lg p-4 shadow-md">
        <p className="text-lg font-medium text-gray-800">{question}</p>
      </div>
      
      {/* Hidden audio element for TTS integration */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default AIAvatar;