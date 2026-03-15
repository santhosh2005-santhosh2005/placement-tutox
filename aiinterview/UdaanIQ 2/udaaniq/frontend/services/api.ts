const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// Auth APIs
export interface AuthUser { id: string; name: string; email: string; }
export interface AuthResponse { user: AuthUser; token: string; }

export async function apiRegister(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password })
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function apiLogout(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
  if (!res.ok) throw new Error('Logout failed');
  return res.json();
}

export async function apiMe(token?: string): Promise<{ user: AuthUser }> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/auth/me`, { headers, credentials: 'include' });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export interface ResumeAnalysisRequest {
  jobDescription: string;
}

export interface ResumeAnalysisResponse {
  total_score: number;
  breakdown: {
    skills: number;
    experience: number;
    projects: number;
    education: number;
    ats: number;
  };
  suggestions: string[];
}

// New interface for ATS scanning response
export interface ATSScanResponse {
  ats_score: number;
  analysis: {
    keywords: string;
    formatting: string;
    sections: string;
  };
  issues: string[];
  recommendations: string[];
}

export interface SkillTest {
  skill: string;
  challenge: string;
  mcqs: {
    id: string;
    q: string;
    options: string[];
    answer: string;
  }[];
  conceptual: string;
}

export interface GenerateTestsRequest {
  skills: string[];
}

export interface GenerateTestsResponse {
  tests: SkillTest[];
}

// New interface for skill gap analysis request
export interface SkillGapAnalysisRequest {
  userSkills: string[];
  targetRole: string;
}

// New interface for skill gap analysis response
export interface SkillGapAnalysisResponse {
  gap_score: number;
  existing_skills: string[];
  missing_skills: string[];
  learning_path: {
    phase: string;
    skills: string[];
    duration: string;
  }[];
  time_to_job_ready: string;
}

export interface Roadmap {
  year: string;
  focus: string[];
  to_do: string[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  [key: string]: any; // Additional properties like skill, difficulty, etc.
}

export interface InterviewQuestionsResponse {
  technical: InterviewQuestion[];
  behavioral: InterviewQuestion[];
  systemDesign: InterviewQuestion[];
  problemSolving: InterviewQuestion[];
}

export interface GenerateInterviewQuestionsRequest {
  skills: string[];
  experienceLevel?: string;
  jobRole?: string;
}

export interface MockInterviewQuestion {
  id: string;
  question: string;
  type: string;
  skill?: string;
}

export interface MockInterviewResponse {
  interview: MockInterviewQuestion[];
}

export interface EvaluateAnswerRequest {
  question: string;
  userAnswer: string;
  questionType: string;
}

export interface EvaluateAnswerResponse {
  score: number;
  strengths: string[];
  improvements: string[];
  betterAnswer: string;
}

export interface GradeAnswerRequest {
  question: string;
  userAnswer: string;
  questionType: string;
}

export interface GradeAnswerResponse {
  success: boolean;
  evaluation: EvaluateAnswerResponse;
  metadata: {
    attempts: number;
    timestamp: string;
  };
}

export interface ChatAnalysisRequestMessage { role: 'user' | 'assistant' | 'system'; content: string }
export interface ChatAnalysisResponse { feedback: string[]; score: number; tip: string }

export interface InterviewFeedbackRequest {
  answers: any[];
}

export interface InterviewFeedbackResponse {
  overallScore: number;
  overallStrengths: string[];
  overallImprovements: string[];
  recommendations: string[];
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  skill: string;
  inputFormat: string;
  outputFormat: string;
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  constraints: string[];
  hints: string[];
  tags: string[];
}

export interface GenerateCodingChallengeRequest {
  skill: string;
  difficulty?: string;
}

export interface EvaluateCodingSolutionRequest {
  challenge: CodingChallenge;
  userSolution: string;
  testCases: any[];
}

export interface EvaluateCodingSolutionResponse {
  score: number;
  timeComplexity: string;
  spaceComplexity: string;
  codeQuality: string;
  strengths: string[];
  improvements: string[];
  betterSolution: string;
}

export interface CodingPathItem {
  id: string;
  title: string;
  difficulty: string;
  concepts: string[];
  timeEstimate: string;
}

export interface GenerateCodingPathRequest {
  skill: string;
  count?: number;
}

export interface GenerateCodingPathResponse {
  path: CodingPathItem[];
}

export interface UserActivity {
  type: string;
  skill?: string;
  score?: number;
  details?: any;
}

export interface RecordActivityRequest {
  userId: string;
  activity: UserActivity;
}

export interface SkillProgress {
  skill: string;
  totalScore: number;
  activityCount: number;
  averageScore: number;
  progressHistory: {
    score: number;
    timestamp: string;
  }[];
}

export interface UserProgress {
  userId: string;
  activities: any[];
  skills: {
    [key: string]: SkillProgress;
  };
  overallProgress: number;
  lastUpdated: string;
}

export interface SkillRecommendation {
  skill: string;
  reason: string;
}

// New interface for learning path items
export interface LearningPathItem {
  id: string;
  title: string;
  description: string;
  skills: string[];
  estimatedTime: string;
  priority: string;
}

// New interface for achievements
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

// New interface for peer comparison
export interface PeerComparison {
  ranking: {
    position: number;
    totalUsers: number;
    percentile: number;
  };
  skills: {
    name: string;
    userScore: number;
    peerAverage: number;
  }[];
  activities: {
    completedChallenges: number;
    interviewsTaken: number;
    daysActive: number;
    peerAvgChallenges: number;
    peerAvgInterviews: number;
    peerAvgDays: number;
  };
}

// New interface for job matching
export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  type: string;
  description: string;
  skills: string[];
  userSkills: string[];
  matchScore: number;
  postedDays: number;
}

export interface JobMatchesRequest {
  userId: string;
  preferences: {
    location: string;
    experience: string;
    jobType: string;
  };
}

// New interfaces for community forum
export interface ForumComment {
  id: string;
  author: string;
  content: string;
  timeAgo: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  timeAgo: string;
  category: string;
  likes: number;
  comments: ForumComment[];
}

// New interfaces for GitHub integration
export interface GitHubRepository {
  id: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  languages: string[];
  isPublic: boolean;
  url: string;
}

// New interfaces for LinkedIn integration
export interface LinkedInProfile {
  name: string;
  headline: string;
  summary: string;
  profileImage: string;
  experiences: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  educations: {
    degree: string;
    institution: string;
    duration: string;
  }[];
  skills: string[];
}

// New interfaces for Stack Overflow integration
export interface StackOverflowReputation {
  reputation: number;
  badges: {
    gold: number;
    silver: number;
    bronze: number;
  };
  topTags: {
    name: string;
    score: number;
    answerCount: number;
    questionCount: number;
  }[];
  recentActivity: {
    type: string;
    title: string;
    date: string;
    reputationChange: number;
  }[];
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  type: string;
  startDate?: string;
  endDate?: string;
  link?: string;
  github?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Portfolio {
  userId: string;
  personalInfo: PersonalInfo;
  projects: Project[];
  skills: string[];
  experience: Experience[];
  education: Education[];
  lastUpdated: string;
}

export interface SavePortfolioRequest {
  userId: string;
  portfolioData: Partial<Portfolio>;
}

export interface GenerateProjectDescriptionRequest {
  project: Project;
}

export interface GenerateProjectDescriptionResponse {
  enhancedTitle: string;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface PortfolioSuggestionsRequest {
  userId: string;
}

export interface PortfolioSuggestionsResponse {
  overallScore: number;
  improvements: string[];
  sectionSuggestions: {
    projects: string;
    skills: string;
    experience: string;
  };
  recommendedProjects: {
    title: string;
    description: string;
    technologies: string[];
  }[];
}

// New interface for portfolio website generation
export interface GeneratePortfolioWebsiteRequest {
  userId: string;
}

export interface GeneratePortfolioWebsiteResponse {
  html: string;
  theme: string;
}

// New interfaces for proctored interview
export interface ProctoredQuestion {
  id: string;
  text: string;
  difficulty: string;
  topics: string[];
  time: number;
  rubric: {
    correctness: number;
    efficiency: number;
    explainability: number;
  };
}

export interface ProctoredAnswer {
  questionId: string;
  answer: string;
  timeTaken: number;
}

export interface ProctoredScore {
  totalScore: number;
  breakdown: {
    correctness: number;
    efficiency: number;
    explainability: number;
  };
  feedback: string;
  improvements: string[];
  betterAnswer: string;
}

export interface ProctoredReport {
  overallScore: number;
  skillAnalysis: {
    [key: string]: number;
  };
  proctoringSummary: {
    focusLosses: number;
    pasteEvents: number;
    faceDetectionIssues: number;
  };
  recommendations: string[];
  skillGaps: string[];
}

export interface GenerateCompanyQuestionsRequest {
  company: string;
  role: string;
  difficultyProfile?: string;
}

export interface ScoreAnswerRequest {
  question: ProctoredQuestion;
  userAnswer: string;
}

export interface GenerateReportRequest {
  questions: ProctoredQuestion[];
  answers: ProctoredAnswer[];
  proctoringData: any;
}

export interface DetectAIContentRequest {
  text: string;
}

export interface AnalyzeVoiceRequest {
  voiceActivity: boolean;
  backgroundNoise: number;
}

export interface DetectSuspiciousPasteRequest {
  pasteEvents: number;
  timeBetweenPastes: number[];
}

// Resume Analysis API
export async function analyzeResume(formData: FormData): Promise<ResumeAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze-resume`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze resume');
  }
  
  return response.json();
}

