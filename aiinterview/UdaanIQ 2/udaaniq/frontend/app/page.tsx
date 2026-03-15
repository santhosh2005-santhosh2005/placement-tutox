'use client';

import Link from 'next/link';
import { 
  FileTextIcon, 
  LaptopIcon, 
  MapIcon, 
  MessageCircleIcon, 
  RocketIcon, 
  UsersIcon, 
  BriefcaseIcon,
  CodeIcon,
  GitBranchIcon,
  ScanIcon,
  BarChartIcon,
  MessageSquareIcon,
  HelpCircleIcon
} from 'lucide-react';

export default function Home() {
  return (
    <div className="py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm dark:bg-blue-900/30 dark:text-blue-300">
          AI Career Platform
        </div>
        <h1 className="text-3xl md:text-4xl font-normal text-[#202124] dark:text-[#E8EAED] mt-4">
          Elevate your career with an AI interview and skill coach
        </h1>
        <p className="mt-3 text-lg text-[#5F6368] dark:text-[#9AA0A6] max-w-2xl">
          Analyze your resume, practice real interviews with AI feedback, and follow a data‑backed roadmap to land your first job.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link href="/resume" className="btn-gradient inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium">
            Analyze my resume
          </Link>
          <Link href="/mock-interview" className="btn-secondary inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium">
            Start mock interview
          </Link>
          <a href="http://localhost:5001" target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
            Open TutoX Assistant
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard 
          title="TutoX AI Tutor" 
          description="Multimodal learning assistant with RAG (PDF support) and web-agent capabilities." 
          icon={<HelpCircleIcon className="h-6 w-6" />}
          href="http://localhost:5001"
          external={true}
        />
        <DashboardCard 
          title="Resume Analysis" 
          description="Get a detailed Job Fit Score with actionable suggestions to improve your resume." 
          icon={<FileTextIcon className="h-6 w-6" />}
          href="/resume"
        />
        <DashboardCard 
          title="Skill Testing" 
          description="AI-generated challenges to test and improve your technical skills." 
          icon={<LaptopIcon className="h-6 w-6" />}
          href="/skills"
        />
        <DashboardCard 
          title="Career Roadmap" 
          description="Year-wise engineering roadmap tailored to your branch and goals." 
          icon={<MapIcon className="h-6 w-6" />}
          href="/roadmap"
        />
        <DashboardCard 
          title="AI Feedback" 
          description="Encouraging, personalized feedback to keep you motivated." 
          icon={<MessageCircleIcon className="h-6 w-6" />}
          href="/feedback"
        />
        <DashboardCard 
          title="Learning Path" 
          description="AI-powered personalized learning path to advance your career systematically." 
          icon={<RocketIcon className="h-6 w-6" />}
          href="/learning-path"
        />
        <DashboardCard 
          title="Peer Comparison" 
          description="See how you rank against other users and identify improvement areas." 
          icon={<UsersIcon className="h-6 w-6" />}
          href="/peer-comparison"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card-elevated lg:col-span-2">
          <h2 className="text-2xl font-normal text-[#202124] dark:text-[#E8EAED] mb-4">API Integrations</h2>
          <p className="text-[#5F6368] dark:text-[#9AA0A6] mb-4">
            Enhance your profile with real data from GitHub, LinkedIn, and Stack Overflow.
          </p>
          <Link href="/api-features" className="btn-primary inline-flex items-center">
            Explore API Features
          </Link>
        </div>
        
        <div className="card-elevated">
          <h2 className="text-2xl font-normal text-[#202124] dark:text-[#E8EAED] mb-4">Community Forum</h2>
          <p className="text-[#5F6368] dark:text-[#9AA0A6] mb-4">
            Connect with peers, ask questions, and share knowledge in our community forum.
          </p>
          <Link href="/community" className="btn-primary inline-flex items-center">
            Join Community
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <FeatureCard 
          title="Practice Interviews" 
          description="Hone your interview skills with our AI-powered mock interview platform. Get real-time feedback and detailed evaluation of your performance." 
          icon={<BriefcaseIcon className="h-6 w-6" />}
          href="/mock-interview"
        />
        <FeatureCard 
          title="Coding Challenges" 
          description="Sharpen your coding skills with challenges tailored to your skill level. Get detailed feedback on your solutions and learn optimal approaches." 
          icon={<CodeIcon className="h-6 w-6" />}
          href="/coding-challenges"
        />
        <FeatureCard 
          title="ATS Scanner" 
          description="Check how well your resume performs against Applicant Tracking Systems. Get actionable insights to improve your resume's chances of passing automated screening." 
          icon={<ScanIcon className="h-6 w-6" />}
          href="/ats-scanner"
        />
      </div>
      
      <div className="card-elevated">
        <h2 className="text-2xl font-normal text-center text-[#202124] dark:text-[#E8EAED] mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Step 
            number="1" 
            title="Upload Resume" 
            description="Upload your resume and paste a job description to get started." 
          />
          <Step 
            number="2" 
            title="Get Analysis" 
            description="Receive your Job Fit Score with detailed breakdown and suggestions." 
          />
          <Step 
            number="3" 
            title="Improve & Grow" 
            description="Follow personalized recommendations to enhance your career prospects." 
          />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, description, icon, href, external }: { title: string; description: string; icon: React.ReactNode; href: string; external?: boolean }) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="card hover:shadow-md transition-all duration-200 hover:-translate-y-1">
        <div className="flex items-start">
          <div className="p-2 bg-[#1A73E8]/10 text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8] rounded-lg mr-4">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED] mb-1">{title}</h3>
            <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">{description}</p>
          </div>
        </div>
      </a>
    );
  }
  return (
    <Link href={href} className="card hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <div className="flex items-start">
        <div className="p-2 bg-[#1A73E8]/10 text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8] rounded-lg mr-4">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED] mb-1">{title}</h3>
          <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({ title, description, icon, href }: { title: string; description: string; icon: React.ReactNode; href: string }) {
  return (
    <div className="card-elevated">
      <div className="flex items-start mb-4">
        <div className="p-2 bg-[#34A853]/10 text-[#34A853] dark:bg-[#34A853]/20 dark:text-[#81C995] rounded-lg mr-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED]">{title}</h3>
      </div>
      <p className="text-[#5F6368] dark:text-[#9AA0A6] mb-4">{description}</p>
      <Link href={href} className="btn-secondary inline-flex items-center text-sm">
        Learn more
      </Link>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-[#1A73E8] text-white rounded-full flex items-center justify-center text-lg font-medium mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED] mb-2">{title}</h3>
      <p className="text-[#5F6368] dark:text-[#9AA0A6] text-sm">{description}</p>
    </div>
  );
}