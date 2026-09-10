@echo off
setlocal
cd /d "%~dp0"
echo Open http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=bath
where python >nul 2>nul
if not errorlevel 1 (
  python -m http.server 8768 --bind 127.0.0.1 --directory site
) else (
  py -3 -m http.server 8768 --bind 127.0.0.1 --directory site
)
pause
