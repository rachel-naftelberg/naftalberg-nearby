@echo off
title טיולי נפתלברג - מה בסביבה
echo ========================================================
echo   מפעיל את אפליקציית: טיולי נפתלברג - מה בסביבה...
echo ========================================================
set PATH=%PATH%;C:\Users\um624\.gemini\antigravity\scratch\node\node-v20.12.2-win-x64
cd /d C:\Users\um624\.gemini\antigravity\scratch\naftalberg-nearby
start http://localhost:3005
node server.js
pause
