@echo off
setlocal
cd /d "%~dp0"

node "%~dp0moco_web_app_call.js" dropdowns
set RESULT=%ERRORLEVEL%
echo.
if not "%RESULT%"=="0" (
  echo MOCO dropdown refresh failed.
) else (
  echo MOCO dropdown refresh completed.
)
pause
exit /b %RESULT%
