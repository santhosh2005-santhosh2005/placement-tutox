'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CandidateCameraProps {
  onRecordingStart: () => void;
  onRecordingStop: (blob: Blob) => void;
  isRecording: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  onMicToggle: () => void;
  onCameraToggle: () => void;
}

const CandidateCamera: React.FC<CandidateCameraProps> = ({
  onRecordingStart,
  onRecordingStop,
  isRecording,
  micEnabled,
  cameraEnabled,
  onMicToggle,
  onCameraToggle
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize camera
  useEffect(() => {
    if (cameraEnabled) {
      initializeCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [cameraEnabled]);

  const initializeCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: micEnabled
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      streamRef.current = stream;
    } catch (err) {
      console.error('Error accessing camera/mic:', err);
      setError('Could not access camera or microphone. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Handle recording
  useEffect(() => {
    if (isRecording && streamRef.current) {
      startRecording();
    } else if (!isRecording && mediaRecorderRef.current) {
      stopRecording();
    }
  }, [isRecording]);

  const startRecording = () => {
    if (!streamRef.current) return;
    
    recordedChunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      onRecordingStop(blob);
    };
    
    mediaRecorderRef.current.start();
    onRecordingStart();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 rounded-lg overflow-hidden">
      {error ? (
        <div className="flex items-center justify-center h-full w-full bg-gray-800 text-white p-4">
          <div className="text-center">
            <p className="text-red-400 mb-2">⚠️ {error}</p>
            <button 
              onClick={initializeCamera}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              Retry Camera Access
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Video feed */}
          <div className="relative flex-grow">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center bg-red-600 text-white px-3 py-1 rounded-full">
                <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                <span>REC</span>
              </div>
            )}
            
            {/* Camera/Mic status */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={onCameraToggle}
                className={`p-2 rounded-full ${cameraEnabled ? 'bg-green-600' : 'bg-red-600'} text-white`}
                title={cameraEnabled ? 'Disable Camera' : 'Enable Camera'}
              >
                {cameraEnabled ? '📷' : '🚫📷'}
              </button>
              <button
                onClick={onMicToggle}
                className={`p-2 rounded-full ${micEnabled ? 'bg-green-600' : 'bg-red-600'} text-white`}
                title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micEnabled ? '🎤' : '🔇'}
              </button>
            </div>
          </div>
          
          {/* Controls */}
          <div className="p-4 bg-gray-800 flex justify-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-6 py-3 rounded-full font-semibold transition ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isRecording ? '⏹️ Stop Recording' : '⏺️ Start Recording'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CandidateCamera;