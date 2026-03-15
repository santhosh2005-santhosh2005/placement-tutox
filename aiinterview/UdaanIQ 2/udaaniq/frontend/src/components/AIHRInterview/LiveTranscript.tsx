'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LiveTranscriptProps {
  onTranscriptUpdate: (update: { interim: string; final: string }) => void;
  onStart?: () => void;
  onStop?: () => void;
  isEnabled: boolean;
}

const LiveTranscript: React.FC<LiveTranscriptProps> = ({ 
  onTranscriptUpdate, 
  onStart,
  onStop,
  isEnabled
}) => {
  const [recognizing, setRecognizing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('No Web Speech API support');
      setSupported(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (ev: any) => {
      let interim = '';
      let final = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      onTranscriptUpdate({ interim, final });
    };
    
    recognition.onerror = (e: any) => {
      console.error('Speech recognition error', e);
      setError(`Speech recognition error: ${e.error}`);
      setRecognizing(false);
    };
    
    recognition.onend = () => {
      setRecognizing(false);
      if (onStop) onStop();
    };
    
    recognitionRef.current = recognition;
    
    return () => { 
      if (recognitionRef.current) {
        recognitionRef.current.stop(); 
      }
      recognitionRef.current = null; 
    };
  }, [onTranscriptUpdate, onStop]);

  useEffect(() => {
    if (isEnabled && !recognizing) {
      start();
    } else if (!isEnabled && recognizing) {
      stop();
    }
  }, [isEnabled]);

  const start = () => {
    if (!recognitionRef.current) return;
    
    try { 
      recognitionRef.current.start(); 
      setRecognizing(true);
      setError(null);
      if (onStart) onStart();
    } catch (e) { 
      console.warn(e);
      setError(`Failed to start transcription: ${e}`);
    }
  };
  
  const stop = () => {
    if (!recognitionRef.current) return;
    
    try { 
      recognitionRef.current.stop(); 
      setRecognizing(false);
      if (onStop) onStop();
    } catch (e) { }
  };

  if (!supported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Web Speech API is not supported in your browser. Transcription will not work.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="p-2 bg-red-100 text-red-800 rounded text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${recognizing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-gray-600">
            {recognizing ? 'Listening...' : 'Microphone ready'}
          </span>
        </div>
        
        <button 
          onClick={recognizing ? stop : start} 
          className={`px-3 py-1 rounded text-sm ${
            recognizing 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {recognizing ? 'Stop' : 'Start'}
        </button>
      </div>
      
      <div className="text-xs text-gray-500 mt-1">
        Real-time transcription is active when the AI finishes speaking
      </div>
    </div>
  );
};

export default LiveTranscript;