#!/bin/bash

# 🎨 Luma Gen 1 - Icon Optimization Script
# This script optimizes the app icon for different platforms and sizes

echo "🎨 Optimizing Luma Gen 1 App Icons..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Please install it first:"
    echo "   brew install imagemagick"
    exit 1
fi

# Create optimized versions directory
mkdir -p assets/optimized

# iOS App Icon (1024x1024)
echo "📱 Creating iOS app icon..."
convert assets/icon.png -resize 1024x1024 -background white -gravity center -extent 1024x1024 assets/optimized/ios-icon-1024.png

# iOS App Icon (180x180)
echo "📱 Creating iOS app icon 180x180..."
convert assets/icon.png -resize 180x180 -background white -gravity center -extent 180x180 assets/optimized/ios-icon-180.png

# iOS App Icon (120x120)
echo "📱 Creating iOS app icon 120x120..."
convert assets/icon.png -resize 120x120 -background white -gravity center -extent 120x120 assets/optimized/ios-icon-120.png

# iOS App Icon (87x87)
echo "📱 Creating iOS app icon 87x87..."
convert assets/icon.png -resize 87x87 -background white -gravity center -extent 87x87 assets/optimized/ios-icon-87.png

# iOS App Icon (80x80)
echo "📱 Creating iOS app icon 80x80..."
convert assets/icon.png -resize 80x80 -background white -gravity center -extent 80x80 assets/optimized/ios-icon-80.png

# iOS App Icon (76x76)
echo "📱 Creating iOS app icon 76x76..."
convert assets/icon.png -resize 76x76 -background white -gravity center -extent 76x76 assets/optimized/ios-icon-76.png

# iOS App Icon (60x60)
echo "📱 Creating iOS app icon 60x60..."
convert assets/icon.png -resize 60x60 -background white -gravity center -extent 60x60 assets/optimized/ios-icon-60.png

# iOS App Icon (40x40)
echo "📱 Creating iOS app icon 40x40..."
convert assets/icon.png -resize 40x40 -background white -gravity center -extent 40x40 assets/optimized/ios-icon-40.png

# iOS App Icon (29x29)
echo "📱 Creating iOS app icon 29x29..."
convert assets/icon.png -resize 29x29 -background white -gravity center -extent 29x29 assets/optimized/ios-icon-29.png

# Android Adaptive Icon (108x108 foreground)
echo "🤖 Creating Android adaptive icon foreground..."
convert assets/icon.png -resize 108x108 -background transparent -gravity center -extent 108x108 assets/optimized/android-adaptive-foreground.png

# Android Adaptive Icon (108x108 background)
echo "🤖 Creating Android adaptive icon background..."
convert assets/icon.png -resize 108x108 -background "#FFD700" -gravity center -extent 108x108 -blur 0x10 assets/optimized/android-adaptive-background.png

# Android Play Store Icon (512x512)
echo "🤖 Creating Android Play Store icon..."
convert assets/icon.png -resize 512x512 -background white -gravity center -extent 512x512 assets/optimized/android-play-store.png

# Web Favicon (32x32)
echo "🌐 Creating web favicon..."
convert assets/icon.png -resize 32x32 -background white -gravity center -extent 32x32 assets/optimized/web-favicon.png

# Splash Screen Icon (1242x2436 for iPhone X)
echo "📱 Creating splash screen icon..."
convert assets/icon.png -resize 400x400 -background "#FFD700" -gravity center -extent 400x400 assets/optimized/splash-icon.png

echo "✅ Icon optimization completed!"
echo ""
echo "📁 Optimized icons saved to: assets/optimized/"
echo ""
echo "📋 Icon sizes created:"
echo "   iOS: 1024x1024, 180x180, 120x120, 87x87, 80x80, 76x76, 60x60, 40x40, 29x29"
echo "   Android: 108x108 (adaptive), 512x512 (Play Store)"
echo "   Web: 32x32 (favicon)"
echo "   Splash: 400x400"
echo ""
echo "🎯 Next steps:"
echo "   1. Review optimized icons in assets/optimized/"
echo "   2. Replace main icon files if needed"
echo "   3. Test on different devices"
echo "   4. Build for App Store submission" 