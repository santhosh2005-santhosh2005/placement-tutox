'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AIAvatar3DProps {
  question: string;
  audioUrl?: string;
  onSpeechEnd: () => void;
  isSpeaking: boolean;
}

const AIAvatar3DSpeaking: React.FC<AIAvatar3DProps> = ({ 
  question, 
  audioUrl, 
  onSpeechEnd, 
  isSpeaking 
}) => {
  const [avatarState, setAvatarState] = useState<'idle' | 'speaking' | 'thinking'>('idle');
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle avatar speaking animation
  useEffect(() => {
    if (isSpeaking) {
      setAvatarState('speaking');
    } else {
      setAvatarState('idle');
    }
  }, [isSpeaking]);

  // Handle audio playback
  useEffect(() => {
    if (audioUrl && isSpeaking) {
      playAudio();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl, isSpeaking]);

  const playAudio = async () => {
    if (!audioUrl) return;
    
    try {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Set up event listeners
      audio.onended = () => {
        setIsPlaying(false);
        setAvatarState('idle');
        onSpeechEnd();
      };
      
      audio.onplay = () => {
        setIsPlaying(true);
      };
      
      // Play the audio
      await audio.play();
    } catch (err) {
      console.error('Error playing audio:', err);
      // Fallback to simulated speech
      simulateSpeech();
    }
  };

  const simulateSpeech = () => {
    // Simulate speech duration based on question length
    const speechDuration = Math.max(2000, question.length * 50); // Minimum 2 seconds
    
    const timer = setTimeout(() => {
      setAvatarState('idle');
      setIsPlaying(false);
      onSpeechEnd();
    }, speechDuration);
    
    return () => clearTimeout(timer);
  };

  // Simple animation effect
  useEffect(() => {
    if (avatarState === 'speaking' || isPlaying) {
      const animate = () => {
        // This would be replaced with actual 3D avatar animation
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
  }, [avatarState, isPlaying]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 rounded-lg p-4">
      <div className="relative w-64 h-64 mb-4">
        {/* 3D Avatar representation - in a real implementation, this would be a 3D model */}
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-48 h-48 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full flex items-center justify-center relative overflow-hidden">
            {/* Eyes */}
            <div className="flex space-x-8 mb-8 z-10">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full"></div>
              </div>
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full"></div>
              </div>
            </div>
            
            {/* Mouth - changes based on speaking state */}
            <div className="absolute bottom-12 w-24 h-4 bg-white rounded-full z-10">
              {(avatarState === 'speaking' || isPlaying) && (
                <div className="w-full h-full bg-red-400 rounded-full animate-pulse"></div>
              )}
            </div>
            
            {/* 3D effect elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-10 rounded-full"></div>
            <div className="absolute top-4 left-4 w-8 h-8 bg-white opacity-20 rounded-full"></div>
          </div>
        </div>
        
        {/* Speaking indicator */}
        {(avatarState === 'speaking' || isPlaying) && (
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

export default AIAvatar3DSpeaking;