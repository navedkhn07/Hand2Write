#!/bin/bash

# Render build script for Hand2Write
echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if build script exists
if npm run build; then
    echo "Build completed successfully!"
    ls -la dist/
else
    echo "Build failed!"
    exit 1
fi
