@echo off
echo ===================================================
echo 🚀 Hermione Hair - Start Backend & Secure Tunnel
echo ===================================================
echo.
echo This script will open two new command prompts:
echo 1. One running the backend server on port 5000.
echo 2. One running a Cloudflare Tunnel to expose port 5000.
echo.
pause

echo Starting Backend...
start "Hermione Hair Backend" cmd /k "cd backend && npm run dev"

echo Starting Cloudflare Tunnel on Port 5000...
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --url http://localhost:5000"

echo.
echo ===================================================
echo ✅ Started!
echo.
echo In the Cloudflare Tunnel window, look for a URL ending with:
echo https://xxxx.trycloudflare.com
echo.
echo Copy that URL, paste it into the Connection Setup box on
echo your Netlify page, and click "Connect".
echo ===================================================
pause
