#!/bin/bash

echo "🚀 Setting up Holiday AI Planner Development Environment"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your API keys and configuration"
else
    echo "✅ .env file already exists"
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install web app dependencies
echo "📦 Installing web app dependencies..."
cd apps/web
npm install
cd ../..

# Install API dependencies
echo "📦 Installing API dependencies..."
cd apps/api
pip install -r requirements.txt
cd ../..

echo "✅ Dependencies installed successfully!"

# Start database and Redis
echo "🐳 Starting database and Redis..."
docker-compose up db redis -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if database is ready
echo "🔍 Checking database connection..."
if docker-compose exec db pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database is ready!"
else
    echo "❌ Database is not ready. Please check Docker logs."
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Start the development servers:"
echo "   - npm run dev:web    # Frontend on http://localhost:3004"
echo "   - npm run dev:api    # Backend on http://localhost:8000"
echo "   - npm run dev        # All services"
echo ""
echo "3. Access the applications:"
echo "   - Frontend: http://localhost:3004"
echo "   - Backend: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "Happy coding! 🚀✈️"
