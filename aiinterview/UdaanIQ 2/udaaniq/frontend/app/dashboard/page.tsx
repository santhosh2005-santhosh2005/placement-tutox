'use client';

import Link from 'next/link';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  BarChartIcon, 
  FileTextIcon, 
  TargetIcon, 
  GraduationCapIcon, 
  TrophyIcon,
  CalendarIcon,
  TrendingUpIcon,
  ClockIcon
} from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-normal text-[#202124] dark:text-[#E8EAED]">Dashboard</h1>
        <p className="text-[#5F6368] dark:text-[#9AA0A6]">Welcome back! Here's what's happening with your career development.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Overall Progress" 
          value="72%" 
          change="+5% from last week" 
          icon={<TrendingUpIcon className="h-5 w-5" />} 
          color="text-[#34A853]" 
        />
        <StatCard 
          title="Active Challenges" 
          value="3" 
          change="2 coding, 1 behavioral" 
          icon={<TargetIcon className="h-5 w-5" />} 
          color="text-[#1A73E8]" 
        />
        <StatCard 
          title="Upcoming Interviews" 
          value="2" 
          change="Mock interviews scheduled" 
          icon={<CalendarIcon className="h-5 w-5" />} 
          color="text-[#FBBC05]" 
        />
        <StatCard 
          title="Learning Hours" 
          value="12h" 
          change="This week" 
          icon={<ClockIcon className="h-5 w-5" />} 
          color="text-[#EA4335]" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card variant="elevated" className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED]">Learning Path Progress</h2>
              <Button variant="secondary" size="sm">View Details</Button>
            </div>
            <div className="space-y-4">
              <ProgressItem 
                title="JavaScript Fundamentals" 
                progress={85} 
                status="Completed" 
              />
              <ProgressItem 
                title="React Development" 
                progress={60} 
                status="In Progress" 
              />
              <ProgressItem 
                title="Node.js Backend" 
                progress={30} 
                status="Not Started" 
              />
              <ProgressItem 
                title="Database Design" 
                progress={0} 
                status="Not Started" 
              />
            </div>
          </Card>
        </div>
        
        <div>
          <Card variant="elevated" className="h-full">
            <h2 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED] mb-4">Recent Achievements</h2>
            <div className="space-y-4">
              <AchievementItem 
                title="First Mock Interview Completed" 
                description="Completed your first AI mock interview with 85% score" 
                date="2 days ago" 
                icon={<TrophyIcon className="h-5 w-5" />} 
              />
              <AchievementItem 
                title="Resume Analysis" 
                description="Analyzed your resume and provided improvement suggestions" 
                date="1 week ago" 
                icon={<FileTextIcon className="h-5 w-5" />} 
              />
              <AchievementItem 
                title="Skill Assessment" 
                description="Completed JavaScript skill assessment with 92% score" 
                date="2 weeks ago" 
                icon={<GraduationCapIcon className="h-5 w-5" />} 
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated">
          <h2 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED] mb-4">Upcoming Tasks</h2>
          <div className="space-y-3">
            <TaskItem 
              title="Complete React Challenge" 
              due="Today" 
              priority="High" 
            />
            <TaskItem 
              title="Schedule Mock Interview" 
              due="Tomorrow" 
              priority="Medium" 
            />
            <TaskItem 
              title="Review Resume Feedback" 
              due="In 3 days" 
              priority="Low" 
            />
          </div>
        </Card>
        
        <Card variant="elevated">
          <h2 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED] mb-4">Recommended Resources</h2>
          <div className="space-y-3">
            <ResourceItem 
              title="Advanced React Patterns" 
              type="Article" 
              duration="8 min read" 
            />
            <ResourceItem 
              title="System Design Fundamentals" 
              type="Course" 
              duration="3 hours" 
            />
            <ResourceItem 
              title="Behavioral Interview Prep" 
              type="Guide" 
              duration="15 min read" 
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon, color }: { 
  title: string; 
  value: string; 
  change: string; 
  icon: React.ReactNode; 
  color: string; 
}) {
  return (
    <Card variant="elevated" className="flex items-center">
      <div className={`p-3 rounded-lg bg-[#F8F9FA] dark:bg-[#303134] mr-4 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">{title}</p>
        <p className="text-2xl font-normal text-[#202124] dark:text-[#E8EAED]">{value}</p>
        <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">{change}</p>
      </div>
    </Card>
  );
}

function ProgressItem({ title, progress, status }: { 
  title: string; 
  progress: number; 
  status: string; 
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-[#202124] dark:text-[#E8EAED]">{title}</span>
        <span className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">{progress}%</span>
      </div>
      <div className="w-full bg-[#F8F9FA] dark:bg-[#303134] rounded-full h-2">
        <div 
          className="bg-[#1A73E8] h-2 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-1">{status}</p>
    </div>
  );
}

function AchievementItem({ title, description, date, icon }: { 
  title: string; 
  description: string; 
  date: string; 
  icon: React.ReactNode; 
}) {
  return (
    <div className="flex">
      <div className="p-2 rounded-lg bg-[#F8F9FA] dark:bg-[#303134] text-[#1A73E8] dark:text-[#8AB4F8] mr-3">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-[#202124] dark:text-[#E8EAED]">{title}</h3>
        <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">{description}</p>
        <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">{date}</p>
      </div>
    </div>
  );
}

function TaskItem({ title, due, priority }: { 
  title: string; 
  due: string; 
  priority: string; 
}) {
  const priorityColor = {
    High: 'text-[#EA4335]',
    Medium: 'text-[#FBBC05]',
    Low: 'text-[#34A853]',
  };
  
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#F8F9FA] dark:border-[#303134] last:border-0">
      <div>
        <h3 className="font-medium text-[#202124] dark:text-[#E8EAED]">{title}</h3>
        <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">Due: {due}</p>
      </div>
      <span className={`text-xs font-medium ${priorityColor[priority as keyof typeof priorityColor]}`}>
        {priority}
      </span>
    </div>
  );
}

function ResourceItem({ title, type, duration }: { 
  title: string; 
  type: string; 
  duration: string; 
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#F8F9FA] dark:border-[#303134] last:border-0">
      <div>
        <h3 className="font-medium text-[#202124] dark:text-[#E8EAED]">{title}</h3>
        <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">{type} • {duration}</p>
      </div>
      <Button variant="secondary" size="sm">View</Button>
    </div>
  );
}