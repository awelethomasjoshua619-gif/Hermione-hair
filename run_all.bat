@echo off
echo ===================================================
echo 🚀 Hermione Hair - Start Frontend, Backend & Tunnel
echo ===================================================
echo.
echo This script will open three separate command prompts:
echo 1. Frontend Dev Server (http://localhost:5173)
echo 2. Backend API Server (http://localhost:5000)
echo 3. Cloudflare Tunnel (to connect your Netlify site)
echo.
pause

echo Starting Frontend Dev Server...
start "Hermione Hair Frontend" cmd /k "cd frontend && npm run dev"

echo Starting Backend API Server...
start "Hermione Hair Backend" cmd /k "cd backend && npm run dev"

echo Starting Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --url http://localhost:5000"

echo.
echo ===================================================
echo ✅ All services started!
echo.
echo 💻 Local Testing: Go to http://localhost:5173
echo 🌐 Netlify Testing: Look for the HTTPS URL in the
echo    Cloudflare Tunnel window and paste it in the
echo    Connection Setup box on your Netlify page.
echo ===================================================
pause
