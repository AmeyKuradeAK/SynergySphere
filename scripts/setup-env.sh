#!/bin/bash

# SynergySphere Environment Setup Script
# This script helps set up environment variables for EAS builds

set -e

echo "🚀 SynergySphere Environment Setup"
echo "=================================="
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI is not installed. Installing now..."
    npm install -g @expo/eas-cli
    echo "✅ EAS CLI installed successfully"
else
    echo "✅ EAS CLI is already installed"
fi

echo ""

# Check if user is logged in to EAS
if ! eas whoami &> /dev/null; then
    echo "🔑 Please login to EAS:"
    eas login
else
    echo "✅ Already logged in to EAS as: $(eas whoami)"
fi

echo ""
echo "📝 Setting up Firebase environment variables..."
echo "Please enter your Firebase configuration details:"
echo ""

# Prompt for Firebase configuration
read -p "Firebase API Key: " FIREBASE_API_KEY
read -p "Firebase Auth Domain (e.g., yourproject.firebaseapp.com): " FIREBASE_AUTH_DOMAIN
read -p "Firebase Project ID: " FIREBASE_PROJECT_ID
read -p "Firebase Storage Bucket (e.g., yourproject.appspot.com): " FIREBASE_STORAGE_BUCKET
read -p "Firebase Messaging Sender ID: " FIREBASE_MESSAGING_SENDER_ID
read -p "Firebase App ID: " FIREBASE_APP_ID

echo ""
echo "🔒 Creating EAS secrets..."

# Create secrets
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "$FIREBASE_API_KEY" --force
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "$FIREBASE_AUTH_DOMAIN" --force
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "$FIREBASE_PROJECT_ID" --force
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "$FIREBASE_STORAGE_BUCKET" --force
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "$FIREBASE_MESSAGING_SENDER_ID" --force
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --value "$FIREBASE_APP_ID" --force

echo ""
echo "✅ All secrets created successfully!"
echo ""
echo "📋 Verifying secrets..."
eas secret:list --scope project

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'eas build --platform all --profile development' to test your build"
echo "2. Update your Firebase Firestore rules (see README.md)"
echo "3. Test the app with your Firebase configuration"
echo ""
echo "For more information, see ENVIRONMENT_SETUP.md"
