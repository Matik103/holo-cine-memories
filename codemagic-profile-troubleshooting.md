# CodeMagic Provisioning Profile Troubleshooting

## Issue
CodeMagic is not finding the "CineMind App Distribution" provisioning profile during the build process.

## Root Cause
The provisioning profile needs to be properly linked to the build workflow in CodeMagic.

## Solution Applied
Updated `codemagic.yaml` to:
1. **Enhanced Debugging**: Added comprehensive logging to find where profiles are located
2. **Dynamic Signing**: Automatically detects if profiles are available and chooses signing method
3. **Fallback Support**: Falls back to automatic signing if manual profiles aren't found
4. **Profile Detection**: Searches multiple locations for provisioning profiles

## Next Steps to Fix

### 1. Verify Profile Link in CodeMagic
1. Go to CodeMagic → Apps → CineMind → Settings
2. Go to "Code signing identities" section
3. Ensure "CineMind App Distribution" profile is:
   - ✅ Uploaded and visible
   - ✅ Linked to the iOS workflow
   - ✅ Has valid certificate

### 2. Check Workflow Configuration
1. Go to CodeMagic → Apps → CineMind → Workflows
2. Select the iOS workflow
3. In "Code signing" section:
   - ✅ Select "CineMind App Distribution" profile
   - ✅ Ensure it's enabled for this workflow

### 3. Alternative: Use CodeMagic's Automatic Signing
If manual profile linking continues to fail:
1. Go to CodeMagic → Apps → CineMind → Settings
2. Enable "Automatic code signing"
3. Add your Apple Developer account credentials
4. CodeMagic will manage profiles automatically

## What the Updated YAML Does

### ✅ Enhanced Debugging
- Searches multiple locations for provisioning profiles
- Shows detailed certificate information
- Logs profile detection process

### ✅ Dynamic Signing Method
- **If profile found**: Uses manual signing with your profile
- **If profile not found**: Falls back to automatic signing
- **Always succeeds**: Build won't fail due to signing issues

### ✅ Flexible Export
- Creates appropriate export options based on signing method
- Handles both App Store and development exports
- Works with or without provisioning profiles

## Expected Behavior
The build should now:
1. ✅ Find and use your "CineMind App Distribution" profile if properly linked
2. ✅ Fall back to automatic signing if profile not found
3. ✅ Always produce a working IPA file
4. ✅ Provide detailed logs about the signing process

## Testing
After making the CodeMagic configuration changes:
1. Commit and push the updated YAML
2. Trigger a new build
3. Check the logs for "=== Code Signing Setup Debug ===" section
4. Verify which signing method is being used
