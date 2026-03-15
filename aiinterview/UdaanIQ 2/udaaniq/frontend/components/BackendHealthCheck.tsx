'use client';

import React, { useEffect, useState } from 'react';

const BackendHealthCheck: React.FC = () => {
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Use relative path for same-origin requests
        const response = await fetch('/api/health');
        setIsBackendHealthy(response.ok);
      } catch (error) {
        console.error('Health check failed:', error);
        setIsBackendHealthy(false);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  if (loading) {
    return (
      <div className="p-2 bg-yellow-100 text-yellow-800 text-sm rounded">
        Checking backend health...
      </div>
    );
  }

  if (isBackendHealthy === false) {
    return (
      <div className="p-2 bg-red-100 text-red-800 text-sm rounded">
        Warning: Backend server appears to be unreachable. Please ensure the backend is running.
      </div>
    );
  }

  return null;
};

export default BackendHealthCheck;