# Testing Sidebar Toggle Functionality

## Manual Testing Instructions

### Desktop Testing
1. Open the application in a desktop browser
2. Click on the UdaanIQ logo in the top app bar
3. Verify that the sidebar toggles between open and closed states
4. Check that the `aria-expanded` attribute updates correctly
5. Verify that the sidebar state is persisted in localStorage with key `udaaniQ_sidebar_open`
6. Refresh the page and confirm the sidebar state is restored
7. Test the keyboard shortcut Ctrl+B to toggle the sidebar
8. Click the close button (X) inside the sidebar to verify it closes and focuses back to the logo toggle

### Mobile Testing
1. Open the application in a mobile browser or responsive mode
2. Click the menu button to open the sidebar
3. Tap outside the sidebar area to verify it closes
4. Check that the body overflow is set to hidden when sidebar is open
5. Verify that the sidebar takes up 80vw width on mobile

### Accessibility Testing
1. Navigate to the UdaanIQ logo using keyboard Tab key
2. Press Enter or Space to toggle the sidebar
3. Verify that the `aria-expanded` attribute updates correctly
4. Check that the `aria-controls` attribute points to the sidebar

## Automated Testing (E2E with Cypress)

```javascript
describe('Sidebar Toggle', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('toggles sidebar on logo click', () => {
    cy.get('[aria-label="Toggle sidebar"]').click();
    cy.get('#sidebar').should('not.be.visible');
    
    cy.get('[aria-label="Toggle sidebar"]').click();
    cy.get('#sidebar').should('be.visible');
  });

  it('persists sidebar state in localStorage', () => {
    cy.get('[aria-label="Toggle sidebar"]').click();
    cy.window().then((win) => {
      expect(win.localStorage.getItem('udaaniQ_sidebar_open')).to.eq('false');
    });
  });

  it('supports keyboard shortcut', () => {
    cy.get('body').type('{ctrl}B');
    cy.get('#sidebar').should('not.be.visible');
  });

  it('closes sidebar when clicking outside on mobile', () => {
    cy.viewport('iphone-6');
    cy.get('[aria-label="Toggle sidebar"]').click();
    cy.get('.sidebar-backdrop').click();
    cy.get('#sidebar').should('not.be.visible');
  });
  
  it('closes sidebar when clicking close button', () => {
    cy.get('[aria-label="Toggle sidebar"]').click();
    cy.get('.sidebar-close-btn').click();
    cy.get('#sidebar').should('not.be.visible');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('udaaniQ_sidebar_open')).to.eq('false');
    });
  });
});
```

## Unit Testing (Jest + React Testing Library)

```javascript
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SidebarToggleButton from '../components/SidebarToggleButton';

// Mock the useSidebar hook
jest.mock('../components/Providers', () => ({
  useSidebar: () => ({
    toggleSidebar: jest.fn(),
  }),
}));

describe('SidebarToggleButton', () => {
  const mockSetIsSidebarOpen = jest.fn();

  beforeEach(() => {
    mockSetIsSidebarOpen.mockClear();
    localStorage.clear();
  });

  it('renders the UdaanIQ logo and text', () => {
    render(
      <SidebarToggleButton 
        isSidebarOpen={true} 
        setIsSidebarOpen={mockSetIsSidebarOpen} 
      />
    );
    
    expect(screen.getByText('UdaanIQ')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
  });

  it('toggles sidebar state when clicked', () => {
    render(
      <SidebarToggleButton 
        isSidebarOpen={false} 
        setIsSidebarOpen={mockSetIsSidebarOpen} 
      />
    );
    
    const button = screen.getByLabelText('Toggle sidebar');
    fireEvent.click(button);
    
    expect(mockSetIsSidebarOpen).toHaveBeenCalledWith(true);
  });

  it('updates localStorage when toggling', () => {
    render(
      <SidebarToggleButton 
        isSidebarOpen={true} 
        setIsSidebarOpen={mockSetIsSidebarOpen} 
      />
    );
    
    const button = screen.getByLabelText('Toggle sidebar');
    fireEvent.click(button);
    
    expect(localStorage.getItem('udaaniQ_sidebar_open')).toBe('false');
  });

  it('updates aria-expanded attribute based on state', () => {
    const { rerender } = render(
      <SidebarToggleButton 
        isSidebarOpen={false} 
        setIsSidebarOpen={mockSetIsSidebarOpen} 
      />
    );
    
    const button = screen.getByLabelText('Toggle sidebar');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    
    rerender(
      <SidebarToggleButton 
        isSidebarOpen={true} 
        setIsSidebarOpen={mockSetIsSidebarOpen} 
      />
    );
    
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
```

## Debugging Checklist

1. **Verify click handler fires**:
   - Add `console.debug("Sidebar toggled via logo", { open: !isSidebarOpen });` to the toggle function
   - Check browser console when clicking the logo

2. **Check element coverage**:
   - Use browser devtools to inspect the logo element
   - Ensure it's not covered by another element
   - Verify `pointer-events: auto` is set

3. **Verify localStorage updates**:
   - Open browser devtools Application tab
   - Check localStorage for `udaaniQ_sidebar_open` key
   - Confirm value changes on toggle

4. **Check aria attributes**:
   - Inspect the logo button element
   - Verify `aria-expanded` updates correctly
   - Confirm `aria-controls` points to sidebar

5. **Mobile overlay behavior**:
   - Test on mobile or responsive mode
   - Click outside sidebar to verify it closes
   - Check body overflow property when sidebar opens

# Testing Proctored Interview Feature

## Manual Testing Instructions

