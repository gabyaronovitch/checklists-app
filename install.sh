#!/bin/bash

# CheckLists App - Easy Installer
# Run this script with: ./install.sh

echo "========================================"
echo "   CheckLists App - Easy Installer     "
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo ""
    echo "Please install Node.js first:"
    echo "  1. Go to https://nodejs.org"
    echo "  2. Download the LTS version"
    echo "  3. Run the installer"
    echo "  4. Restart Terminal and try again"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✓ Node.js found: $NODE_VERSION"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1/3: Installing dependencies..."
echo "   (This may take a few minutes)"
npm install --silent
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Step 2: Setup database
echo "🗄️  Step 2/3: Setting up database..."
npm run db:setup --silent
if [ $? -ne 0 ]; then
    echo "❌ Failed to setup database"
    exit 1
fi
echo "✓ Database ready"
echo ""

# Step 3: Build for production
echo "🔨 Step 3/3: Building application..."
npm run build --silent
if [ $? -ne 0 ]; then
    echo "❌ Failed to build application"
    exit 1
fi
echo "✓ Build complete"
echo ""

echo "========================================"
echo "   ✅ Installation Complete!           "
echo "========================================"
echo ""
echo "To start the app, run:"
echo ""
echo "   npm run start"
echo ""
echo "Then open your browser to:"
echo ""
echo "   http://localhost:3000"
echo ""
echo "========================================"
