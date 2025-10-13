# iOS Code Signing Setup for CodeMagic

## Issue
CodeMagic is failing because no provisioning profiles are found for iOS code signing.

## Solutions

### Option 1: Use Automatic Signing (Recommended for Testing)
The updated `codemagic.yaml` now supports automatic signing, which should work without provisioning profiles for development builds.

### Option 2: Set Up Manual Code Signing (For App Store)

1. **Create Apple Developer Account**
   - Go to [Apple Developer Portal](https://developer.apple.com)
   - Sign up for Apple Developer Program ($99/year)

2. **Create App ID**
   - Go to Certificates, Identifiers & Profiles
   - Create new App ID with identifier: `tech.cinemind.app`
   - Enable required capabilities

3. **Create Provisioning Profile**
   - Create Development/Distribution provisioning profile
   - Download the `.mobileprovision` file

4. **Upload to CodeMagic**
   - Go to CodeMagic → Apps → Your App → Settings
   - Upload the provisioning profile file
   - Add to environment variables group `app_store_credentials`

5. **Create Signing Certificate**
   - Create iOS Distribution certificate
   - Download and upload to CodeMagic

### Option 3: Use CodeMagic's Automatic Signing
CodeMagic can automatically manage signing for you:
- Go to CodeMagic → Apps → Your App → Settings
- Enable "Automatic code signing"
- Add your Apple Developer account credentials

## Current Configuration
The updated YAML will:
- ✅ Try automatic signing first
- ✅ Fall back to development export if App Store signing fails
- ✅ Generate development IPA for testing
- ✅ Skip App Store submission until credentials are set up

## Next Steps
1. Commit the updated `codemagic.yaml`
2. Trigger a new build in CodeMagic
3. The build should now succeed with automatic signing
4. You'll get a development IPA that can be installed via TestFlight or direct installation
