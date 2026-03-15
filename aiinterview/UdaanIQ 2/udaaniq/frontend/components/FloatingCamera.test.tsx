// FloatingCamera.test.tsx
import { render, screen } from '@testing-library/react';
import FloatingCamera from './FloatingCamera';

// Mock the safelyAttachStream utility
jest.mock('../utils/floatingCameraUtils', () => ({
  safelyAttachStream: jest.fn()
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

test('renders camera container when stream provided', () => {
  const fakeStream = new MediaStream(); // minimal stub
  render(<FloatingCamera stream={fakeStream} onClose={()=>{}} onMuteToggle={()=>{}} />);
  expect(screen.getByRole('dialog', { name: /camera preview/i })).toBeInTheDocument();
});

test('does not render when no stream provided', () => {
  const { container } = render(<FloatingCamera stream={null} onClose={()=>{}} onMuteToggle={()=>{}} />);
  expect(container.firstChild).toBeNull();
});