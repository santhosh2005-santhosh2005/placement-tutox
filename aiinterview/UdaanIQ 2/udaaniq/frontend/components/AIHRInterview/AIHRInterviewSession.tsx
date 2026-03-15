'use client';

import React, { useState, useEffect } from 'react';
import AIAvatarPlayer from './AIAvatarPlayer';
import AIAvatar from './AIAvatar';
import CandidateCamera from './CandidateCamera';
import LiveTranscript from './LiveTranscript';
import { 
  createAIHRInterviewSession, 
  getNextAIHRQuestion, 
  saveAIHRAnswer, 
  logAIHREvents 
} from '../../services/aihrInterviewService';

interface AIHRInterviewSessionProps {
  company: string;
  role: string;
  mode: 'Practice' | 'Live';
  strictness: string;
  onInterviewEnd: (results: any) => void;
}

const AIHRInterviewSession: React.FC<AIHRInterviewSessionProps> = ({ 
  company, 
  role, 
  mode,
  strictness,
  onInterviewEnd 
}) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [isAISpeaking, setIsAISpeaking] = useState<boolean>(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state variables for real-time functionality
  const [transcript, setTranscript] = useState({ interim: '', final: '' });
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string | null>(null);
  const [repeatCount, setRepeatCount] = useState<number>(0);
  const [allowRepeat, setAllowRepeat] = useState<boolean>(true);

  // Initialize interview session
  useEffect(() => {
    startInterviewSession();
  }, []);

  const startInterviewSession = async () => {
    try {
      const response = await createAIHRInterviewSession(company, role, mode, strictness);
      setSessionId(response.sessionId);
      await fetchNextQuestion(response.sessionId, 'next');
    } catch (err: any) {
      console.error('Error starting interview session:', err);
      setError('Failed to start interview session. Please try again.');
      setIsLoading(false);
    }
  };

  const fetchNextQuestion = async (sessId: string, fetchMode: 'next' | 'repeat' | 'regenerate' = 'next') => {
    try {
      setIsLoading(true);
      setIsAISpeaking(true);
      setError(null);
      
      // Use the AI HR interview next question endpoint
      const response = await getNextAIHRQuestion(sessId, fetchMode);
      
      const question = {
        id: response.question.id,
        text: response.question.text,
        difficulty: response.question.difficulty,
        topics: response.question.topics,
        time: response.question.time,
        rubric: response.question.rubric
      };
      
      setCurrentQuestion(question);
      setAudioUrl(response.audioUrl || null);
      setAvatarVideoUrl(response.avatarVideoUrl || null);
      setRepeatCount(response.repeatCount || 0);
      
      if (fetchMode === 'next') {
        setQuestionCount(prev => prev + 1);
      }
    } catch (err: any) {
      console.error('Error fetching next question:', err);
      setError('Failed to fetch next question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAISpeechEnd = () => {
    // When AI finishes speaking, enable user mic for response
    setIsAISpeaking(false);
    startTranscription();
  };

  const startTranscription = () => {
    setIsTranscribing(true);
    setIsUserSpeaking(true);
    setTranscript({ interim: '', final: '' });
  };

  const handleTranscriptUpdate = ({ interim, final }: { interim: string; final: string }) => {
    setTranscript(prev => ({
      interim,
      final: prev.final + final
    }));
  };

  const handleRecordingStart = () => {
    setIsRecording(true);
  };

  const handleRecordingStop = async (blob: Blob) => {
    setIsRecording(false);
    setIsUserSpeaking(false);
    setIsTranscribing(false);
    
    // Save final transcript
    const finalText = transcript.final + (transcript.interim || '');
    
    // Save answer
    const newAnswer = {
      id: `answer_${Date.now()}`,
      question: currentQuestion.text,
      text: finalText,
      timestamp: new Date()
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    
    // Upload answer using AI HR interview service
    try {
      await saveAIHRAnswer(
        sessionId,
        currentQuestion.id,
        finalText
      );
    } catch (err: any) {
      console.error('Error saving answer:', err);
      setError('Failed to save answer. Please try again.');
    }
  };

  const handleNextQuestion = async () => {
    if (questionCount < 10) { // Limit to 10 questions for demo
      await fetchNextQuestion(sessionId, 'next');
    } else {
      endInterview();
    }
  };

  const handleRepeatQuestion = () => {
    // Replay current question without contacting server
    setIsAISpeaking(true);
  };

  const handleReAskQuestion = async () => {
    // Request server to re-ask the same question
    await fetchNextQuestion(sessionId, 'repeat');
  };

  const handleReplayAnswer = () => {
    // In a real implementation, this would play back the recorded answer
    alert('In a real implementation, this would play back your recorded answer.');
  };

  const handleEndInterview = () => {
    endInterview();
  };

  const endInterview = async () => {
    try {
      // In a real implementation, you might want to send a request to end the session
      onInterviewEnd({
        sessionId,
        questionCount,
        answers
      });
    } catch (err: any) {
      console.error('Error ending interview:', err);
      onInterviewEnd({
        sessionId,
        questionCount,
        answers
      });
    }
  };

  const toggleMic = () => {
    setMicEnabled(prev => !prev);
  };

  const toggleCamera = () => {
    setCameraEnabled(prev => !prev);
  };

  if (isLoading && !currentQuestion) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Starting AI HR interview session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Question {questionCount} of 10</span>
          <span className="text-sm text-gray-500">{Math.round((questionCount / 10) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(questionCount / 10) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Main interview area */}
      <div className="flex flex-col md:flex-row flex-grow gap-4">
        {/* AI Avatar (Left) */}
        <div className="flex-grow md:w-1/2">
          <AIAvatar 
            text={currentQuestion?.text || ''} 
            avatarVideoUrl={avatarVideoUrl}
            audioUrl={audioUrl}
            onSpeechEnd={handleAISpeechEnd}
          />
        </div>
        
        {/* Candidate Camera (Right) */}
        <div className="flex-grow md:w-1/2">
          <CandidateCamera
            onRecordingStart={handleRecordingStart}
            onRecordingStop={handleRecordingStop}
            isRecording={isRecording}
            micEnabled={micEnabled}
            cameraEnabled={cameraEnabled}
            onMicToggle={toggleMic}
            onCameraToggle={toggleCamera}
          />
        </div>
      </div>
      
      {/* Live Transcription Area */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Your Answer</h3>
        <div className="min-h-[100px] p-3 bg-white rounded border">
          <p className="text-gray-700">
            {transcript.final}
            <span className="text-gray-400">{transcript.interim}</span>
          </p>
        </div>
        
        <div className="mt-2">
          <LiveTranscript 
            onTranscriptUpdate={handleTranscriptUpdate}
            isEnabled={isTranscribing}
          />
        </div>
      </div>
      
      {/* Controls */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <button
          onClick={handleRepeatQuestion}
          disabled={isAISpeaking || isRecording}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Repeat Question
        </button>
        
        <button
          onClick={handleReAskQuestion}
          disabled={isAISpeaking || isRecording || (!allowRepeat && repeatCount >= 3)}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Re-ask Question {repeatCount > 0 && `(${repeatCount})`}
        </button>
        
        <button
          onClick={handleNextQuestion}
          disabled={isAISpeaking || isRecording}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {questionCount >= 10 ? 'End Interview' : 'Next Question'}
        </button>
        
        <button
          onClick={handleReplayAnswer}
          disabled={isAISpeaking || isRecording || answers.length === 0}
          className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Replay Answer
        </button>
        
        <button
          onClick={handleEndInterview}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
        >
          End Interview
        </button>
      </div>
      
      {/* Status indicators */}
      <div className="mt-4 text-center text-sm text-gray-600">
        {isAISpeaking && <p>🤖 AI is asking a question...</p>}
        {isUserSpeaking && !isRecording && <p>🎙️ Your turn to answer...</p>}
        {isRecording && <p>🔴 Recording your answer...</p>}
        {isTranscribing && <p>📝 Transcribing your speech...</p>}
      </div>
    </div>
  );
};

export default AIHRInterviewSession;