// New function for ATS scanning
export async function scanResumeForATS(formData: FormData): Promise<ATSScanResponse> {
  const response = await fetch(`${API_BASE_URL}/scan-ats`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to scan resume for ATS compatibility');
  }
  
  return response.json();
}

// Skill Testing APIs
export async function generateSkillTests(skills: string[]): Promise<GenerateTestsResponse> {
  const response = await fetch(`${API_BASE_URL}/generate-tests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ skills }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate skill tests');
  }
  
  return response.json();
}

export async function submitTestResults(results: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/submit-results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ results }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit test results');
  }
  
  return response.json();
}

// New function for skill gap analysis
export async function analyzeSkillGaps(request: SkillGapAnalysisRequest): Promise<SkillGapAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze-gaps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze skill gaps');
  }
  
  return response.json();
}

// Roadmap API
export async function getRoadmap(year: string): Promise<Roadmap> {
  const response = await fetch(`${API_BASE_URL}/roadmap/${year}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch roadmap');
  }
  
  return response.json();
}

// Interview Questions API
export async function generateInterviewQuestions(request: GenerateInterviewQuestionsRequest): Promise<InterviewQuestionsResponse> {
  const response = await fetch(`${API_BASE_URL}/generate-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate interview questions');
  }
  
  // The backend returns { questions: ... }, so we need to extract the questions property
  const data = await response.json();
  return data.questions;
}

// Mock Interview APIs
export async function generateMockInterview(request: GenerateInterviewQuestionsRequest): Promise<MockInterviewResponse> {
  const response = await fetch(`${API_BASE_URL}/generate-mock-interview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate mock interview');
  }
  
  return response.json();
}

