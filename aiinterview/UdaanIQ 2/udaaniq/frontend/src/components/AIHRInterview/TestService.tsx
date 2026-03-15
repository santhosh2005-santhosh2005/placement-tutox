'use client';

import React, { useEffect } from 'react';
import { createAIHRInterviewSession } from '../../services/aihrInterviewService';

const TestService: React.FC = () => {
  useEffect(() => {
    const testService = async () => {
      try {
        const result = await createAIHRInterviewSession('Test Company', 'Test Role', 'Practice', 'medium');
        console.log('Service test result:', result);
      } catch (error) {
        console.error('Service test error:', error);
      }
    };
    
    testService();
  }, []);

  return (
    <div>
      <h1>Test Service Component</h1>
      <p>Check the console for service test results.</p>
    </div>
  );
};

export default TestService;