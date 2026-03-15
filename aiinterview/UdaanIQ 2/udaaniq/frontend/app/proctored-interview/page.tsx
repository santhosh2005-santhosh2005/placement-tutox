'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  generateCompanyQuestions, 
  scoreAnswer, 
  generateProctoredReport,
  GenerateCompanyQuestionsRequest,
  ProctoredQuestion,
  ScoreAnswerRequest,
  ProctoredScore,
  GenerateReportRequest,
  ProctoredAnswer,
  EvaluateAnswerResponse
} from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { motion, AnimatePresence } from 'framer-motion';
import BackendHealthCheck from '../../components/BackendHealthCheck';
import FloatingCamera from '../../components/FloatingCamera';

export default function ProctoredInterview() {
  // States for interview setup
  const [step, setStep] = useState<'setup' | 'consent' | 'interview' | 'completed'>('setup');
  const [skills, setSkills] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('Intermediate');
  const [jobRole, setJobRole] = useState<string>('Frontend Engineer');
  const [company, setCompany] = useState<string>('Google');
  const [interviewMode, setInterviewMode] = useState<'timed' | 'untimed' | 'behavioral' | 'system-design'>('timed');
  const [duration, setDuration] = useState<string>('60'); // New state for duration
  const [strictness, setStrictness] = useState<'low' | 'medium' | 'high'>('medium');
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(false);
  const [micEnabled, setMicEnabled] = useState<boolean>(false);
  const [practiceMode, setPracticeMode] = useState<boolean>(true);
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  
  // States for interview flow
  const [interviewQuestions, setInterviewQuestions] = useState<ProctoredQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<ProctoredAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  
  // States for evaluation
  const [evaluations, setEvaluations] = useState<ProctoredScore[]>([]);
  const [finalReport, setFinalReport] = useState<any>(null);
  
  // States for UI
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // States for camera and voice
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // States for proctoring
  const [focusLossCount, setFocusLossCount] = useState<number>(0);
  const [facePresent, setFacePresent] = useState<boolean>(true);
  const [pasteEvents, setPasteEvents] = useState<number>(0);
  const [proctoringLogs, setProctoringLogs] = useState<any[]>([]);
  const [voiceActivity, setVoiceActivity] = useState<boolean>(false);
  const [backgroundNoise, setBackgroundNoise] = useState<number>(0);
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timeAllocated, setTimeAllocated] = useState<number>(0);
  
  // Company options
  const companyOptions = [
    'Google', 'Facebook (Meta)', 'Tesla', 'TCS', 'Infosys', 
    'Amazon', 'Microsoft', 'Apple', 'Adobe', 'Uber'
  ];
  
  // Job role options
  const jobRoleOptions = [
    'Frontend Engineer', 'Backend Engineer', 'SDE', 
    'Data Scientist', 'ML Engineer', 'QA', 'DevOps'
  ];

  // Duration options
  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' }
  ];

  // Generate company-specific interview questions
  const handleGenerateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const request: GenerateCompanyQuestionsRequest = {
        company,
        role: jobRole,
        difficultyProfile: experienceLevel.toLowerCase()
      };
      
      const response = await generateCompanyQuestions(request);
      setInterviewQuestions(response);
      
      // Set initial time for first question
      if (response.length > 0) {
        setTimeAllocated(response[0].time * 60); // Convert minutes to seconds
        setTimeLeft(response[0].time * 60);
      }
      
      setStep('consent');
    } catch (err) {
      setError('Failed to generate company-specific interview. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Start the interview after consent
  const handleStartInterview = async () => {
    if (!consentGiven) {
      setError('Please give your consent to proceed.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Parallelize company question generation and media access
      const generateQuestionsPromise = generateCompanyQuestions({
        company,
        role: jobRole,
        difficultyProfile: experienceLevel.toLowerCase()
      });
      
      let mediaPromise: Promise<MediaStream | null> | null = null;
      if (cameraEnabled || micEnabled) {
        mediaPromise = navigator.mediaDevices.getUserMedia({ 
          video: cameraEnabled, 
          audio: micEnabled 
        });
      }
      
      // Execute both promises in parallel
      const [questionsSettled, mediaSettled] = await Promise.allSettled([
        generateQuestionsPromise,
        ...(mediaPromise ? [mediaPromise] : [])
      ]);
      
      // Handle questions result
      if (questionsSettled.status === 'fulfilled' && questionsSettled.value) {
        setInterviewQuestions(questionsSettled.value);
        
        // Set initial time for first question
        if (questionsSettled.value.length > 0) {
          setTimeAllocated(questionsSettled.value[0].time * 60); // Convert minutes to seconds
          setTimeLeft(questionsSettled.value[0].time * 60);
        }
      } else {
        setError('Failed to generate company-specific interview. Please try again.');
        setLoading(false);
        return;
      }
      
      // Handle media result
      if (mediaPromise && mediaSettled.status === 'fulfilled' && mediaSettled.value) {
        setStream(mediaSettled.value);
        
        // Set up face detection if needed
        if (videoRef.current && cameraEnabled) {
          videoRef.current.srcObject = mediaSettled.value;
        }
        
        // Set up audio analysis if needed
        if (micEnabled) {
          setupAudioAnalysis(mediaSettled.value);
        }
      } else if (mediaPromise) {
        setError('Failed to access camera/microphone. Continuing without media.');
      }
      
      setStep('interview');
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setEvaluations([]);
      setFinalReport(null);
      
      // Initialize proctoring
      initializeProctoring();
    } catch (err) {
      setError('Failed to start interview. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize proctoring features
  const initializeProctoring = () => {
    // Tab visibility detection
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Focus/blur detection
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    
    // Paste detection
    document.addEventListener('paste', handlePaste);
    
    // Initialize camera if enabled
    if (cameraEnabled) {
      initializeCamera();
    }
    
    // Initialize microphone if enabled
    if (micEnabled) {
      initializeMicrophone();
    }
    
    // Start timer if in timed mode
    if (interviewMode === 'timed' && interviewQuestions.length > 0) {
      startTimer();
    }
  };

  // Handle tab visibility change
  const handleVisibilityChange = () => {
    const event = {
      type: 'visibility_change',
      timestamp: new Date().toISOString(),
      hidden: document.hidden
    };
    setProctoringLogs(prev => [...prev, event]);
    
    if (document.hidden) {
      const newCount = focusLossCount + 1;
      setFocusLossCount(newCount);
      
      // Show warning based on strictness
      if (strictness === 'high' && newCount > 2) {
        alert('Warning: Multiple focus losses detected. This may be logged.');
      } else if (strictness === 'medium' && newCount > 4) {
        alert('Warning: Multiple focus losses detected. This may be logged.');
      }
    }
  };

  // Handle window blur
  const handleWindowBlur = () => {
    const newCount = focusLossCount + 1;
    setFocusLossCount(newCount);
    
    // Log the event
    const event = {
      type: 'window_blur',
      timestamp: new Date().toISOString()
    };
    setProctoringLogs(prev => [...prev, event]);
  };

  // Handle window focus
  const handleWindowFocus = () => {
    // Log the event
    const event = {
      type: 'window_focus',
      timestamp: new Date().toISOString()
    };
    setProctoringLogs(prev => [...prev, event]);
  };

  // Handle paste events
  const handlePaste = () => {
    const newCount = pasteEvents + 1;
    setPasteEvents(newCount);
    
    // Log the event
    const event = {
      type: 'paste_event',
      timestamp: new Date().toISOString()
    };
    setProctoringLogs(prev => [...prev, event]);
    
    // Show warning based on strictness
    if (strictness === 'high' && newCount > 3) {
      alert('Warning: Multiple paste events detected. This may be logged.');
    } else if (strictness === 'medium' && newCount > 5) {
      alert('Warning: Multiple paste events detected. This may be logged.');
    }
  };

  // Initialize camera
  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      
      // Set up face detection if needed
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Failed to access camera. Please check your permissions.');
      console.error(err);
    }
  };

  // Initialize microphone
  const initializeMicrophone = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(prevStream => {
        if (prevStream) {
          audioStream.getAudioTracks().forEach(track => {
            prevStream.addTrack(track);
          });
          return prevStream;
        }
        return audioStream;
      });
      
      // Set up audio analysis
      setupAudioAnalysis(audioStream);
    } catch (err) {
      setError('Failed to access microphone. Please check your permissions.');
      console.error(err);
    }
  };

  // Set up audio analysis for voice activity detection
  const setupAudioAnalysis = (audioStream: MediaStream) => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(audioStream);
    const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;

    microphone.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
    javascriptNode.onaudioprocess = function() {
      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      let values = 0;

      const length = array.length;
      for (let i = 0; i < length; i++) {
        values += (array[i] / 255);
      }

      const average = values / length;
      setVoiceActivity(average > 0.01); // Adjust threshold as needed
      setBackgroundNoise(average);
    };
  };

  // Start timer for timed questions
  const startTimer = () => {
    if (interviewQuestions.length > 0 && currentQuestionIndex < interviewQuestions.length) {
      const time = interviewQuestions[currentQuestionIndex].time * 60; // Convert to seconds
      setTimeLeft(time);
      setTimeAllocated(time);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return timer;
    }
  };

  // Handle answer submission for current question
  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Save the user's answer
      const currentQuestion = interviewQuestions[currentQuestionIndex];
      const answerData: ProctoredAnswer = {
        questionId: currentQuestion.id,
        answer: currentAnswer,
        timeTaken: timeAllocated - timeLeft
      };
      
      const newAnswers = [...userAnswers, answerData];
      setUserAnswers(newAnswers);
      
      // Score the answer using Gemini
      const request: ScoreAnswerRequest = {
        question: currentQuestion,
        userAnswer: currentAnswer
      };
      
      const evaluation = await scoreAnswer(request);
      setEvaluations([...evaluations, evaluation]);
      
      // Move to next question or finish interview
      if (currentQuestionIndex < interviewQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentAnswer('');
        
        // Update timer for next question
        if (interviewMode === 'timed') {
          const nextTime = interviewQuestions[currentQuestionIndex + 1].time * 60;
          setTimeLeft(nextTime);
          setTimeAllocated(nextTime);
        }
      } else {
        // Interview completed, generate final report
        setStep('completed');
        const reportRequest: GenerateReportRequest = {
          questions: interviewQuestions,
          answers: newAnswers,
          proctoringData: {
            focusLossCount,
            pasteEvents,
            facePresent,
            voiceActivity,
            backgroundNoise,
            logs: proctoringLogs
          }
        };
        const report = await generateProctoredReport(reportRequest);
        setFinalReport(report);
      }
    } catch (err) {
      setError('Failed to evaluate answer. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Move to next question without submitting (skip question)
  const handleSkipQuestion = () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
      setError(null);
      
      // Update timer for next question
      if (interviewMode === 'timed') {
        const nextTime = interviewQuestions[currentQuestionIndex + 1].time * 60;
        setTimeLeft(nextTime);
        setTimeAllocated(nextTime);
      }
    } else {
      // If it's the last question, complete the interview
      setStep('completed');
    }
  };

  // Reset the interview
  const handleReset = () => {
    setStep('setup');
    setInterviewQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setCurrentAnswer('');
    setEvaluations([]);
    setFinalReport(null);
    setError(null);
    setFocusLossCount(0);
    setPasteEvents(0);
    setProctoringLogs([]);
    setVoiceActivity(false);
    setBackgroundNoise(0);
    setTimeLeft(0);
    setTimeAllocated(0);
    
    // Stop camera stream if active
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Get current question
  const currentQuestion = interviewQuestions[currentQuestionIndex];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Remove event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('paste', handlePaste);
      
      // Stop media tracks
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get proctoring status color
  const getProctoringStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-[#34A853]';
      case 'warning': return 'bg-[#FBBC05]';
      case 'danger': return 'bg-[#EA4335]';
      default: return 'bg-gray-500';
    }
  };

  // Get proctoring status
  const getProctoringStatus = () => {
    if (strictness === 'high') {
      if (focusLossCount > 2 || pasteEvents > 3) return 'danger';
      if (focusLossCount > 0 || pasteEvents > 0) return 'warning';
      return 'good';
    } else if (strictness === 'medium') {
      if (focusLossCount > 4 || pasteEvents > 5) return 'danger';
      if (focusLossCount > 1 || pasteEvents > 2) return 'warning';
      return 'good';
    } else {
      if (focusLossCount > 6 || pasteEvents > 8) return 'danger';
      if (focusLossCount > 3 || pasteEvents > 5) return 'warning';
      return 'good';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-[#F9FAFB] min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#202124]">Proctored Interview</h1>
      
      <BackendHealthCheck />
      
      {/* Setup Step */}
      {step === 'setup' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFFFFF] rounded-xl shadow-md p-6 mb-8 border border-gray-200"
        >
          <h2 className="text-2xl font-semibold mb-4 text-[#202124]">Configure Your Interview</h2>
          <form onSubmit={handleGenerateInterview} className="space-y-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-[#5F6368] mb-1">
                Company
              </label>
              <select
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              >
                {companyOptions.map((comp) => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="jobRole" className="block text-sm font-medium text-[#5F6368] mb-1">
                Job Role
              </label>
              <select
                id="jobRole"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              >
                {jobRoleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-[#5F6368] mb-1">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Senior">Senior</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="interviewMode" className="block text-sm font-medium text-[#5F6368] mb-1">
                Interview Mode
              </label>
              <select
                id="interviewMode"
                value={interviewMode}
                onChange={(e) => setInterviewMode(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              >
                <option value="timed">Timed</option>
                <option value="untimed">Untimed</option>
                <option value="behavioral">Behavioral</option>
                <option value="system-design">System Design</option>
              </select>
            </div>
            
            {interviewMode === 'timed' && (
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-[#5F6368] mb-1">
                  Duration
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                >
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label htmlFor="strictness" className="block text-sm font-medium text-[#5F6368] mb-1">
                Proctoring Strictness
              </label>
              <select
                id="strictness"
                value={strictness}
                onChange={(e) => setStrictness(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                id="practiceMode"
                type="checkbox"
                checked={practiceMode}
                onChange={(e) => setPracticeMode(e.target.checked)}
                className="h-4 w-4 text-[#1A73E8] focus:ring-[#1A73E8] border-gray-300 rounded"
              />
              <label htmlFor="practiceMode" className="ml-2 block text-sm text-[#5F6368]">
                Practice Mode (minimal logging)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="cameraEnabled"
                type="checkbox"
                checked={cameraEnabled}
                onChange={(e) => setCameraEnabled(e.target.checked)}
                className="h-4 w-4 text-[#1A73E8] focus:ring-[#1A73E8] border-gray-300 rounded"
              />
              <label htmlFor="cameraEnabled" className="ml-2 block text-sm text-[#5F6368]">
                Enable Camera (Required for proctoring)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="micEnabled"
                type="checkbox"
                checked={micEnabled}
                onChange={(e) => setMicEnabled(e.target.checked)}
                className="h-4 w-4 text-[#1A73E8] focus:ring-[#1A73E8] border-gray-300 rounded"
              />
              <label htmlFor="micEnabled" className="ml-2 block text-sm text-[#5F6368]">
                Enable Microphone (For voice analysis)
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A73E8] text-white py-2 px-4 rounded-lg hover:bg-[#1557b0] focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Generating Interview...' : 'Configure Interview'}
            </button>
          </form>
        </motion.div>
      )}
      
      {/* Consent Step */}
      {step === 'consent' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFFFFF] rounded-xl shadow-md p-6 mb-8 border border-gray-200"
        >
          <h2 className="text-2xl font-semibold mb-4 text-[#202124]">Interview Consent</h2>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Proctoring Information</h3>
            <p className="text-[#5F6368] mb-3">
              This interview includes proctoring features to ensure fairness and integrity:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#5F6368]">
              <li>Tab visibility monitoring (counts focus shifts)</li>
              <li>Camera monitoring (confirms your presence)</li>
              {micEnabled && <li>Microphone monitoring (voice activity detection)</li>}
              <li>Paste event tracking</li>
              <li>Screen activity monitoring</li>
            </ul>
          </div>
          
          {cameraEnabled && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-[#202124] mb-2">Camera Preview</h3>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500">Camera preview will appear after starting the interview</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-[#202124] mb-2">Microphone Test</h3>
            {micEnabled ? (
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-[#5F6368]">Microphone is enabled. Speak to test.</p>
                <div className="mt-2 flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${voiceActivity ? 'bg-[#34A853]' : 'bg-[#EA4335]'}`}></div>
                  <span className="text-sm text-[#5F6368]">
                    {voiceActivity ? 'Voice detected' : 'No voice detected'}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs text-[#5F6368] mb-1">Background noise level</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#1A73E8] h-2 rounded-full" 
                      style={{ width: `${Math.min(backgroundNoise * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-100 rounded border border-gray-200">
                <p className="text-[#5F6368]">Microphone is disabled.</p>
              </div>
            )}
          </div>
          
          <div className="mb-6 flex items-start">
            <input
              id="consent"
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 h-4 w-4 text-[#1A73E8] focus:ring-[#1A73E8] border-gray-300 rounded"
            />
            <label htmlFor="consent" className="ml-2 block text-sm text-[#5F6368]">
              I understand that this interview includes proctoring features and consent to the monitoring 
              described above. I understand that my responses, video, and audio (if enabled) will be recorded 
              and used for evaluation purposes only.
            </label>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setStep('setup')}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors"
            >
              Back
            </button>
            
            <button
              onClick={handleStartInterview}
              disabled={!consentGiven || loading}
              className="flex-1 bg-[#1A73E8] text-white py-2 px-4 rounded-lg hover:bg-[#1557b0] focus:outline-none disabled:opacity-50 transition-colors"
            >
              {loading ? 'Starting Interview...' : 'Start Interview'}
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Interview Step */}
      {step === 'interview' && currentQuestion && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Progress Rail */}
          <div className="lg:col-span-1 bg-[#FFFFFF] border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-[#202124]">Interview Progress</h3>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-[#5F6368] mb-1">
                <span>Question {currentQuestionIndex + 1} of {interviewQuestions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / interviewQuestions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#1A73E8] h-2 rounded-full" 
                  style={{ width: `${((currentQuestionIndex + 1) / interviewQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Timer */}
            {interviewMode === 'timed' && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-[#5F6368] mb-1">Time Remaining</div>
                <div className={`text-xl font-bold ${timeLeft < 60 ? 'text-[#EA4335]' : 'text-[#202124]'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-[#5F6368] mb-2">Proctoring Status</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getProctoringStatusColor(getProctoringStatus())}`}></div>
                  <span className="text-sm text-[#5F6368]">Overall: {getProctoringStatus().toUpperCase()}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${focusLossCount > 2 ? 'bg-[#EA4335]' : focusLossCount > 0 ? 'bg-[#FBBC05]' : 'bg-[#34A853]'}`}></div>
                  <span className="text-sm text-[#5F6368]">Focus Losses: {focusLossCount}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${facePresent ? 'bg-[#34A853]' : 'bg-[#EA4335]'}`}></div>
                  <span className="text-sm text-[#5F6368]">Face Detected: {facePresent ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${pasteEvents > 3 ? 'bg-[#EA4335]' : pasteEvents > 0 ? 'bg-[#FBBC05]' : 'bg-[#34A853]'}`}></div>
                  <span className="text-sm text-[#5F6368]">Paste Events: {pasteEvents}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${voiceActivity ? 'bg-[#34A853]' : 'bg-[#FBBC05]'}`}></div>
                  <span className="text-sm text-[#5F6368]">Voice Activity: {voiceActivity ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <button className="w-full py-2 px-3 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-[#5F6368] transition-colors">
                Pause Interview
              </button>
              <button 
                onClick={() => setStep('setup')}
                className="w-full py-2 px-3 text-sm bg-red-100 hover:bg-red-200 rounded-lg text-red-700 transition-colors"
              >
                End Interview
              </button>
            </div>
          </div>
          
          {/* Main Question Area */}
          <div className="lg:col-span-3 bg-[#FFFFFF] border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#202124]">Question {currentQuestionIndex + 1}</h2>
              <div className="flex gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  {currentQuestion.difficulty}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  {currentQuestion.topics.join(', ')}
                </span>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-base text-[#202124]">{currentQuestion.text}</p>
              <div className="mt-3 text-sm text-[#5F6368]">
                Suggested time: {currentQuestion.time} minutes
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="answer" className="block text-sm font-medium text-[#5F6368] mb-1">Your Answer</label>
              <textarea
                id="answer"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={8}
                className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] text-[#202124] placeholder:text-gray-400"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAnswerSubmit}
                disabled={loading}
                className="flex-1 bg-[#1A73E8] text-white py-2 px-4 rounded-lg hover:bg-[#1557b0] focus:outline-none focus:ring-2 focus:ring-[#1A73E8] disabled:opacity-50 transition-colors"
              >
                {currentQuestionIndex < interviewQuestions.length - 1 ? 'Submit & Next' : 'Submit & Finish'}
              </button>
              
              {currentQuestionIndex < interviewQuestions.length - 1 && (
                <button
                  onClick={handleSkipQuestion}
                  disabled={loading}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none disabled:opacity-50 transition-colors"
                >
                  Skip Question
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Completed Step */}
      {step === 'completed' && finalReport && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFFFFF] border border-gray-200 rounded-xl p-6 mb-8 shadow-md"
        >
          <h2 className="text-2xl font-semibold mb-4 text-center text-[#202124]">Interview Completed!</h2>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <h3 className="text-xl font-semibold mb-2 text-[#202124]">Overall Score: {finalReport.overallScore}/10</h3>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-[#1A73E8] h-3 rounded-full" style={{ width: `${finalReport.overallScore * 10}%` }}></div>
            </div>
          </div>
          
          {/* Skill Analysis Radar Chart */}
          <div className="mb-6 p-4 rounded-lg border border-blue-200 bg-blue-50">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">Skill Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(finalReport.skillAnalysis).map(([skill, score]) => (
                <div key={skill} className="p-3 bg-white rounded-lg border border-blue-100">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-blue-700">{skill}</span>
                    <span className="text-sm font-medium text-blue-700">{score as number}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#1A73E8] h-2 rounded-full" 
                      style={{ width: `${(score as number) * 10}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 rounded-lg border border-green-200 bg-green-50">
              <h3 className="text-lg font-semibold mb-2 text-green-700">Strengths</h3>
              <ul className="list-disc pl-5 space-y-1">
                {finalReport.recommendations.slice(0, 3).map((strength: string, index: number) => (
                  <li key={index} className="text-[#5F6368]">{strength}</li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
              <h3 className="text-lg font-semibold mb-2 text-amber-700">Areas for Improvement</h3>
              <ul className="list-disc pl-5 space-y-1">
                {finalReport.skillGaps.map((improvement: string, index: number) => (
                  <li key={index} className="text-[#5F6368]">{improvement}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mb-6 p-4 rounded-lg border border-purple-200 bg-purple-50">
            <h3 className="text-lg font-semibold mb-2 text-purple-700">Proctoring Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
                <div className="text-2xl font-bold text-purple-800">{focusLossCount}</div>
                <div className="text-sm text-[#5F6368]">Focus Losses</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
                <div className="text-2xl font-bold text-purple-800">{pasteEvents}</div>
                <div className="text-sm text-[#5F6368]">Paste Events</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
                <div className="text-2xl font-bold text-purple-800">{proctoringLogs.length}</div>
                <div className="text-sm text-[#5F6368]">Total Events</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-[#1A73E8] text-white py-2 px-4 rounded-lg hover:bg-[#1557b0] focus:outline-none transition-colors"
            >
              Start New Interview
            </button>
          </div>
        </motion.div>
      )}
      
      {error && <ErrorMessage message={error} />}
      
      {loading && <LoadingSpinner />}
      
      {/* Floating Camera Preview */}
      {stream && (
        <FloatingCamera 
          stream={stream} 
          onClose={() => {
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
              setStream(null);
            }
          }}
          onMuteToggle={(muted) => {
            // Handle mute toggle if needed
          }}
        />
      )}
    </div>
  );
}