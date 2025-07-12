#!/bin/bash

echo "🚀 Setting up Qayed local development environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Create server environment file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server environment file..."
    cat > server/.env << EOF
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Google GenAI Configuration (required for PDF parsing)
GEMINI_API_KEY=your_gemini_api_key_here

# File Upload Configuration
MAX_FILE_SIZE=50MB
MAX_PAGES_PER_CHUNK=5
PROCESSING_DELAY=1000
MAX_RETRIES=3
EOF
    echo "✅ Created server/.env - Please update with your actual Gemini API key"
else
    echo "✅ Server environment file already exists"
fi

# Create or update frontend environment variables
echo "📝 Setting up frontend environment variables..."
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Feature Flags for Gradual Migration
NEXT_PUBLIC_USE_BACKEND_PDF_PARSING=true
NEXT_PUBLIC_USE_BACKEND_STRUCTURING=false
NEXT_PUBLIC_USE_BACKEND_CASHFLOW=false
NEXT_PUBLIC_USE_BACKEND_MATCHING=false

# Your existing environment variables
# Copy from your current .env file...
EOF
    echo "✅ Created .env.local - Please add your existing environment variables"
else
    echo "ℹ️  .env.local already exists - make sure to add backend configuration"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Update server/.env with your Gemini API key"
echo "2. Update .env.local with your existing environment variables"
echo "3. Start development with: npm run dev"
echo "4. Or start services separately:"
echo "   - Frontend only: npm run dev:frontend-only"
echo "   - Backend only: npm run dev:backend"
echo ""
echo "📊 Available commands:"
echo "   npm run dev                 # Start both frontend and backend"
echo "   npm run build               # Build both services"
echo "   npm run deploy:backend      # Deploy backend to Railway"
echo "   npm run logs:backend        # View backend logs"
echo "   npm run status:backend      # Check backend status"
echo "" 