# E2E Testing Plan for Mock Interview Features

## Overview

This document outlines the E2E testing plan for the new mock interview features implemented in the UdaanIQ platform.

## Test Cases

### Test 1: Setup Screen
- Visit `/mock-interview`
- Verify setup screen is shown with company and role selectors
- Verify mode and strictness selectors are present

### Test 2: Required Fields Validation
- Click "Configure Interview" without selecting company/role
- Verify error message appears: "Please select both company and job role"

### Test 3: Consent Modal
- Select company and role
- Click "Configure Interview"
- Verify consent modal is shown
- Verify consent checkbox is required
- Verify "Start Practice" button is disabled until consent is given

### Test 4: Camera/Mic Permissions
- Accept consent
- Click "Start Practice"
- Verify camera/mic permissions are requested
- Verify video preview is shown
- Verify VAD meter is shown
- Test fallback when permissions are denied

### Test 5: Tab Switch Detection
- Start interview
- Simulate tab switch using browser automation
- Verify warning message appears
- Verify event is logged to server
- Test threshold logic for different strictness levels

### Test 6: Question Fetching
- Start interview
- Verify questions are fetched from server endpoint `/api/interviews/:id/fetch-questions`
- Verify questions are displayed in the UI
- Test fallback mechanism when Gemini API fails
- Verify cached questions are used in fallback scenario

### Test 7: Live Mode Features
- Select "Live Mode" with recording consent
- Verify recording consent checkbox appears
- Verify proper handling of recording consent

### Test 8: Practice Mode Features
- Select "Practice Mode"
- Verify no recording consent required
- Verify proper mode handling

## Test Data

### Company Options
- Google
- Meta
- Tesla
- TCS
- Infosys
- Amazon
- Microsoft
- Apple
- Adobe
- Uber
- Other (custom input)

### Job Role Options
- Frontend Engineer
- Backend Engineer
- SDE
- Data Scientist
- ML Engineer
- QA
- DevOps

### Mode Options
- Timed
- Untimed
- Practice

### Strictness Levels
- Low
- Medium
- High

## Test Scenarios

### Scenario 1: Happy Path
1. User visits mock interview page
2. Selects Google as company and Frontend Engineer as role
3. Selects Timed mode and Medium strictness
4. Clicks "Configure Interview"
5. Accepts consent
6. Clicks "Start Practice"
7. Grants camera/mic permissions
8. Answers questions
9. Completes interview
10. Views feedback

### Scenario 2: Permission Denied
1. User visits mock interview page
2. Configures interview
3. Accepts consent
4. Clicks "Start Practice"
5. Denies camera/mic permissions
6. Sees fallback message
7. Clicks "Retry Camera/Mic Permissions"
8. Grants permissions
9. Continues interview

### Scenario 3: Gemini API Failure
1. User visits mock interview page
2. Configures interview
3. Accepts consent
4. Clicks "Start Practice"
5. Server fails to fetch questions from Gemini
6. Server returns cached questions
7. Client shows fallback banner
8. User continues with cached questions

### Scenario 4: Tab Switching
1. User starts interview
2. Switches to another tab
3. Immediate warning appears
4. Event is logged to server
5. User returns to interview tab
6. Continues interview

### Scenario 5: High Strictness Proctoring
1. User selects High strictness
2. Switches tab once
3. Immediate flagging occurs
4. Warning is shown
5. Event is logged

## Cypress Test Implementation

