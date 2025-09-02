#!/bin/bash
# Build debug APK (faster, no signing required)

echo "🔨 Building আমার নোট Debug APK..."

# Allow user override; prefer ANDROID_SDK_ROOT then ANDROID_HOME
if [ -z "$ANDROID_SDK_ROOT" ] && [ -n "$ANDROID_HOME" ]; then
    ANDROID_SDK_ROOT="$ANDROID_HOME"
fi

if [ -z "$ANDROID_SDK_ROOT" ]; then
    echo "⚠️  ANDROID_SDK_ROOT is not set. The script will attempt to find a local SDK."
    CANDIDATES=("$HOME/Android/Sdk" "/opt/android" "/usr/lib/android-sdk")
    for p in "${CANDIDATES[@]}"; do
        if [ -d "$p" ]; then
            ANDROID_SDK_ROOT="$p"
            break
        fi
    done
fi

if [ -z "$ANDROID_SDK_ROOT" ]; then
    echo "\nERROR: No Android SDK found. Set ANDROID_SDK_ROOT or ANDROID_HOME to your SDK path and retry."
    echo "See README or run: sdkmanager --install 'platform-tools' 'platforms;android-33'"
    exit 1
fi

export PATH="$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools"

# Navigate to project (relative)
cd "$(dirname "$0")" || exit 1

echo "📦 Building web app..."
# Build site first (Next.js)
npm run build

echo "🔄 Syncing with Capacitor..."
# Ensure local.properties contains sdk.dir for Gradle
LOCAL_PROPS_FILE="android/local.properties"
if [ -z "$(grep -E '^sdk.dir=' -m1 "$LOCAL_PROPS_FILE" 2>/dev/null)" ]; then
    echo "sdk.dir=$ANDROID_SDK_ROOT" > "$LOCAL_PROPS_FILE"
    echo "Wrote $LOCAL_PROPS_FILE -> sdk.dir=$ANDROID_SDK_ROOT"
fi

npx cap sync

echo "🏗️ Building Android Debug APK..."
cd android
./gradlew assembleDebug

echo "✅ Debug Build complete!"
echo "📱 Debug APK Location: android/app/build/outputs/apk/debug/app-debug.apk"

# Show APK info
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "📊 Debug APK Size: $(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)"
    echo "🧪 Ready for testing! (Debug APK - not for Play Store)"
else
    echo "❌ Debug build failed - check logs above"
fi
