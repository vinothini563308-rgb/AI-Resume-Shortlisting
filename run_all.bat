@echo off
echo Starting TalentLens AI Full-Stack Application...

start "TalentLens AI - FastAPI Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --port 8000 --host 127.0.0.1"

timeout /t 3 /nobreak >nul

start "TalentLens AI - Vite React Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo ========================================================
echo TalentLens AI is launching!
echo Backend:  http://127.0.0.1:8000 (Swagger docs: http://127.0.0.1:8000/docs)
echo Frontend: http://127.0.0.1:5173
echo ========================================================
echo.
timeout /t 2 /nobreak >nul
start http://127.0.0.1:5173
