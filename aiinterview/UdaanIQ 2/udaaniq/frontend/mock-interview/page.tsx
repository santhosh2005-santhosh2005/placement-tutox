'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  generateMockInterview, 
  evaluateAnswer, 
  gradeAnswer, 
  generateInterviewFeedback,
  analyzeInterviewChat,
  GenerateInterviewQuestionsRequest,
  MockInterviewQuestion,
  EvaluateAnswerRequest,
  EvaluateAnswerResponse,
  GradeAnswerRequest,
  GradeAnswerResponse,
  ChatAnalysisRequestMessage,
  ChatAnalysisResponse
} from '../../services/api';
import { 
  createInterviewSession,
  fetchInterviewQuestions,
  logProctoringEvents,
  CreateInterviewRequest,
  FetchQuestionsRequest,
  ProctoringEvent
} from '../../services/interviewSessionService';
import { requestCameraMic } from '../../utils/getMedia';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import BackendHealthCheck from '../../components/BackendHealthCheck';
import FloatingCamera from '../../components/FloatingCamera';
import InterviewAnalyzer from '../../components/InterviewAnalyzer';

export default function MockInterview() {
  // States for interview setup
  const [company, setCompany] = useState<string>('');
  const [jobRole, setJobRole] = useState<string>('');
  const [mode, setMode] = useState<string>('timed');
  const [duration, setDuration] = useState<string>('30'); // New state for duration
  const [strictness, setStrictness] = useState<string>('medium');
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [recordingConsent, setRecordingConsent] = useState<boolean>(false);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  
  // States for interview flow
  const [interviewQuestions, setInterviewQuestions] = useState<MockInterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  
  // States for evaluation
  const [evaluations, setEvaluations] = useState<EvaluateAnswerResponse[]>([]);
  const [finalFeedback, setFinalFeedback] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<ChatAnalysisRequestMessage[]>([]);
  const [chatAnalysis, setChatAnalysis] = useState<ChatAnalysisResponse | null>(null);
  
  // States for UI
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewStarted, setInterviewStarted] = useState<boolean>(false);
  const [interviewCompleted, setInterviewCompleted] = useState<boolean>(false);
  const [showSetup, setShowSetup] = useState<boolean>(true);
  const [showConsent, setShowConsent] = useState<boolean>(false);
  
  // States for camera and voice
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [voiceActivity, setVoiceActivity] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // States for proctoring
  const [sessionId, setSessionId] = useState<string>('');
  const [proctoringEvents, setProctoringEvents] = useState<ProctoringEvent[]>([]);
  
  // States for analyzer
  const [analyzerSessionId, setAnalyzerSessionId] = useState<string>('');
  
  // Company options
  const companyOptions = [
    'Google', 'Meta', 'Tesla', 'TCS', 'Infosys', 
    'Amazon', 'Microsoft', 'Apple', 'Adobe', 'Uber', 'Other'
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

  // Generate mock interview questions
  const handleGenerateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!company || !jobRole) {
      setError('Please select both company and job role.');
      return;
    }
    
    setShowSetup(false);
    setShowConsent(true);
  };

  // Start interview after consent
  const handleStartInterview = async () => {
    if (!consentGiven) {
      setError('Please give your consent to proceed.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create interview session
      const createRequest: CreateInterviewRequest = {
        userId: 'user_123', // In a real app, this would come from auth
        company,
        role: jobRole,
        mode,
        strictness,
        consent: consentGiven
      };
      
      const sessionResponse = await createInterviewSession(createRequest);
      setSessionId(sessionResponse.sessionId);
      setAnalyzerSessionId(sessionResponse.sessionId); // Set analyzer session ID
      
      // Parallelize media access and question fetching
      const mediaPromise = requestCameraMic();
      const fetchRequest: FetchQuestionsRequest = {
        company,
        role: jobRole,
        difficulty_profile: 'mix'
      };
      const questionsPromise = fetchInterviewQuestions(sessionResponse.sessionId, fetchRequest);
      
      const [mediaSettled, questionsSettled] = await Promise.allSettled([mediaPromise, questionsPromise]);
      
      // Questions: render immediately if available (do NOT wait for camera)
      if (questionsSettled.status === 'fulfilled' && questionsSettled.value) {
        console.log('Questions fetch successful:', questionsSettled.value);
        const q = questionsSettled.value.questions || questionsSettled.value;
        console.log('Setting interview questions:', q);
        
        // Validate question structure
        if (Array.isArray(q) && q.length > 0) {
          const firstQuestion = q[0];
          if (!firstQuestion.question) {
            console.warn('Questions missing "question" field, attempting to use "text" field');
            // Map text field to question field if needed
            const fixedQuestions = q.map((question: any) => ({
              ...question,
              question: question.question || question.text || 'No question text available'
            }));
            setInterviewQuestions(fixedQuestions);
          } else {
            setInterviewQuestions(q);
          }
        } else {
          setInterviewQuestions(q);
        }
        
        if (questionsSettled.value.fallback) {
          setError('Using cached questions due to API unavailability.');
          console.log('Using fallback questions');
        } else {
          console.log('Successfully loaded questions from API');
        }
      } else {
        // Use cached questions as fallback
        console.error('Questions fetch failed:', questionsSettled.status === 'rejected' ? questionsSettled.reason : 'Unknown error');
        const cachedQuestions = [
          {
            id: '1',
            question: `Tell me about yourself and your experience as a ${jobRole} at ${company}.`,
            type: 'Behavioral'
          },
          {
            id: '2',
            question: `Why do you want to work at ${company}?`,
            type: 'Behavioral'
          },
          {
            id: '3',
            question: 'Describe a challenging project you worked on and your role in it.',
            type: 'Technical'
          },
          {
            id: '4',
            question: 'How do you handle conflicts in a team environment?',
            type: 'Behavioral'
          },
          {
            id: '5',
            question: 'Where do you see yourself in 5 years?',
            type: 'Behavioral'
          }
        ];
        setInterviewQuestions(cachedQuestions);
        setError('Using cached questions due to fetch error.');
      }
      
      // Media: attach if available
      if (mediaSettled.status === 'fulfilled' && mediaSettled.value) {
        setStream(mediaSettled.value);
        setCameraEnabled(true);
        setVoiceEnabled(true);
        
        // Set up voice activity detection
        setupVoiceActivityDetection(mediaSettled.value);
      } else {
        setError('Camera unavailable or denied — continue without camera.');
      }
      
      setInterviewStarted(true);
      setShowConsent(false);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setEvaluations([]);
      setFinalFeedback(null);
      setInterviewCompleted(false);
      
      // Start proctoring
      startProctoring(sessionResponse.sessionId);
    } catch (err) {
      // Handle network errors specifically
      if (err instanceof Error && err.message.includes('Network error')) {
        setError('Network error - please check your connection and ensure the backend server is running. ' + err.message);
      } else {
        setError('Failed to start interview. Please try again. ' + (err instanceof Error ? err.message : ''));
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Set up voice activity detection
  const setupVoiceActivityDetection = (audioStream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    };
  };

  // Start proctoring
  const startProctoring = (sessionId: string) => {
    const buffer: ProctoringEvent[] = [];
    
    const pushLogs = async () => {
      if (buffer.length === 0) return;
      try {
        await logProctoringEvents(sessionId, { events: [...buffer] });
        buffer.length = 0; // Clear buffer
      } catch (err) {
        console.error('Failed to log proctoring events:', err);
      }
    };
    
    const handler = (ev: Event) => {
      const type = (ev.type === "visibilitychange") ? "visibility" : ev.type;
      const value = (document.visibilityState || "") || "";
      
      const event: ProctoringEvent = {
        type,
        value,
        timestamp: new Date().toISOString()
      };
      
      buffer.push(event);
      
      // Show UI warning if tab is hidden
      if (type === "visibility" && value === "hidden") {
        alert('Warning: You have switched away from the interview tab. This incident will be logged.');
      }
      
      // Batch send logs every 5 seconds
      setTimeout(pushLogs, 5000);
    };
    
    document.addEventListener("visibilitychange", handler);
    window.addEventListener("blur", handler);
    window.addEventListener("focus", handler);
    
    // Cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handler);
      window.removeEventListener("blur", handler);
      window.removeEventListener("focus", handler);
    };
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
      const answerData = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        userAnswer: currentAnswer,
        questionType: currentQuestion.type
      };
      
      const newAnswers = [...userAnswers, answerData];
      setUserAnswers(newAnswers);
      
      // Enhanced answer evaluation with more thorough checking
      // This ensures we don't give high scores for minimal answers
      if (currentAnswer.trim().length < 30) {
        // If answer is too short, provide immediate feedback
        const basicEvaluation: EvaluateAnswerResponse = {
          score: 3,
          strengths: ["None identified due to brevity"],
          improvements: ["Expand your answer with specific examples", "Explain your reasoning in more detail"],
          betterAnswer: "A more detailed answer would include specific examples and explanations of your thought process."
        };
        setEvaluations([...evaluations, basicEvaluation]);
      } else {
        // For longer answers, use the robust grading API for proper evaluation
        const request: GradeAnswerRequest = {
          question: currentQuestion.question,
          userAnswer: currentAnswer,
          questionType: currentQuestion.type
        };
        
        try {
          const gradeResponse: GradeAnswerResponse = await gradeAnswer(request);
          setEvaluations([...evaluations, gradeResponse.evaluation]);
        } catch (gradeError) {
          // Fallback to the original evaluation method if robust grading fails
          console.error('Robust grading failed, falling back to standard evaluation:', gradeError);
          const fallbackRequest: EvaluateAnswerRequest = {
            question: currentQuestion.question,
            userAnswer: currentAnswer,
            questionType: currentQuestion.type
          };
          const evaluation = await evaluateAnswer(fallbackRequest);
          setEvaluations([...evaluations, evaluation]);
        }
      }
      
      // Move to next question or finish interview
      if (currentQuestionIndex < interviewQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentAnswer('');
      } else {
        // Interview completed, generate final feedback
        setInterviewCompleted(true);
        const feedback = await generateInterviewFeedback({ answers: newAnswers });
        setFinalFeedback(feedback);
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
    } else {
      // If it's the last question, complete the interview
      setInterviewCompleted(true);
    }
  };

  // Handle chat message and analysis
  const handleSendChat = async () => {
    if (!currentAnswer.trim()) return;
    const next = [...chatMessages, { role: 'user', content: currentAnswer } as ChatAnalysisRequestMessage];
    setChatMessages(next);
    try {
      const analysis = await analyzeInterviewChat(next);
      setChatAnalysis(analysis);
    } catch (e) {
      // ignore transient errors
    }
  };

  // Reset the interview
  const handleReset = () => {
    setInterviewStarted(false);
    setInterviewCompleted(false);
    setShowSetup(true);
    setShowConsent(false);
    setInterviewQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setCurrentAnswer('');
    setEvaluations([]);
    setFinalFeedback(null);
    setError(null);
    setCompany('');
    setJobRole('');
    setMode('timed');
    setStrictness('medium');
    setConsentGiven(false);
    setRecordingConsent(false);
    setIsLiveMode(false);
    
    // Stop camera stream if active
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraEnabled(false);
    setVoiceEnabled(false);
    setVoiceActivity(false);
  };
  
  // Toggle camera on/off
  const toggleCamera = async () => {
    try {
      if (cameraEnabled && stream) {
        // Turn off camera
        stream.getTracks().forEach(track => {
          if (track.kind === 'video') {
            track.stop();
          }
        });
        setCameraEnabled(false);
        setStream(null);
      } else {
        // Turn on camera
        const mediaStream = await requestCameraMic();
        if (mediaStream) {
          setStream(mediaStream);
          setCameraEnabled(true);
        }
      }
    } catch (err) {
      setError('Failed to access camera. Please check your permissions.');
      console.error(err);
    }
  };
  
  // Toggle voice on/off
  const toggleVoice = async () => {
    try {
      if (voiceEnabled) {
        // Turn off microphone and speech recognition
        if (stream) {
          stream.getTracks().forEach(track => {
            if (track.kind === 'audio') {
              track.stop();
            }
          });
        }
        
        // Stop speech recognition
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
        
        setVoiceEnabled(false);
      } else {
        // Turn on microphone
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(prevStream => {
          // If there's already a stream (from camera), add audio tracks to it
          if (prevStream) {
            audioStream.getAudioTracks().forEach(track => {
              prevStream.addTrack(track);
            });
            return prevStream;
          }
          // Otherwise return the new audio stream
          return audioStream;
        });
        
        // Start speech recognition
        const hasWebkitSpeech = 'webkitSpeechRecognition' in window;
        const hasSpeech = 'SpeechRecognition' in window;
        
        if (hasWebkitSpeech || hasSpeech) {
          const SpeechRecognition = (window as any)[hasWebkitSpeech ? 'webkitSpeechRecognition' : 'SpeechRecognition'];
          const recognition = new SpeechRecognition();
          
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          
          recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }
            
            if (finalTranscript) {
              setCurrentAnswer(prev => prev + ' ' + finalTranscript);
            }
          };
          
          recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'not-allowed') {
              setError('Microphone access denied. Please check your permissions.');
              setVoiceEnabled(false);
            }
          };
          
          recognition.start();
          recognitionRef.current = recognition;
        } else {
          setError('Speech recognition is not supported in your browser.');
        }
        
        setVoiceEnabled(true);
      }
    } catch (err) {
      setError('Failed to access microphone. Please check your permissions.');
      console.error(err);
    }
  };

  // Get current question
  const currentQuestion = interviewQuestions[currentQuestionIndex];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop media tracks
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Mock Interview Practice</h1>
      
      <BackendHealthCheck />
      
      {showSetup && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Configure Your Mock Interview</h2>
          <form onSubmit={handleGenerateInterview} className="space-y-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <select
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a company</option>
                {companyOptions.map((comp) => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>
            
            {company === 'Other' && (
              <div>
                <label htmlFor="customCompany" className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Company Name
                </label>
                <input
                  type="text"
                  id="customCompany"
                  value={company === 'Other' ? '' : company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Enter company name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
            
            <div>
              <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700 mb-1">
                Job Role
              </label>
              <select
                id="jobRole"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a job role</option>
                {jobRoleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1">
                Mode
              </label>
              <select
                id="mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="timed">Timed</option>
                <option value="untimed">Untimed</option>
                <option value="practice">Practice</option>
              </select>
            </div>
            
            {mode === 'timed' && (
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label htmlFor="strictness" className="block text-sm font-medium text-gray-700 mb-1">
                Strictness
              </label>
              <select
                id="strictness"
                value={strictness}
                onChange={(e) => setStrictness(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                id="isLiveMode"
                type="checkbox"
                checked={isLiveMode}
                onChange={(e) => setIsLiveMode(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isLiveMode" className="ml-2 block text-sm text-gray-700">
                Live Mode (with recording)
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Configuring...' : 'Configure Interview'}
            </button>
          </form>
        </div>
      )}
      
      {showConsent && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Consent Required</h2>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Camera & Microphone Access</h3>
            <p className="text-gray-700 mb-3">
              This interview requires access to your camera and microphone for proctoring purposes.
            </p>
            
            {isLiveMode && (
              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    id="recordingConsent"
                    type="checkbox"
                    checked={recordingConsent}
                    onChange={(e) => setRecordingConsent(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="recordingConsent" className="ml-2 block text-sm text-gray-700">
                    I consent to recording upload (optional for Live mode)
                  </label>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="consent"
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="consent" className="ml-2 block text-sm text-gray-700">
                I consent to camera/mic preview and lightweight telemetry (visibility, paste events). Recording upload optional.
              </label>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {setShowConsent(false); setShowSetup(true);}}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Back
            </button>
            
            <button
              onClick={handleStartInterview}
              disabled={!consentGiven || loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Starting Interview...' : isLiveMode ? 'Start Live' : 'Start Practice'}
            </button>
          </div>
        </div>
      )}
      
      {error && <ErrorMessage message={error} />}
      
      {loading && <LoadingSpinner />}
      
      {interviewStarted && !interviewCompleted && currentQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Question {currentQuestionIndex + 1} of {interviewQuestions.length}</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleCamera}
                className={`p-2 rounded-full ${cameraEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                title={cameraEnabled ? "Turn camera off" : "Turn camera on"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button 
                onClick={toggleVoice}
                className={`p-2 rounded-full ${voiceEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                title={voiceEnabled ? "Turn microphone off" : "Turn microphone on"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                {currentQuestion.type}{currentQuestion.skill ? ` · ${currentQuestion.skill}` : ''}
              </span>
            </div>
          </div>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-base text-gray-800">{currentQuestion.question}</p>
          </div>
          
          {!cameraEnabled && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800">
                Camera access is disabled. To enable camera, click the camera button above.
                {isLiveMode && recordingConsent && (
                  <span className="block mt-2">Note: You've opted for Live mode with recording consent, but camera is disabled.</span>
                )}
              </p>
              <button
                onClick={async () => {
                  const mediaStream = await requestCameraMic();
                  if (mediaStream) {
                    setStream(mediaStream);
                    setCameraEnabled(true);
                    setVoiceEnabled(true);
                    setupVoiceActivityDetection(mediaStream);
                  }
                }}
                className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 text-sm"
              >
                Retry Camera/Mic Permissions
              </button>
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700">Your Answer</label>
              {voiceEnabled && (
                <span className="text-xs text-green-600 animate-pulse">Microphone active - speak your answer</span>
              )}
            </div>
            <textarea
              id="answer"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder={voiceEnabled ? "Speak your answer or type here..." : "Type your answer here..."}
              rows={6}
              className="w-full px-3 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-400"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleAnswerSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {currentQuestionIndex < interviewQuestions.length - 1 ? 'Submit & Next' : 'Submit & Finish'}
            </button>
            
            {currentQuestionIndex < interviewQuestions.length - 1 && (
              <button
                onClick={handleSkipQuestion}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none disabled:opacity-50"
              >
                Skip Question
              </button>
            )}
          </div>
          </div>
          
          {/* Analyzer Panel */}
          <aside className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <InterviewAnalyzer 
              sessionId={analyzerSessionId} 
              questionId={currentQuestion.id} 
              answer={currentAnswer} 
            />
          </aside>
        </div>
      )}
      
      {/* Floating Camera Preview */}
      {stream && (
        <FloatingCamera 
          stream={stream} 
          onClose={() => {
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
              setStream(null);
              setCameraEnabled(false);
            }
          }}
          onMuteToggle={(muted) => {
            // Handle mute toggle if needed
          }}
        />
      )}
      
      {interviewCompleted && finalFeedback && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Interview Completed!</h2>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Overall Score: {finalFeedback.overallScore}/10</h3>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${finalFeedback.overallScore * 10}%` }}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 rounded-lg border border-green-200 bg-green-50">
              <h3 className="text-lg font-semibold mb-2 text-green-700">Strengths</h3>
              <ul className="list-disc pl-5 space-y-1">
                {finalFeedback.overallStrengths.map((strength: string, index: number) => (
                  <li key={index} className="text-gray-700">{strength}</li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
              <h3 className="text-lg font-semibold mb-2 text-amber-700">Areas for Improvement</h3>
              <ul className="list-disc pl-5 space-y-1">
                {finalFeedback.overallImprovements.map((improvement: string, index: number) => (
                  <li key={index} className="text-gray-700">{improvement}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mb-6 p-4 rounded-lg border border-blue-200 bg-blue-50">
            <h3 className="text-lg font-semibold mb-2 text-blue-700">Recommendations</h3>
            <ul className="list-disc pl-5 space-y-1">
              {finalFeedback.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="text-gray-700">{recommendation}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Question-by-Question Feedback</h3>
            {evaluations.map((evaluation, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    Score: {evaluation.score}/10
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <h5 className="font-medium text-green-700">What you did well:</h5>
                    <ul className="list-disc pl-5 mt-1">
                      {evaluation.strengths.map((strength: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700">{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-amber-700">Suggestions for improvement:</h5>
                    <ul className="list-disc pl-5 mt-1">
                      {evaluation.improvements.map((improvement: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700">{improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h5 className="font-medium text-blue-700">Better answer example:</h5>
                  <p className="text-sm mt-1 text-gray-700">{evaluation.betterAnswer}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500 focus:outline-none"
            >
              Start New Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}