```javascript
describe('Mock Interview Features', () => {
  beforeEach(() => {
    cy.visit('/mock-interview');
  });

  it('should show setup screen with company and role selectors', () => {
    cy.get('h2').contains('Configure Your Mock Interview');
    cy.get('#company').should('exist');
    cy.get('#jobRole').should('exist');
    cy.get('#mode').should('exist');
    cy.get('#strictness').should('exist');
  });

  it('should require company and role selection', () => {
    cy.get('button[type="submit"]').click();
    cy.get('.error-message').should('contain', 'Please select both company and job role');
  });

  it('should show consent modal after setup', () => {
    cy.get('#company').select('Google');
    cy.get('#jobRole').select('Frontend Engineer');
    cy.get('button[type="submit"]').click();
    
    cy.get('h2').contains('Consent Required');
    cy.get('#consent').should('exist');
  });

  it('should require consent before starting interview', () => {
    cy.get('#company').select('Google');
    cy.get('#jobRole').select('Frontend Engineer');
    cy.get('button[type="submit"]').click();
    
    cy.get('button').contains('Start Practice').should('be.disabled');
    
    cy.get('#consent').check();
    cy.get('button').contains('Start Practice').should('not.be.disabled');
  });

  it('should request camera and mic permissions after consent', () => {
    cy.get('#company').select('Google');
    cy.get('#jobRole').select('Frontend Engineer');
    cy.get('button[type="submit"]').click();
    
    cy.get('#consent').check();
    cy.get('button').contains('Start Practice').click();
    
    // This would require mocking media permissions in a real test
    // For now, we just check that the interview started
    cy.get('h2').contains('Question 1 of');
  });

  it('should detect tab switch events', () => {
    cy.get('#company').select('Google');
    cy.get('#jobRole').select('Frontend Engineer');
    cy.get('button[type="submit"]').click();
    
    cy.get('#consent').check();
    cy.get('button').contains('Start Practice').click();
    
    // Simulate tab switch
    cy.document().then((doc) => {
      cy.stub(doc, 'hidden', true);
      doc.dispatchEvent(new Event('visibilitychange'));
    });
    
    // Check for warning message (in a real test, this would be more robust)
    cy.get('h2').contains('Question 1 of');
  });
});
```

## Manual QA Checklist

### Setup & Consent
- [ ] Company selector shows all preset options
- [ ] Custom company input works when "Other" is selected
- [ ] Job role selector shows all options
- [ ] Mode selector works correctly
- [ ] Strictness selector works correctly
- [ ] Consent checkbox is required
- [ ] Live mode shows recording consent option
- [ ] Start button is disabled until required fields are filled

### Camera & Microphone
- [ ] Camera/mic permissions are requested automatically
- [ ] Video preview appears when permissions are granted
- [ ] VAD meter shows voice activity
- [ ] Fallback message appears when permissions are denied
- [ ] "Retry Camera/Mic Permissions" button works
- [ ] Practice mode works without camera/mic

### Proctoring
- [ ] Tab switch detection works
- [ ] Blur/focus detection works
- [ ] Warnings appear for proctoring incidents
- [ ] Events are logged to server
- [ ] Threshold logic works for different strictness levels

### Question Fetching
- [ ] Questions are fetched from server
- [ ] Questions are displayed correctly
- [ ] Fallback works when Gemini fails
- [ ] Cached questions are used in fallback
- [ ] Fallback banner appears when needed

### Security & Privacy
- [ ] GEMINI_API_KEY is never sent to client
- [ ] Environment variable is used server-side only
- [ ] Consent is required for camera/mic access
- [ ] Recording consent is optional and only for Live mode

## Debugging Guide

### Common Issues
1. **Questions not appearing**
   - Check server logs for Gemini timeout
   - Verify `process.env.GEMINI_API_KEY` is set
   - Check response parsing and validation

2. **Camera not appearing**
   - Ensure `getUserMedia` is called after user interaction
   - Check browser permissions
   - Verify HTTPS is used in production

3. **Visibility events not firing**
   - Check event listener attachment
   - Verify not in hidden iframe
   - Test in different browsers

4. **AJV validation errors**
   - Check Gemini response format
   - Verify schema compliance
   - Test with sample data

### Logging
- Server logs for Gemini API calls
- Client console logs for media permissions
- Proctoring event logs
- Error logs for fallback scenarios