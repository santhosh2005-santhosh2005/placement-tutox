@echo off
echo Installing dependencies for UdaanIQ AI Interview System...

REM Install backend dependencies
echo Installing backend dependencies...
cd aiinterview\UdaanIQ 2\udaaniq\backend
npm install

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
npm install

REM Install AI Tutor dependencies
echo Installing AI Tutor dependencies...
cd ..\..\..\..\aitutor\aitutor\AI-Tutor\testFrontend\FlaskApp
pip install -r ..\..\requirements.txt

echo.
echo All dependencies installed successfully!
echo.
echo To start the services, run start-services.bat or start each service manually:
echo 1. Backend: cd aiinterview\UdaanIQ 2\udaaniq\backend ^& npm run dev
echo 2. Frontend: cd aiinterview\UdaanIQ 2\udaaniq\frontend ^& npm run dev
echo 3. AI Tutor: cd aitutor\aitutor\AI-Tutor\testFrontend\FlaskApp ^& python app.py
echo.
pause