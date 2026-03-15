// Simple test to verify FloatingCamera component renders without errors
import React from 'react';
import { createRoot } from 'react-dom/client';
import FloatingCamera from './FloatingCamera';

// Mock the safelyAttachStream utility
jest.mock('../utils/floatingCameraUtils', () => ({
  safelyAttachStream: jest.fn()
}));

describe('FloatingCamera', () => {
  it('renders without crashing', () => {
    // Create a mock MediaStream
    const mockStream = new MediaStream();
    
    // Create a div to render the component
    const div = document.createElement('div');
    
    // Create a root and render the component
    const root = createRoot(div);
    root.render(<FloatingCamera stream={mockStream} onClose={() => {}} onMuteToggle={() => {}} />);
    
    // Clean up
    root.unmount();
  });
});