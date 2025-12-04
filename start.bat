@echo off
echo 🚀 Starting AI Job Assistant Frontend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    echo REACT_APP_API_URL=http://localhost:3000 > .env
    echo ✅ Created .env file with default API URL
)

REM Start the development server
echo 🌐 Starting development server...
echo 📍 The app will be available at: http://localhost:3000
echo 🔗 Make sure your backend API is running on: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
