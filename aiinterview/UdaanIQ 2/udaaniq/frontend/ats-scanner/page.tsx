'use client';

import React, { useState } from 'react';
import { scanResumeForATS, ATSScanResponse } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

export default function ATSScanner() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [atsResult, setAtsResult] = useState<ATSScanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      setAtsResult(null);
      setError(null);
    }
  };

  const handleScanResume = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeFile) {
      setError('Please select a resume file to scan.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      const result = await scanResumeForATS(formData);
      setAtsResult(result);
    } catch (err) {
      setError('Failed to scan resume for ATS compatibility. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">ATS Resume Scanner</h1>
      <p className="text-gray-600 text-center mb-8">
        Check how well your resume performs against Applicant Tracking Systems (ATS)
      </p>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Upload Your Resume</h2>
        <form onSubmit={handleScanResume} className="space-y-4">
          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
              Resume File (PDF or DOCX)
            </label>
            <input
              type="file"
              id="resume"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: PDF, DOCX
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Scanning Resume...' : 'Scan for ATS Compatibility'}
          </button>
        </form>
      </div>
      
      {error && <ErrorMessage message={error} />}
      
      {loading && <LoadingSpinner />}
      
      {atsResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">ATS Compatibility Report</h2>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-blue-800">Overall ATS Score</h3>
              <span className="text-2xl font-bold text-blue-600">{atsResult.ats_score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full" 
                style={{ width: `${atsResult.ats_score}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {atsResult.ats_score >= 80 
                ? 'Excellent! Your resume is highly compatible with most ATS systems.' 
                : atsResult.ats_score >= 60 
                  ? 'Good, but there are some improvements you can make for better ATS compatibility.' 
                  : 'Your resume may face challenges with ATS systems. Consider making the suggested improvements.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Keywords</h3>
              <p className="text-sm text-gray-600">{atsResult.analysis.keywords}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Formatting</h3>
              <p className="text-sm text-gray-600">{atsResult.analysis.formatting}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Sections</h3>
              <p className="text-sm text-gray-600">{atsResult.analysis.sections}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Potential Issues</h3>
            <ul className="list-disc pl-5 space-y-2">
              {atsResult.issues.map((issue, index) => (
                <li key={index} className="text-gray-700">{issue}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Recommendations</h3>
            <ul className="list-disc pl-5 space-y-2">
              {atsResult.recommendations.map((recommendation, index) => (
                <li key={index} className="text-gray-700">{recommendation}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {!atsResult && !loading && !error && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-xl font-semibold mb-2">Ready to Scan Your Resume?</h2>
          <p className="text-gray-600">
            Upload your resume to get an instant analysis of its compatibility with Applicant Tracking Systems.
          </p>
        </div>
      )}
    </div>
  );
}