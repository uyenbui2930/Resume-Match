#!/bin/bash

# AI Job Assistant Frontend Startup Script

echo "🚀 Starting AI Job Assistant Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
REACT_APP_API_URL=http://localhost:3000
EOL
    echo "✅ Created .env file with default API URL"
fi

# Start the development server
echo "🌐 Starting development server..."
echo "📍 The app will be available at: http://localhost:3000"
echo "🔗 Make sure your backend API is running on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
