# UdaanIQ AI Interview System with AI Tutor

This project combines the UdaanIQ AI Interview System with an AI Tutor service.

## Services Overview

1. **Frontend**: Next.js application running on http://localhost:3000
2. **Backend**: Express.js API running on http://localhost:3000/api
3. **AI Tutor**: Flask application running on http://localhost:5500

## Installation

### Option 1: Using the install script (Windows only)
Double-click on `install-dependencies.bat` to install all dependencies automatically.

### Option 2: Manual installation

1. **Install Backend Dependencies**
   ```bash
   cd aiinterview/UdaanIQ 2/udaaniq/backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd aiinterview/UdaanIQ 2/udaaniq/frontend
   npm install
   ```

3. **Install AI Tutor Dependencies**
   ```bash
   cd aitutor/aitutor/AI-Tutor
   pip install -r requirements.txt
   ```

## How to Run

### Option 1: Using the start script (Windows only)
Double-click on `start-services.bat` to start all services automatically.

### Option 2: Manual start

1. **Start the Backend Server**
   ```bash
   cd aiinterview/UdaanIQ 2/udaaniq/backend
   npm run dev
   ```

2. **Start the Frontend Server**
   ```bash
   cd aiinterview/UdaanIQ 2/udaaniq/frontend
   npm run dev
   ```

3. **Start the AI Tutor Service**
   ```bash
   cd aitutor/aitutor/AI-Tutor/testFrontend/FlaskApp
   python app.py
   ```

## Accessing the Applications

- Main Application: http://localhost:3000
- AI Tutor: http://localhost:5500

## Troubleshooting

If you encounter a "fail to fetch" error during signup:

1. Make sure all services are running
2. Check that the backend is running on port 3000
3. Verify that there are no firewall issues blocking the ports
4. Check the browser console for specific error messages

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed troubleshooting steps.

## Features

- AI-powered mock interviews
- Resume analysis
- Skill gap analysis
- Career roadmap
- AI Tutor for personalized learning