### Interview Setup
1. Navigate to the proctored interview page
2. Select a company from the dropdown (Google, Facebook, etc.)
3. Select a job role (Frontend Engineer, Backend Engineer, etc.)
4. Choose an experience level
5. Select an interview mode (Timed, Untimed, etc.)
6. Adjust the proctoring strictness slider
7. Enable/disable camera and microphone
8. Choose between practice and live mode
9. Click "Configure Interview" to generate questions

### Consent Flow
1. Review the proctoring information
2. Check that camera preview appears when enabled
3. Verify microphone test shows voice activity
4. Check background noise level indicator
5. Give consent by checking the checkbox
6. Click "Start Interview"

### Interview Flow
1. Verify the progress rail shows question index and progress
2. Check that timer counts down for timed interviews
3. Verify proctoring status indicators update correctly
4. Answer the question in the text area
5. Click "Submit & Next" to move to the next question
6. Use "Skip Question" to skip a question
7. Complete all questions to reach the final report

### Proctoring Features
1. Switch tabs during the interview to trigger focus loss detection
2. Paste content into the answer area to trigger paste event detection
3. Cover the camera to test face detection
4. Stay silent to test voice activity detection
5. Check that warnings appear based on strictness level
6. Verify proctoring events are logged

### Final Report
1. Verify overall score is displayed
2. Check that skill analysis shows breakdown by skill
3. Review strengths and areas for improvement
4. Verify proctoring summary shows incident counts
5. Check that recommendations are relevant

## Automated Testing (E2E with Cypress)

```javascript
describe('Proctored Interview', () => {
  beforeEach(() => {
    cy.visit('/proctored-interview');
  });

  it('completes interview setup flow', () => {
    // Setup step
    cy.get('#company').select('Google');
    cy.get('#jobRole').select('Frontend Engineer');
    cy.get('#experienceLevel').select('Intermediate');
    cy.get('#interviewMode').select('timed');
    cy.get('#strictness').select('medium');
    cy.get('#cameraEnabled').check();
    cy.get('#micEnabled').check();
    cy.get('#practiceMode').check();
    cy.get('button[type="submit"]').click();
    
    // Consent step
    cy.get('#consent').check();
    cy.get('button').contains('Start Interview').click();
    
    // Interview step
    cy.get('#answer').type('This is a sample answer to the interview question.');
    cy.get('button').contains('Submit & Next').click();
    
    // Final step
    cy.get('h2').contains('Interview Completed!');
  });

  it('detects proctoring events', () => {
    // Setup and start interview
    cy.get('#company').select('Google');
    cy.get('#jobRole').select('Frontend Engineer');
    cy.get('button[type="submit"]').click();
    cy.get('#consent').check();
    cy.get('button').contains('Start Interview').click();
    
    // Simulate tab switch
    cy.document().then((doc) => {
      Object.defineProperty(doc, 'hidden', { value: true, writable: true });
      doc.dispatchEvent(new Event('visibilitychange'));
    });
    
    // Check that focus loss is recorded
    cy.get('.flex.items-center').contains('Focus Losses: 1');
  });
});
```

## Unit Testing (Jest + React Testing Library)

```javascript
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import ProctoredInterview from '../app/proctored-interview/page';

// Mock API functions
jest.mock('../services/api', () => ({
  generateCompanyQuestions: jest.fn(),
  scoreAnswer: jest.fn(),
  generateProctoredReport: jest.fn(),
}));

describe('ProctoredInterview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders setup step initially', () => {
    render(<ProctoredInterview />);
    
    expect(screen.getByText('Configure Your Interview')).toBeInTheDocument();
    expect(screen.getByLabelText('Company')).toBeInTheDocument();
    expect(screen.getByLabelText('Job Role')).toBeInTheDocument();
  });

  it('advances to consent step after setup', async () => {
    const mockQuestions = [
      {
        id: 'q1',
        text: 'Sample question?',
        difficulty: 'medium',
        topics: ['javascript'],
        time: 10,
        rubric: { correctness: 0.6, efficiency: 0.2, explainability: 0.2 }
      }
    ];
    
    require('../services/api').generateCompanyQuestions.mockResolvedValue(mockQuestions);
    
    render(<ProctoredInterview />);
    
    fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'Google' } });
    fireEvent.change(screen.getByLabelText('Job Role'), { target: { value: 'Frontend Engineer' } });
    fireEvent.click(screen.getByRole('button', { name: 'Configure Interview' }));
    
    await waitFor(() => {
      expect(screen.getByText('Interview Consent')).toBeInTheDocument();
    });
  });

  it('handles proctoring events', () => {
    render(<ProctoredInterview />);
    
    // Simulate visibility change event
    const visibilityChangeEvent = new Event('visibilitychange');
    document.dispatchEvent(visibilityChangeEvent);
    
    // In a real test, we would check state changes or DOM updates
    // This is a simplified example
  });
});
```

## Debugging Checklist

1. **Verify Gemini API integration**:
   - Check that API key is properly configured in environment variables
   - Verify that questions are generated when configuring interview
   - Check browser console for API errors

2. **Check proctoring event detection**:
   - Use browser devtools to simulate visibilitychange events
   - Verify that focus loss count increases
   - Check that paste events are detected

3. **Verify camera/microphone access**:
   - Check browser permissions for camera/microphone
   - Verify that media streams are properly initialized
   - Check that video preview appears when enabled

4. **Test scoring and reporting**:
   - Verify that answers are properly submitted
   - Check that scores are generated
   - Verify that final report is displayed correctly

5. **Check UI/UX elements**:
   - Verify Material 3 design principles are followed
   - Check that color scheme matches specifications
   - Verify that animations work correctly
   - Test responsive design on different screen sizes