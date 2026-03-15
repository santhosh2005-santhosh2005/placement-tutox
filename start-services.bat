@echo off
echo Starting UdaanIQ AI Interview System...

REM Start the backend server in the background
cd aiinterview\UdaanIQ 2\udaaniq\backend
start "Backend Server" cmd /k "npm run dev"

REM Wait a few seconds for backend to start
timeout /t 5 /nobreak >nul

REM Start the frontend in the background
cd ..\frontend
start "Frontend Server" cmd /k "set PORT=3005 && npm run dev"

REM Wait a few seconds for frontend to start
timeout /t 5 /nobreak >nul

REM Start the AI Tutor service in the background
cd ..\..\..\..\aitutor\aitutor\AI-Tutor\testFrontend\FlaskApp
start "AI Tutor Server" cmd /k "python app.py"

echo.
echo Services started successfully!
echo.
echo Frontend: http://localhost:3005
echo Backend: http://localhost:5000/api
echo AI Tutor: http://localhost:5500
echo.
echo Press any key to exit...
pause >nul