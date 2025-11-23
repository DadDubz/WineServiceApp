#!/bin/bash

# Script to push Wine Service App to GitHub
# This will commit all changes and push to your repository

echo "🍷 Wine Service App - GitHub Push Script"
echo "========================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Initializing..."
    git init
    git branch -M main
fi

# Add all files
echo "📦 Adding files..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Add Docker deployment configuration and fix maroon/tan design

- Added root Dockerfile for unified container build
- Created .dockerignore for optimized builds  
- Added GitHub Actions workflow for CI/CD
- Updated docker-compose.yml for easy deployment
- Implemented maroon/tan/white color scheme
- Fixed login authentication flow
- Created comprehensive deployment documentation"

# Check if remote exists
if ! git remote | grep -q origin; then
    echo ""
    echo "❓ No remote repository configured."
    echo "Please enter your GitHub repository URL:"
    echo "Example: https://github.com/yourusername/WineServiceApp.git"
    read -p "Repository URL: " repo_url
    
    if [ -n "$repo_url" ]; then
        git remote add origin "$repo_url"
        echo "✅ Remote added: $repo_url"
    else
        echo "❌ No repository URL provided. Exiting..."
        exit 1
    fi
fi

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "Next steps:"
    echo "1. Go to your GitHub repository"
    echo "2. Check the Actions tab to see the Docker build"
    echo "3. Deploy using one of the methods in DEPLOYMENT.md"
    echo ""
    echo "🍷 Your Wine Service App is ready for deployment!"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "1. Your GitHub credentials"
    echo "2. Repository permissions"
    echo "3. Branch name (should be 'main')"
fi