export async function evaluateAnswer(request: EvaluateAnswerRequest): Promise<EvaluateAnswerResponse> {
  const response = await fetch(`${API_BASE_URL}/evaluate-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to evaluate answer');
  }
  
  return response.json();
}

// New robust grading function with retry logic
export async function gradeAnswer(request: GradeAnswerRequest): Promise<GradeAnswerResponse> {
  const response = await fetch(`${API_BASE_URL}/grade-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to grade answer');
  }
  
  return response.json();
}

export async function generateInterviewFeedback(request: InterviewFeedbackRequest): Promise<InterviewFeedbackResponse> {
  const response = await fetch(`${API_BASE_URL}/interview-feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate interview feedback');
  }
  
  return response.json();
}

export async function analyzeInterviewChat(messages: ChatAnalysisRequestMessage[]): Promise<ChatAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!response.ok) {
    throw new Error('Failed to analyze interview chat');
  }
  return response.json();
}

// Coding Challenge APIs
export async function generateCodingChallenge(request: GenerateCodingChallengeRequest): Promise<CodingChallenge> {
  const response = await fetch(`${API_BASE_URL}/generate-challenge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate coding challenge');
  }
  
  return response.json();
}

export async function evaluateCodingSolution(request: EvaluateCodingSolutionRequest): Promise<EvaluateCodingSolutionResponse> {
  const response = await fetch(`${API_BASE_URL}/evaluate-solution`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to evaluate coding solution');
  }
  
  return response.json();
}

export async function generateCodingPath(request: GenerateCodingPathRequest): Promise<GenerateCodingPathResponse> {
  const response = await fetch(`${API_BASE_URL}/generate-path`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate coding path');
  }
  
  return response.json();
}

