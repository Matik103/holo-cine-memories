# CineMind Mobile App Setup Guide

## 🎉 Capacitor Configuration Complete!

Your CineMind web app is now ready to be converted into native iOS and Android apps.

### Configuration Details
- **App Name:** CineMind
- **Bundle ID:** com.onEuLflXqmQa.CineMind
- **Version:** 1.0.2
- **Web Directory:** dist

---

## 📱 Next Steps

### Step 1: Export to GitHub
1. Click the "Export to GitHub" button in Lovable
2. Clone your repository locally:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   ```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build Web Assets
```bash
npm run build
```

### Step 4: Initialize Native Platforms

#### For iOS (macOS with Xcode required):
```bash
npx cap add ios
npx cap sync ios
```

#### For Android (Android Studio required):
```bash
npx cap add android
npx cap sync android
```

### Step 5: Open in Native IDEs

#### iOS:
```bash
npx cap open ios
```
This will open Xcode. Then:
1. Select your project target
2. Go to Signing & Capabilities
3. Select your Development Team
4. Set Bundle Identifier: `com.onEuLflXqmQa.CineMind`
5. Set Version: `1.0.2`

#### Android:
```bash
npx cap open android
```
This will open Android Studio. Update the following in `android/app/build.gradle`:
- `applicationId`: "com.onEuLflXqmQa.CineMind"
- `versionName`: "1.0.2"
- `versionCode`: 2

---

## 🚀 Running on Devices/Emulators

### iOS:
```bash
npm run build
npx cap sync ios
npx cap run ios
```

### Android:
```bash
npm run build
npx cap sync android
npx cap run android
```

---

## 🔧 CodeMagic CI/CD Setup

Your `codemagic.yaml` file is already configured. To set it up:

### 1. Create CodeMagic Account
- Go to https://codemagic.io
- Sign up with your GitHub account

### 2. Connect Your Repository
- Add your repository to CodeMagic
- Grant necessary permissions

### 3. Configure Environment Variables

Create a group called `app_store_credentials` with:

**For iOS:**
- `APP_STORE_CONNECT_KEY_IDENTIFIER`
- `APP_STORE_CONNECT_KEY_ID`
- `APP_STORE_CONNECT_ISSUER_ID`
- Upload App Store Connect API key
- Upload signing certificates and provisioning profiles

**For Android (create `google_play_credentials` group):**
- `KEYSTORE` (base64 encoded keystore file)
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`
- `GOOGLE_PLAY_SERVICE_ACCOUNT` (JSON credentials)

### 4. Trigger Build
Once configured, push to your repository and CodeMagic will automatically:
- Build your web assets
- Sync to native platforms
- Build iOS IPA and Android AAB
- Submit to TestFlight and Play Store internal testing

---

## 📝 iOS-Specific Configuration

### Required Permissions (Info.plist)
The following permissions need to be added to `ios/App/App/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access to scan movie posters and QR codes.</string>

<key>NSMicrophoneUsageDescription</key>
<string>Microphone access for voice search feature.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Access photos to share your movie discoveries.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>Save movie posters to your photo library.</string>
```

---

## 🤖 Android-Specific Configuration

### Required Permissions (AndroidManifest.xml)
These should be added to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.VIBRATE" />
```

---

## 🎨 App Icons and Assets

### Generate App Icons
You can use your brain favicon (`public/favicon.png`) as the source:

**Tools:**
- iOS & Android: https://www.appicon.co
- Alternative: https://icon.kitchen

**Required Sizes:**
- iOS: 1024x1024 (App Store)
- Android: 512x512 (Play Store)

Place generated icons in:
- iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Android: `android/app/src/main/res/mipmap-*/`

---

## 🧪 Testing

### Development Mode (Live Reload)
Uncomment these lines in `capacitor.config.ts`:
```typescript
server: {
  url: 'https://88d4f441-d76a-4bff-92ae-6ed2a7ba0f0f.lovableproject.com?forceHideBadge=true',
  cleartext: true
}
```

Then run:
```bash
npx cap sync
npx cap run ios  # or android
```

Your app will now live-reload from the Lovable dev server!

### Production Build
Comment out the server config before building for production:
```typescript
server: {
  androidScheme: 'https',
  // url: '...',  // Commented out
  // cleartext: true
}
```

---

## 📦 Available npm Scripts

```bash
# Development
npm run dev                  # Start web dev server

# Build
npm run build               # Build web assets
npm run build:mobile        # Build and sync to native platforms

# Mobile shortcuts
npm run mobile:ios          # Build and open iOS in Xcode
npm run mobile:android      # Build and open Android in Android Studio
npm run mobile:run:ios      # Build and run on iOS device/simulator
npm run mobile:run:android  # Build and run on Android device/emulator

# Sync only
npm run sync                # Sync to both platforms
npm run sync:ios           # Sync to iOS only
npm run sync:android       # Sync to Android only
```

---

## 🎯 Native Features Integrated

Your app now has access to:
- ✅ **Haptic Feedback** - Vibration feedback for user interactions
- ✅ **Device Info** - Access to device details
- ✅ **Network Status** - Check connectivity
- ✅ **Local Notifications** - Push notifications
- ✅ **App State Management** - Handle background/foreground
- ✅ **Status Bar Control** - Customize status bar appearance
- ✅ **Splash Screen** - Native launch screen

### Usage Example:
```typescript
import { useNativeSensors } from '@/hooks/useNativeSensors';

const MyComponent = () => {
  const { triggerHapticFeedback, state } = useNativeSensors();
  
  const handleClick = () => {
    // Trigger haptic feedback on native
    triggerHapticFeedback('medium');
  };
  
  return (
    <button onClick={handleClick}>
      {state.isNative ? 'Running on Native!' : 'Running on Web'}
    </button>
  );
};
```

---

## 🐛 Common Issues

### Issue: White Screen on Launch
**Solution:** Make sure you've built web assets first:
```bash
npm run build
npx cap sync
```

### Issue: CocoaPods Installation Fails (iOS)
**Solution:**
```bash
cd ios/App
pod repo update
pod install --repo-update
cd ../..
```

### Issue: Build Errors in Android Studio
**Solution:** Update Gradle wrapper:
```bash
cd android
./gradlew wrapper --gradle-version=8.0
cd ..
```

---

## 📚 Resources

- **Capacitor Docs:** https://capacitorjs.com/docs
- **CodeMagic Docs:** https://docs.codemagic.io
- **Apple Developer:** https://developer.apple.com
- **Android Developer:** https://developer.android.com

---

## 🎊 You're All Set!

Your CineMind app is ready to go mobile. Follow the steps above to:
1. Export to GitHub
2. Run locally and test on devices
3. Set up CI/CD with CodeMagic
4. Submit to App Store and Play Store

Good luck with your mobile app launch! 🚀
