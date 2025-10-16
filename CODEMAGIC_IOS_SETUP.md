# Codemagic iOS Setup Guide

This guide explains how to configure Codemagic for iOS builds and deployments using the `app_store_credentials` group.

## Prerequisites

1. **Apple Developer Account** with App Store Connect access
2. **App Store Connect API Key** (recommended) or Distribution Certificate
3. **Codemagic Account** with access to the project

## Step 1: Create App Store Connect API Key (Recommended)

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to **Users and Access** → **Keys** → **App Store Connect API**
3. Click **Generate API Key** or **+** button
4. Fill in the details:
   - **Name**: `Codemagic iOS Build Key`
   - **Access**: **Developer** or **App Manager** (minimum required)
5. Download the `.p8` file and note the:
   - **Key ID** (10-character string)
   - **Issuer ID** (UUID format)

## Step 2: Configure Codemagic Environment Variables

1. Go to your Codemagic project settings
2. Navigate to **Environment variables**
3. Create a new group named: `app_store_credentials`
4. Add the following variables to this group:

### Required Variables:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `APP_STORE_CONNECT_ISSUER_ID` | Your App Store Connect API key issuer ID | `12345678-1234-1234-1234-123456789012` |
| `APP_STORE_CONNECT_KEY_IDENTIFIER` | Your App Store Connect API key ID | `ABC123DEF4` |
| `APP_STORE_CONNECT_PRIVATE_KEY` | The private key content from your .p8 file | `-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...` |

### Optional Variables:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `APP_STORE_CONNECT_SYNC_ISSUER_ID` | For syncing certificates (if different) | `12345678-1234-1234-1234-123456789012` |
| `APP_STORE_CONNECT_SYNC_KEY_IDENTIFIER` | For syncing certificates (if different) | `ABC123DEF4` |
| `APP_STORE_CONNECT_SYNC_PRIVATE_KEY` | For syncing certificates (if different) | `-----BEGIN PRIVATE KEY-----\n...` |

## Step 3: Configure App Store Connect Integration

1. In your Codemagic project settings
2. Go to **App Store Connect** section
3. Click **Add integration**
4. Select **App Store Connect API** as the authentication method
5. Enter your credentials:
   - **Issuer ID**: Your App Store Connect API key issuer ID
   - **Key ID**: Your App Store Connect API key ID
   - **Private Key**: Upload your `.p8` file or paste the content

## Step 4: Verify Bundle Identifier

Ensure your app's bundle identifier matches what's configured in:
- **Codemagic YAML**: `tech.erconsulting.cinemind.app`
- **Apple Developer Portal**: Must be registered
- **App Store Connect**: Must exist as an app

## Step 5: Test the Build

1. Commit and push the `codemagic.yaml` file to your repository
2. Go to Codemagic and start a new build
3. Select the `ios-workflow` workflow
4. Monitor the build logs for any issues

## Troubleshooting

### Common Issues:

1. **"No matching provisioning profiles found"**
   - Ensure the bundle identifier is correctly registered in Apple Developer Portal
   - Check that the App Store Connect API key has the correct permissions

2. **"Certificate not found"**
   - Verify the API key has the correct access level
   - Ensure the private key is properly formatted (including newlines)

3. **"Invalid bundle identifier"**
   - Double-check the bundle ID matches exactly in all places
   - Ensure the app exists in App Store Connect

### Debug Steps:

1. Check the build logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure the App Store Connect API key is not expired
4. Check that the bundle identifier is properly registered

## Security Notes

- Never commit API keys or certificates to your repository
- Use Codemagic's encrypted environment variables
- Regularly rotate your API keys
- Use the minimum required permissions for API keys

## Support

- [Codemagic Documentation](https://docs.codemagic.io/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Connect API Documentation](https://developer.apple.com/documentation/appstoreconnectapi)