// Progress Tracking APIs
export async function recordActivity(request: RecordActivityRequest): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/record-activity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to record activity');
  }
  
  return response.json();
}

export async function getUserProgress(userId: string): Promise<UserProgress> {
  const response = await fetch(`${API_BASE_URL}/progress/${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get user progress');
  }
  
  return response.json();
}

export async function getSkillRecommendations(userId: string): Promise<SkillRecommendation[]> {
  const response = await fetch(`${API_BASE_URL}/recommendations/${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get skill recommendations');
  }
  
  return response.json();
}

// New function for personalized learning path
export async function getPersonalizedLearningPath(userId: string): Promise<LearningPathItem[]> {
  const response = await fetch(`${API_BASE_URL}/learning-path/${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get personalized learning path');
  }
  
  return response.json();
}

// New function for user achievements
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  const response = await fetch(`${API_BASE_URL}/achievements/${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get user achievements');
  }
  
  return response.json();
}

// Portfolio APIs
export async function savePortfolio(request: SavePortfolioRequest): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/portfolio/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to save portfolio');
  }
  
  return response.json();
}

export async function getPortfolio(userId: string): Promise<Portfolio> {
  const response = await fetch(`${API_BASE_URL}/portfolio/${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get portfolio');
  }
  
  return response.json();
}

export async function generateProjectDescription(request: GenerateProjectDescriptionRequest): Promise<GenerateProjectDescriptionResponse> {
  const response = await fetch(`${API_BASE_URL}/portfolio/generate-description`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate project description');
  }
  
  return response.json();
}

export async function generatePortfolioSuggestions(request: PortfolioSuggestionsRequest): Promise<PortfolioSuggestionsResponse> {
  const response = await fetch(`${API_BASE_URL}/portfolio/suggestions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate portfolio suggestions');
  }
  
  return response.json();
}

// New function for portfolio website generation
export async function generatePortfolioWebsite(request: GeneratePortfolioWebsiteRequest): Promise<GeneratePortfolioWebsiteResponse> {
  const response = await fetch(`${API_BASE_URL}/portfolio/generate-website`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate portfolio website');
  }
  
  return response.json();
}

export async function exportPortfolio(userId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/portfolio/export/${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to export portfolio');
  }
  
  return response.json();
}

// New function for peer comparison
export async function getPeerComparison(userId: string): Promise<PeerComparison> {
  // In a real implementation, this would call an actual API
  // For now, we'll return mock data
  return {
    ranking: {
      position: Math.floor(Math.random() * 100) + 1,
      totalUsers: 500,
      percentile: Math.floor(Math.random() * 100)
    },
    skills: [
      { name: 'JavaScript', userScore: 8.5, peerAverage: 7.2 },
      { name: 'React', userScore: 7.8, peerAverage: 6.9 },
      { name: 'Node.js', userScore: 6.9, peerAverage: 7.5 },
      { name: 'Python', userScore: 9.2, peerAverage: 8.1 }
    ],
    activities: {
      completedChallenges: 24,
      interviewsTaken: 5,
      daysActive: 42,
      peerAvgChallenges: 18,
      peerAvgInterviews: 3,
      peerAvgDays: 35
    }
  };
}

// New function for job matching
export async function getJobMatches(userId: string, preferences: any): Promise<JobMatch[]> {
  // In a real implementation, this would call an actual API
  // For now, we'll return mock data
  return [
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: preferences.location,
      experience: preferences.experience,
      type: preferences.jobType,
      description: 'We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user interfaces using React and modern web technologies.',
      skills: ['JavaScript', 'React', 'CSS', 'HTML'],
      userSkills: ['JavaScript', 'React'],
      matchScore: 85,
      postedDays: 3
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'InnovateX',
      location: preferences.location,
      experience: preferences.experience,
      type: preferences.jobType,
      description: 'Join our dynamic team as a Full Stack Engineer. You will work on both frontend and backend technologies to build scalable web applications.',
      skills: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'Express'],
      userSkills: ['JavaScript', 'Node.js', 'React'],
      matchScore: 78,
      postedDays: 5
    },
    {
      id: '3',
      title: 'Software Engineer',
      company: 'DataSystems',
      location: preferences.location,
      experience: preferences.experience,
      type: preferences.jobType,
      description: 'Exciting opportunity for a Software Engineer to work on cutting-edge data processing systems and machine learning applications.',
      skills: ['Python', 'Java', 'SQL', 'Machine Learning'],
      userSkills: ['Python'],
      matchScore: 62,
      postedDays: 7
    }
  ];
}

