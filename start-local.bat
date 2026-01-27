@echo off
echo Starting PGD Quote Generator...
echo.
echo The app will open in your browser at http://localhost:4173
echo Press Ctrl+C to stop the server when done.
echo.
cd /d "%~dp0"
npx serve dist -l 4173
