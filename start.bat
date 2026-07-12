@echo off
title FundFlow AI - Starting Servers
color 0A

echo.
echo  ================================================
echo   FundFlow AI - Starting Development Servers
echo  ================================================
echo.

:: Start the API backend in a new window
echo  [1/2] Starting API backend (port 8000)...
start "FundFlow API" cmd /k "cd /d "C:\Users\adars\OneDrive\Documents\Fundflow AI\apps\api" && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

:: Wait 3 seconds for API to initialize
timeout /t 3 /nobreak > nul

:: Start the Next.js frontend in a new window
echo  [2/2] Starting Frontend (port 3000)...
start "FundFlow Web" cmd /k "cd /d "C:\Users\adars\OneDrive\Documents\Fundflow AI\apps\web" && npm run dev"

echo.
echo  ================================================
echo   Both servers are starting!
echo.
echo   Frontend:  http://localhost:3000
echo   API Docs:  http://localhost:8000/docs
echo  ================================================
echo.
echo  Wait ~15 seconds for Next.js to compile,
echo  then open http://localhost:3000 in your browser.
echo.
pause
