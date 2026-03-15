# Changelog

## [Unreleased]

### Added
- Interview page with parity to Mock Interview experience but without Analyzer panel
- New endpoint POST /api/interviews/:id/next for question navigation
- Session-based question persistence to prevent repetition
- Floating camera preview with draggable functionality
- Proctoring telemetry collection (visibility, blur/focus, paste detection)
- Privacy consent flow for Live mode with recording options
- Unit tests for interview session endpoints
- E2E tests for interview flow

### Changed
- Enhanced interview session management with server-side question storage
- Improved error handling with fallback to cached questions
- Updated UI to match Mock Interview experience
- Added strictness levels for proctoring (Low/Medium/High)

### Fixed
- Camera/mic permission handling with graceful fallbacks
- Proctoring event buffering and retry logic
- Question rotation to prevent duplicates within sessions

## [1.0.0] - 2025-10-21

### Added
- Initial release of UdaanIQ platform
- Mock interview functionality
- Resume analysis tools
- Skill assessment features
- Career roadmap generation
- Portfolio builder
- Community forum
- Job matching system
- Proctored interview simulation

### Changed
- Updated UI/UX for better user experience
- Improved performance and responsiveness
- Enhanced security measures

### Fixed
- Various bug fixes and stability improvements

## [TypeError: Failed to fetch Fix] - 2025-10-19

### Fixed Interview Session Creation
- Fixed hardcoded API URL that was causing "TypeError: Failed to fetch" errors
- Implemented relative path URLs for same-origin requests
- Added retry logic with exponential backoff for network requests
- Improved error handling with user-friendly messages
- Added health check endpoint to verify backend availability
- Created BackendHealthCheck component to warn users when backend is unreachable

### Technical Improvements
- Updated interview session service to use environment variables for API base URL
- Added comprehensive error handling for network failures
- Implemented fetch retry mechanism for transient network errors
- Added server-side logging for debugging purposes

## [Interview Duration Feature Addition] - 2025-10-19

### Enhanced Interview Configuration
- Added duration selection options (30 minutes, 1 hour, 1.5 hours, 2 hours) for timed interviews
- Implemented duration selector in both mock interview and proctored interview setups
- Updated UI to show duration options only when Timed mode is selected
- Enhanced interview planning with customizable time allocations

## [Mock Interview Feature Enhancement] - 2025-10-19

### Enhanced Mock Interview Flow
- Implemented company selector with preset list (Google, Meta, Tesla, TCS, Infosys, Amazon, Microsoft, Apple, Adobe, Uber) and custom input
- Added job role selector with technical roles (Frontend Engineer, Backend Engineer, SDE, Data Scientist, ML Engineer, QA, DevOps)
- Created consent modal that must be accepted to enable camera/mic preview
- Implemented automatic camera and microphone preview after consent
- Added robust tab-switch and focus-loss detection with immediate on-screen warning and server logging
- Integrated server-side Gemini question fetch using environment variable (GEMINI_API_KEY) with JSON schema validation (AJV)
- Implemented cached fallback mechanism when Gemini API fails
- Added mode selection (Timed/Untimed/Practice) and strictness levels (Low/Medium/High)
- Created Live mode with optional recording consent

### Proctoring Features
- Implemented Page Visibility API detection for tab-switch monitoring
- Added window blur/focus event handlers for focus loss detection
- Created batch logging of proctoring events to server every 5-10 seconds
- Implemented threshold logic per strictness level:
  - Low: 3 violations → flag
  - Medium: 2 violations → flag
  - High: 1 violation → flag
- Added immediate UI warnings for proctoring incidents

### Security & Privacy
- Ensured GEMINI_API_KEY is never exposed to frontend (server-side only)
- Implemented proper consent flow for camera/mic access
- Added optional recording consent for Live mode
- Created secure session management with ephemeral tokens

### UI/UX Improvements
- Added voice activity detection (VAD) meter using WebAudio API
- Implemented fallback UI when camera/mic permissions are denied
- Added actionable messages with retry options
- Created responsive design for all device sizes
- Added proper error handling with user-friendly messages

### Technical Implementation
- Created new API endpoints:
  - POST /api/interviews/create - Create interview session
  - POST /api/interviews/:id/fetch-questions - Fetch company/role-specific questions from Gemini
  - POST /api/interviews/:id/logs - Log proctoring events
- Implemented AJV schema validation for Gemini responses
- Added comprehensive error handling and fallback mechanisms
- Created reusable services and utilities for media handling

## [Proctored Interview Feature Implementation] - 2025-10-19

### Proctored Interview Feature
- Implemented realistic, proctored interview experience with Google-Developer–grade UI/UX
- Integrated with Google's Gemini API for company-specific question generation
- Added comprehensive proctoring features:
  - Tab switch detection using Page Visibility API
  - Camera monitoring with face presence detection
  - Microphone monitoring with voice activity detection
  - Paste event tracking
  - AI-generated content detection
