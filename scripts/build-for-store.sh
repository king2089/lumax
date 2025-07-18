#!/bin/bash

# 🚀 Luma Gen 1 - App Store Build Script
# This script builds the app for App Store submission

echo "🚀 Starting Luma Gen 1 App Store Build..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
fi

# Check if logged in to Expo
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to Expo. Please run: eas login"
    exit 1
fi

# Build for iOS
echo "📱 Building for iOS..."
eas build --platform ios --profile production

# Build for Android
echo "🤖 Building for Android..."
eas build --platform android --profile production

echo "✅ Builds completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://expo.dev to download your builds"
echo "2. Upload iOS build to App Store Connect"
echo "3. Upload Android build to Google Play Console"
echo "4. Complete app metadata and screenshots"
echo "5. Submit for review"
echo ""
echo "📚 See APP_STORE_SUBMISSION.md for detailed instructions" 