# Codemagic Environment Variables Setup Guide

This guide shows exactly what environment variables to set up in Codemagic for the traditional certificate-based approach.

## Required Environment Variable Group

### Single Group: `app_store_credentials`
Contains only the 3 App Store Connect API variables for publishing:

```bash
# App Store Connect API (for publishing)
APP_STORE_CONNECT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n-----END PRIVATE KEY-----"
APP_STORE_CONNECT_KEY_IDENTIFIER="ABC123DEFG"
APP_STORE_CONNECT_ISSUER_ID="12345678-1234-1234-1234-123456789012"
```

## Step-by-Step Setup in Codemagic

### 1. Access Codemagic Dashboard
1. Go to [https://codemagic.io](https://codemagic.io)
2. Sign in and select your app
3. Go to **Settings** → **Environment variables**

### 2. Create Single Group: `app_store_credentials`
1. Click **Add group**
2. Name: `app_store_credentials`
3. Add only these 3 variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `APP_STORE_CONNECT_PRIVATE_KEY` | Your .p8 private key content | Include `\n` for newlines |
| `APP_STORE_CONNECT_KEY_IDENTIFIER` | Your 10-character key ID | From App Store Connect |
| `APP_STORE_CONNECT_ISSUER_ID` | Your UUID issuer ID | From App Store Connect |

## Converting App Store Connect Private Key to Base64

### Convert App Store Connect Private Key (.p8):
```bash
base64 -i AuthKey_ABC123DEFG.p8 -o private_key_base64.txt
cat private_key_base64.txt | tr -d '\n'
```

**Note**: Only the App Store Connect private key needs to be base64 encoded. The Key ID and Issuer ID are just text values.

## Using the Configuration

1. **Replace the main codemagic.yaml**:
   ```bash
   cp codemagic-traditional.yaml codemagic.yaml
   ```

2. **Commit and push**:
   ```bash
   git add codemagic.yaml
   git commit -m "Use traditional certificate-based Codemagic configuration"
   git push origin main
   ```

3. **Start a build** in Codemagic

## Key Features of This Approach

- **Only 3 variables needed**: App Store Connect API credentials only
- **Automatic code signing**: Uses Codemagic's built-in signing capabilities
- **No manual certificate setup**: Codemagic handles all code signing automatically
- **App Store Connect API**: For TestFlight publishing
- **Simplified configuration**: Minimal setup required

## Troubleshooting

### Common Issues:
1. **Certificate import fails**: Check password and certificate type
2. **Provisioning profile not found**: Ensure profile name matches exactly
3. **App Store Connect authentication**: Verify API key permissions
4. **Base64 encoding issues**: Ensure no newlines in encoded strings

### Debug Commands:
```bash
# Check available certificates
security find-identity -v -p codesigning build.keychain

# List provisioning profiles
ls -la ~/Library/MobileDevice/Provisioning\ Profiles/

# Verify profile content
security cms -D -i ~/Library/MobileDevice/Provisioning\ Profiles/your_profile.mobileprovision
```

This configuration should work reliably with the traditional certificate-based approach! 🚀
