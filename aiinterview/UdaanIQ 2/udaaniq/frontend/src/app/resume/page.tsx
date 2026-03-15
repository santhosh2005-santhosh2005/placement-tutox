'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { FileTextIcon, UploadIcon, BarChartIcon, TargetIcon, LightbulbIcon } from 'lucide-react';

export default function ResumeAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setAnalysisResult({
        score: 78,
        strengths: [
          "Clear technical skills section with relevant keywords",
          "Good use of action verbs and quantifiable achievements",
          "Well-structured and easy to read format"
        ],
        improvements: [
          "Add more specific metrics to quantify achievements",
          "Include relevant projects to showcase hands-on experience",
          "Tailor the summary section to match the job description"
        ],
        suggestions: [
          "Add a link to your GitHub portfolio",
          "Include certifications relevant to the role",
          "Mention any leadership or teamwork experiences"
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-normal text-[#202124] dark:text-[#E8EAED]">Resume Analysis</h1>
        <p className="text-[#5F6368] dark:text-[#9AA0A6]">Upload your resume and paste a job description to get a detailed analysis.</p>
      </div>

      {!analysisResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="elevated">
            <h2 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED] mb-4">Upload Resume</h2>
            <div className="border-2 border-dashed border-[#DADCE0] dark:border-[#5F6368] rounded-lg p-8 text-center">
              <UploadIcon className="h-12 w-12 text-[#5F6368] dark:text-[#9AA0A6] mx-auto mb-4" />
              <p className="text-[#5F6368] dark:text-[#9AA0A6] mb-4">
                {file ? file.name : 'Drag and drop your resume here, or click to browse'}
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload">
                <Button variant="secondary" className="cursor-pointer">
                  Choose File
                </Button>
              </label>
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-2">
                Supported formats: PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>
          </Card>

          <Card variant="elevated">
            <h2 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED] mb-4">Job Description</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#202124] dark:text-[#E8EAED] mb-1">
                Paste the job description you're applying for
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                className="w-full bg-white dark:bg-[#1E1E1E] border border-[#DADCE0] dark:border-[#5F6368] text-[#202124] dark:text-[#E8EAED] placeholder:text-[#5F6368] dark:placeholder:text-[#9AA0A6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-[#1A73E8]"
                placeholder="Paste the job description here..."
              />
            </div>
          </Card>

          <div className="lg:col-span-2">
            <Card variant="elevated">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED]">Ready to Analyze</h2>
                  <p className="text-[#5F6368] dark:text-[#9AA0A6]">
                    {file ? 'Your resume is ready for analysis' : 'Please upload your resume to continue'}
                  </p>
                </div>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!file || !jobDescription || isAnalyzing}
                  className="whitespace-nowrap"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Resume'
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card variant="elevated">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED]">Analysis Results</h2>
                <p className="text-[#5F6368] dark:text-[#9AA0A6]">Your resume scored {analysisResult.score}/100</p>
              </div>
              <div className="flex items-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#F8F9FA"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#1A73E8"
                      strokeWidth="3"
                      strokeDasharray={`${analysisResult.score}, 100`}
                    />
                    <text x="18" y="20.5" textAnchor="middle" fill="#202124" fontSize="8" fontWeight="bold" className="dark:fill-[#E8EAED]">
                      {analysisResult.score}%
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-[#1A73E8]/5 dark:bg-[#1A73E8]/10 rounded-lg">
                <BarChartIcon className="h-6 w-6 text-[#1A73E8] dark:text-[#8AB4F8] mx-auto mb-2" />
                <p className="text-sm text-[#202124] dark:text-[#E8EAED] font-medium">Job Fit Score</p>
                <p className="text-2xl font-normal text-[#1A73E8] dark:text-[#8AB4F8]">{analysisResult.score}%</p>
              </div>
              <div className="text-center p-4 bg-[#34A853]/5 dark:bg-[#34A853]/10 rounded-lg">
                <TargetIcon className="h-6 w-6 text-[#34A853] dark:text-[#81C995] mx-auto mb-2" />
                <p className="text-sm text-[#202124] dark:text-[#E8EAED] font-medium">Matched Keywords</p>
                <p className="text-2xl font-normal text-[#34A853] dark:text-[#81C995]">24/32</p>
              </div>
              <div className="text-center p-4 bg-[#FBBC05]/5 dark:bg-[#FBBC05]/10 rounded-lg">
                <LightbulbIcon className="h-6 w-6 text-[#FBBC05] dark:text-[#FDD663] mx-auto mb-2" />
                <p className="text-sm text-[#202124] dark:text-[#E8EAED] font-medium">Improvement Areas</p>
                <p className="text-2xl font-normal text-[#FBBC05] dark:text-[#FDD663]">3</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="elevated">
              <h3 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED] mb-4">Strengths</h3>
              <ul className="space-y-3">
                {analysisResult.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 rounded-full bg-[#34A853]/10 flex items-center justify-center">
                        <svg className="w-3 h-3 text-[#34A853] dark:text-[#81C995]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                    <span className="ml-3 text-[#202124] dark:text-[#E8EAED]">{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card variant="elevated">
              <h3 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED] mb-4">Areas for Improvement</h3>
              <ul className="space-y-3">
                {analysisResult.improvements.map((improvement: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 rounded-full bg-[#FBBC05]/10 flex items-center justify-center">
                        <svg className="w-3 h-3 text-[#FBBC05] dark:text-[#FDD663]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                      </div>
                    </div>
                    <span className="ml-3 text-[#202124] dark:text-[#E8EAED]">{improvement}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card variant="elevated">
            <h3 className="text-lg font-medium text-[#202124] dark:text-[#E8EAED] mb-4">Suggestions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysisResult.suggestions.map((suggestion: string, index: number) => (
                <div key={index} className="p-4 bg-[#F8F9FA] dark:bg-[#303134] rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#1A73E8]/10 flex items-center justify-center mr-2">
                      <LightbulbIcon className="h-4 w-4 text-[#1A73E8] dark:text-[#8AB4F8]" />
                    </div>
                    <span className="font-medium text-[#202124] dark:text-[#E8EAED]">Suggestion {index + 1}</span>
                  </div>
                  <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">{suggestion}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-center">
            <Button variant="secondary" onClick={() => setAnalysisResult(null)}>
              Analyze Another Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}