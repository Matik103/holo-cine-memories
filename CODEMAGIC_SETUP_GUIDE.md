# Codemagic iOS Setup Guide - Working Configuration

This guide is based on a proven working configuration from another app. It uses traditional certificate-based signing with App Store Connect API for publishing.

## Required Environment Variables

### Group 1: `app_store_credentials`
For App Store Connect API (publishing only):
```bash
APP_STORE_CONNECT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n-----END PRIVATE KEY-----"
APP_STORE_CONNECT_KEY_ID="ABC123DEFG"
APP_STORE_CONNECT_ISSUER_ID="12345678-1234-1234-1234-123456789012"
APP_STORE_CONNECT_KEY_IDENTIFIER="ABC123DEFG"
```

### Group 2: `ios_signing`
For code signing (building):
```bash
CERTIFICATE_PRIVATE_KEY="LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t..."  # Base64 encoded .p12
CERTIFICATE_PASSWORD="your_secure_password"
PROVISIONING_PROFILE="LS0tLS1CRUdJTiBQUk9WSVNJT05JTkcgUFJPRklMRS0tLS0t..."  # Base64 encoded .mobileprovision
BUNDLE_ID="tech.erconsulting.cinemind.app"
```

## Step-by-Step Setup

### 1. Create App Store Connect API Key
1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to **Users and Access** → **Keys** → **App Store Connect API**
3. Click **Generate API Key**
4. Configure:
   - **Name**: `Codemagic iOS Distribution`
   - **Access**: `App Manager` or `Admin`
   - **Apps**: Select your app or `All Apps`
5. Download the `.p8` file and note:
   - **Key ID** (10 characters)
   - **Issuer ID** (UUID format)

### 2. Create iOS Distribution Certificate
1. Open **Keychain Access**
2. **Certificate Assistant** → **Request a Certificate from a Certificate Authority**
3. Fill in:
   - **User Email**: Your Apple ID email
   - **Common Name**: `Codemagic iOS Distribution`
   - **Request is**: `Saved to disk`
4. Go to [Apple Developer Portal](https://developer.apple.com/account)
5. **Certificates, Identifiers & Profiles** → **Certificates**
6. Click **+** → **iOS Distribution (App Store and Ad Hoc)**
7. Upload your `.certSigningRequest` file
8. Download the `.cer` file
9. Install certificate in Keychain and export as `.p12` with password

### 3. Create Provisioning Profile
1. Go to **Certificates, Identifiers & Profiles** → **Profiles**
2. Click **+** → **App Store**
3. Configure:
   - **App ID**: `tech.erconsulting.cinemind.app`
   - **Certificate**: Your iOS Distribution certificate
   - **Name**: `CineMind App Store Distribution`
4. Download the `.mobileprovision` file

### 4. Convert Files to Base64

#### Convert Certificate (.p12):
```bash
base64 -i your_certificate.p12 -o certificate_base64.txt
cat certificate_base64.txt | tr -d '\n'
```

#### Convert Provisioning Profile (.mobileprovision):
```bash
base64 -i CineMind_App_Store_Distribution.mobileprovision -o profile_base64.txt
cat profile_base64.txt | tr -d '\n'
```

#### Convert App Store Connect Private Key (.p8):
```bash
base64 -i AuthKey_ABC123DEFG.p8 -o private_key_base64.txt
cat private_key_base64.txt | tr -d '\n'
```

### 5. Configure Codemagic Environment Variables

1. Go to your Codemagic project settings
2. Navigate to **Environment variables**
3. Create two groups:

#### Group: `app_store_credentials`
- `APP_STORE_CONNECT_PRIVATE_KEY` (from .p8 file, include `\n` for newlines)
- `APP_STORE_CONNECT_KEY_ID` (10-character string)
- `APP_STORE_CONNECT_ISSUER_ID` (UUID format)
- `APP_STORE_CONNECT_KEY_IDENTIFIER` (same as Key ID)

#### Group: `ios_signing`
- `CERTIFICATE_PRIVATE_KEY` (base64 encoded .p12)
- `CERTIFICATE_PASSWORD` (your certificate password)
- `PROVISIONING_PROFILE` (base64 encoded .mobileprovision)
- `BUNDLE_ID` (tech.erconsulting.cinemind.app)

### 6. Update codemagic.yaml

Replace your current `codemagic.yaml` with the content from `codemagic-working.yaml`:

```bash
cp codemagic-working.yaml codemagic.yaml
```

## Key Differences from Previous Configuration

1. **Uses two environment variable groups**:
   - `app_store_credentials` for publishing
   - `ios_signing` for code signing

2. **Manual code signing setup**:
   - Creates keychain manually
   - Imports certificate and provisioning profile
   - Uses manual signing in Xcode build

3. **App Store Connect API for publishing**:
   - Uses API key for TestFlight submission
   - No integration block needed

4. **Proven approach**:
   - Based on working configuration from another app
   - Uses traditional iOS signing workflow

## Testing the Build

1. Commit and push the updated configuration:
   ```bash
   git add codemagic-working.yaml
   git commit -m "Add working Codemagic configuration"
   git push origin main
   ```

2. In Codemagic:
   - Go to your project
   - Click **Start new build**
   - Select the `ios-workflow`
   - Monitor build logs

## Troubleshooting

### Common Issues:

1. **Certificate import fails**:
   - Check certificate password is correct
   - Ensure certificate is for iOS Distribution
   - Verify certificate is not expired

2. **Provisioning profile issues**:
   - Ensure profile includes your bundle ID
   - Check profile is for App Store distribution
   - Verify profile includes your certificate

3. **App Store Connect API issues**:
   - Check API key permissions
   - Verify Key ID and Issuer ID are correct
   - Ensure private key format includes `\n` for newlines

### Debug Commands:

```bash
# Check available certificates
security find-identity -v -p codesigning build.keychain

# List provisioning profiles
ls -la ~/Library/MobileDevice/Provisioning\ Profiles/

# Verify bundle ID in profile
security cms -D -i ~/Library/MobileDevice/Provisioning\ Profiles/your_profile.mobileprovision
```

## Security Notes

- Never commit certificates or keys to Git
- Use strong passwords for certificates
- Rotate API keys regularly
- Use environment variables for all sensitive data

This configuration should work reliably for iOS builds and TestFlight distribution! 🚀
