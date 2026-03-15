'use client';

import React, { useState } from 'react';

interface Rubric {
  correctness: number;
  efficiency: number;
  explainability: number;
}

interface Evidence {
  keywords?: string[];
  missing_points?: string[];
  [key: string]: any;
}

interface AnalysisResult {
  score: number;
  rubric: Rubric;
  feedback: string;
  evidence?: Evidence;
}

interface InterviewAnalyzerProps {
  sessionId: string;
  questionId: string;
  answer: string;
}

export default function InterviewAnalyzer({ sessionId, questionId, answer }: InterviewAnalyzerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<{ type: string; message: string; traceId?: string; details?: any } | null>(null);
  const [reportPayload, setReportPayload] = useState<any>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const resp = await fetch(`/api/interviews/${sessionId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answer, answerType: 'text' })
      });
      
      const data = await resp.json();
      
      if (data.status === 'ok') {
        setResult(data);
      } else if (data.status === 'retryable_error') {
        setError({ 
          type: 'retryable', 
          message: data.message || 'Temporary error. Please try again.',
          traceId: data.traceId
        });
      } else {
        setError({ 
          type: 'permanent', 
          message: data.message || 'Evaluation failed.',
          traceId: data.traceId,
          details: data
        });
      }
    } catch (err: any) {
      setError({ 
        type: 'network', 
        message: 'Network error. Please retry.',
        details: {
          attemptedUrl: `/api/interviews/${sessionId}/grade`,
          clientTimestamp: new Date().toISOString(),
          answerSnippet: answer.slice(0, 500),
          error: err.message
        }
      });
      
      // Set report payload for the "Report Issue" flow
      setReportPayload({
        sessionId,
        questionId,
        attemptedUrl: `/api/interviews/${sessionId}/grade`,
        clientTimestamp: new Date().toISOString(),
        answerSnippet: answer.slice(0, 500),
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  }

  function handleReportIssue() {
    // In a real implementation, this would open a modal or send the report
    console.log('Report Issue Payload:', reportPayload);
    alert('In a real implementation, this would open a report issue modal with the diagnostic information.');
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow">
      <h3 className="text-lg font-semibold mb-2">Answer Analysis</h3>
      
      <button 
        onClick={handleAnalyze}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Analyze Answer'}
      </button>
      
      {loading && (
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-2">Analyzing your answer...</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>
            {error.type === 'network' && 'Analysis service unavailable. Please try again later or report this issue.'}
            {error.type === 'retryable' && 'Analysis temporarily unavailable — try again.'}
            {error.type === 'permanent' && `Could not evaluate answer: ${error.message}`}
          </p>
          
          {error.traceId && (
            <p className="text-sm mt-2">Error ID: {error.traceId}</p>
          )}
          
          <button 
            onClick={handleReportIssue}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white text-sm py-1 px-2 rounded"
          >
            Report Issue
          </button>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <h4 className="font-semibold">Score: {result.score}/100</h4>
          <p className="mt-2"><strong>Feedback:</strong> {result.feedback}</p>
          
          {result.evidence && (
            <div className="mt-2">
              <p><strong>Evidence:</strong></p>
              {result.evidence.keywords && (
                <p>Keywords: {result.evidence.keywords.join(', ')}</p>
              )}
              {result.evidence.missing_points && (
                <p>Missing points: {result.evidence.missing_points.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}