// New functions for community forum
export async function getForumPosts(): Promise<ForumPost[]> {
  // In a real implementation, this would call an actual API
  // For now, we'll return mock data
  return [
    {
      id: '1',
      title: 'Best resources for learning React hooks?',
      content: 'I\'m trying to get better at using React hooks, especially useEffect and useContext. What are your favorite resources or tutorials?',
      author: 'Alex Johnson',
      timeAgo: '2 hours ago',
      category: 'React',
      likes: 12,
      comments: [
        {
          id: 'c1',
          author: 'Sarah Chen',
          content: 'I highly recommend the official React documentation! It has great examples for all hooks.',
          timeAgo: '1 hour ago'
        },
        {
          id: 'c2',
          author: 'Mike Rodriguez',
          content: 'Also check out "React Hooks in Action" by John Larsen. Great book with practical examples.',
          timeAgo: '45 minutes ago'
        }
      ]
    },
    {
      id: '2',
      title: 'How to prepare for system design interviews?',
      content: 'I have an upcoming interview that includes a system design round. Any tips on how to approach this and what to focus on?',
      author: 'Priya Sharma',
      timeAgo: '5 hours ago',
      category: 'Interviews',
      likes: 8,
      comments: [
        {
          id: 'c3',
          author: 'David Kim',
          content: 'Start with "Designing Data-Intensive Applications" by Martin Kleppmann. It\'s a must-read.',
          timeAgo: '3 hours ago'
        }
      ]
    },
    {
      id: '3',
      title: 'Career advice: Switching from QA to Development',
      content: 'I\'ve been working in QA for 2 years and want to transition to development. What steps should I take?',
      author: 'James Wilson',
      timeAgo: '1 day ago',
      category: 'Career',
      likes: 15,
      comments: [
        {
          id: 'c4',
          author: 'Emma Thompson',
          content: 'Start by building projects on your own. Contribute to open source if possible. Consider a bootcamp if you need structure.',
          timeAgo: '20 hours ago'
        },
        {
          id: 'c5',
          author: 'Robert Garcia',
          content: 'Leverage your QA experience! Your testing knowledge will be valuable in development.',
          timeAgo: '18 hours ago'
        }
      ]
    }
  ];
}

export async function createForumPost(userId: string, title: string, content: string): Promise<ForumPost> {
  // In a real implementation, this would call an actual API
  // For now, we'll return mock data
  return {
    id: 'new-' + Date.now(),
    title,
    content,
    author: 'Current User',
    timeAgo: 'Just now',
    category: 'General',
    likes: 0,
    comments: []
  };
}

export async function addComment(postId: string, userId: string, content: string): Promise<ForumPost> {
  // In a real implementation, this would call an actual API
  // For now, we'll return mock data
  return {
    id: postId,
    title: 'Post Title',
    content: 'Post content',
    author: 'Post Author',
    timeAgo: '2 hours ago',
    category: 'General',
    likes: 5,
    comments: [
      {
        id: 'new-' + Date.now(),
        author: 'Current User',
        content,
        timeAgo: 'Just now'
      }
    ]
  };
}

// New functions for GitHub integration
export async function connectGitHub(username: string): Promise<{ success: boolean }> {
  // In a real implementation, this would connect to GitHub API
  // For now, we'll return mock data
  return { success: true };
}

export async function getGitHubRepositories(username: string): Promise<GitHubRepository[]> {
  // In a real implementation, this would call GitHub API
  // For now, we'll return mock data
  return [
    {
      id: '1',
      name: 'portfolio-website',
      description: 'A responsive portfolio website built with React and Tailwind CSS',
      stars: 15,
      forks: 3,
      languages: ['JavaScript', 'HTML', 'CSS'],
      isPublic: true,
      url: `https://github.com/${username}/portfolio-website`
    },
    {
      id: '2',
      name: 'task-manager-api',
      description: 'RESTful API for a task management application built with Node.js and Express',
      stars: 8,
      forks: 2,
      languages: ['JavaScript', 'Node.js', 'MongoDB'],
      isPublic: true,
      url: `https://github.com/${username}/task-manager-api`
    },
    {
      id: '3',
      name: 'machine-learning-projects',
      description: 'Collection of machine learning projects implemented in Python',
      stars: 22,
      forks: 7,
      languages: ['Python', 'Jupyter Notebook', 'Pandas'],
      isPublic: true,
      url: `https://github.com/${username}/machine-learning-projects`
    }
  ];
}

