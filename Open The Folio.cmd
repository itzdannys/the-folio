@echo off
setlocal
rem Open your offline personal Folio in your default browser. No server is started.
if not exist "%~dp0index.html" (
  echo Could not find index.html next to this launcher.
  pause
  exit /b 1
)
start "" "%~dp0index.html"
endlocal
