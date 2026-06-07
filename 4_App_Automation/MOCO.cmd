@echo off
setlocal
cd /d "%~dp0"

if "%~1"=="" (
  node "%~dp0moco_web_app_call.js" status
  exit /b %ERRORLEVEL%
)

node "%~dp0moco_web_app_call.js" %*
exit /b %ERRORLEVEL%