// New functions for LinkedIn integration
export async function connectLinkedIn(profileUrl: string): Promise<{ success: boolean }> {
  // In a real implementation, this would connect to LinkedIn API
  // For now, we'll return mock data
  return { success: true };
}

export async function getLinkedInProfile(profileUrl: string): Promise<LinkedInProfile> {
  // In a real implementation, this would call LinkedIn API
  // For now, we'll return mock data
  return {
    name: 'Alex Johnson',
    headline: 'Senior Software Engineer at TechCorp',
    summary: 'Passionate software engineer with 5+ years of experience in full-stack development. Specialized in React, Node.js, and cloud technologies.',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    experiences: [
      {
        title: 'Senior Software Engineer',
        company: 'TechCorp',
        duration: '2022 - Present',
        description: 'Leading frontend development for enterprise SaaS platform. Mentoring junior developers and implementing CI/CD pipelines.'
      },
      {
        title: 'Software Engineer',
        company: 'StartupXYZ',
        duration: '2020 - 2022',
        description: 'Developed and maintained multiple web applications using React and Node.js. Improved application performance by 40%.'
      }
    ],
    educations: [
      {
        degree: 'B.S. Computer Science',
        institution: 'University of Technology',
        duration: '2016 - 2020'
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'CI/CD']
  };
}

// New functions for Stack Overflow integration
export async function connectStackOverflow(userId: string): Promise<{ success: boolean }> {
  // In a real implementation, this would connect to Stack Overflow API
  // For now, we'll return mock data
  return { success: true };
}

export async function getStackOverflowReputation(userId: string): Promise<StackOverflowReputation> {
  // In a real implementation, this would call Stack Overflow API
  // For now, we'll return mock data
  return {
    reputation: 2450,
    badges: {
      gold: 3,
      silver: 15,
      bronze: 32
    },
    topTags: [
      {
        name: 'javascript',
        score: 850,
        answerCount: 42,
        questionCount: 18
      },
      {
        name: 'reactjs',
        score: 620,
        answerCount: 28,
        questionCount: 12
      },
      {
        name: 'node.js',
        score: 480,
        answerCount: 22,
        questionCount: 9
      },
      {
        name: 'python',
        score: 320,
        answerCount: 15,
        questionCount: 7
      }
    ],
    recentActivity: [
      {
        type: 'answer',
        title: 'How to optimize React component rendering',
        date: '2 days ago',
        reputationChange: 25
      },
      {
        type: 'question',
        title: 'Best practices for Node.js error handling',
        date: '1 week ago',
        reputationChange: 15
      },
      {
        type: 'answer',
        title: 'Understanding JavaScript closures',
        date: '2 weeks ago',
        reputationChange: 30
      }
    ]
  };
}

// New functions for proctored interview
export async function generateCompanyQuestions(request: GenerateCompanyQuestionsRequest): Promise<ProctoredQuestion[]> {
  const response = await fetch(`${API_BASE_URL}/generate-company-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate company questions');
  }
  
  return response.json();
}

export async function scoreAnswer(request: ScoreAnswerRequest): Promise<ProctoredScore> {
  const response = await fetch(`${API_BASE_URL}/score-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to score answer');
  }
  
  return response.json();
}

export async function generateProctoredReport(request: GenerateReportRequest): Promise<ProctoredReport> {
  const response = await fetch(`${API_BASE_URL}/generate-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate report');
  }
  
  return response.json();
}

export async function detectAIContent(request: DetectAIContentRequest): Promise<{ isAI: boolean }> {
  const response = await fetch(`${API_BASE_URL}/detect-ai-content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to detect AI content');
  }
  
  return response.json();
}

export async function analyzeVoice(request: AnalyzeVoiceRequest): Promise<{ suspicious: boolean; reason: string }> {
  const response = await fetch(`${API_BASE_URL}/analyze-voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze voice');
  }
  
  return response.json();
}

export async function detectSuspiciousPaste(request: DetectSuspiciousPasteRequest): Promise<{ suspicious: boolean; reason: string }> {
  const response = await fetch(`${API_BASE_URL}/detect-suspicious-paste`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to detect suspicious paste');
  }
  
  return response.json();
}
