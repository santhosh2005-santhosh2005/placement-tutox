'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LiveTranscriptionProps {
  onTranscriptUpdate: (update: { interim: string; final: string }) => void;
  onStart?: () => void;
  onStop?: () => void;
}

const LiveTranscription: React.FC<LiveTranscriptionProps> = ({ 
  onTranscriptUpdate, 
  onStart,
  onStop 
}) => {
  const [recognizing, setRecognizing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [supported, setSupported] = useState(true);

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

  const start = () => {
    if (!recognitionRef.current) return;
    
    try { 
      recognitionRef.current.start(); 
      setRecognizing(true);
      if (onStart) onStart();
    } catch (e) { 
      console.warn(e); 
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
      <div className="flex gap-2">
        <button 
          onClick={start} 
          disabled={recognizing}
          className={`px-4 py-2 rounded ${recognizing ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          {recognizing ? 'Listening...' : 'Start Mic'}
        </button>
        <button 
          onClick={stop} 
          disabled={!recognizing}
          className={`px-4 py-2 rounded ${!recognizing ? 'bg-gray-300' : 'bg-red-500 hover:bg-red-600'} text-white`}
        >
          Stop
        </button>
      </div>
    </div>
  );
};

export default LiveTranscription;