- Implemented real-time scoring and skill-based reporting
- Added consent/privacy flows with explicit candidate agreement
- Created polished UI/UX with Material 3 design principles
- Implemented dark mode support with smooth transitions
- Added animated skeletons for loading states
- Integrated with Framer Motion for smooth micro-animations

### Interview Setup
- Added onboarding modal explaining proctoring and recordings
- Implemented video preview and mic test functionality
- Created company selection (Google, Facebook, Tesla, etc.)
- Added job role selection (Frontend Engineer, Backend Engineer, etc.)
- Implemented experience level configuration
- Added interview mode options (Timed, Untimed, Behavioral, System Design)
- Created proctoring strictness slider (Low/Medium/High)
- Added camera/mic recording enable/disable options
- Implemented practice vs. live mode selection

### Question Generation
- Integrated with Gemini API for real-time question fetching
- Created dynamic question generation based on selected company and job role
- Implemented fallback to cached questions when API is unavailable
- Added question validation and sanitization

### Interview Flow
- Designed left-side compact progress rail with question index and time remaining
- Implemented proctoring status indicators (green/yellow/red)
- Created question card display with code editor/workspace
- Added timer functionality for timed interviews
- Implemented hint toggle and answer recording features

### Scoring & Reporting
- Integrated with Gemini API for automatic answer scoring
- Created skill-based analysis with radar chart visualization
- Implemented proctoring incident summary
- Added personalized recommendations
- Created skill gap analysis with learning paths

### Admin Features
- Added proctoring strictness configuration
- Implemented retention period settings
- Created session replay with synchronized events
- Added analytics for candidate trends and failing topics

### Security & Privacy
- Implemented encryption for all recordings at rest (AES-256)
- Added transport security over TLS
- Created role-based access control for recorded content
- Added audit logs for admin access
- Implemented data anonymization options for analytics
- Created privacy page explaining data collection and retention

### Fallbacks & Graceful Degradation
- Added practice mode with reduced features when camera/mic denied
- Implemented fallback to cached questions when API unavailable
- Added low-bandwidth mode degrading video quality

## [Final Google Developer Console Style Implementation] - 2025-10-19

### Robust Sidebar Toggle Fix
- Implemented reliable sidebar toggle when clicking UdaanIQ logo/title (Google Cloud Console style)
- Added debounced toggle functionality to prevent double-firing
- Created dedicated SidebarToggleButton component with proper accessibility attributes
- Added keyboard shortcut support (Ctrl/Cmd+B) for sidebar toggle
- Implemented proper localStorage persistence with key `udaaniQ_sidebar_open`
- Added mobile overlay behavior with backdrop click to close
- Improved z-index management and layout clipping fixes
- Added comprehensive testing documentation and examples

### Sidebar Close Button
- Added visible close button inside the left navigation sidebar
- Implemented proper accessibility attributes (aria-controls, aria-label)
- Added smooth Framer Motion animations for button appearance and sidebar collapse
- Added focus management to return focus to logo toggle after closing
- Implemented debouncing to prevent multiple clicks during animation
- Added proper localStorage persistence when closing via button
- Enhanced mobile overlay behavior with backdrop click to close

### Theme System
- Implemented comprehensive theme system using CSS variables
- Added proper light/dark theme switching with localStorage persistence
- Fixed background gradients for both light and dark themes
- Added subtle animated noise overlay for depth
- Ensured all components reference theme variables correctly

### Sidebar Behavior
- Implemented smooth Framer Motion animations for sidebar width transition (180ms spring physics)
- Added icon/label fade animations when expanding/collapsing
- Added keyboard shortcut (Ctrl+B) for manual sidebar toggle
- Improved z-index management to prevent visual bugs
- Added visible close button inside sidebar for additional closing option

### Top App Bar
- Enhanced theme toggle with animated sun/moon morph using Framer Motion
- Improved search bar styling and behavior
- Fixed logo click to toggle sidebar open/close

### Footer Redesign
- Updated footer to Material 3 specifications
- Added proper padding, border-radius, and elevation
- Included UdaanIQ logo and copyright information
- Maintained responsive layout for mobile devices

### UI/UX Polish
- Fixed inconsistent surfaces (sidebar, content, footer)
- Ensured proper text colors and contrasts for accessibility
- Added micro-interactions and motion for enhanced user experience
- Improved card designs with hover effects and proper shadows
- Fixed layout clipping and scrollbar issues

### Technical Improvements
- Implemented CSS grid layout for better responsiveness
- Added proper focus outlines for accessibility compliance
- Ensured WCAG AA compliance for dark mode
- Added noscript fallbacks for enhanced reliability
- Improved component structure and code organization

### Bug Fixes
- Removed invalid CSS classes causing build errors
- Fixed theme persistence across page reloads
- Resolved z-index stacking issues
- Corrected background gradient implementation
- Fixed footer surface color mismatches

## [Previous Versions]

### [1.0.0] - 2025-10-18
- Initial implementation of UdaanIQ platform
- Basic UI structure with navbar and sidebar
- Core functionality for interview preparation tools