# AdMob + Capacitor iOS Setup (CineMind)

This app uses **Google AdMob** via `@capacitor-community/admob` with **App Tracking Transparency (ATT)** for App Store compliance.

## IDs (CineMind)

- **App ID:** `ca-app-pub-8581598902448403~3787278014`
- **Banner:** `ca-app-pub-8581598902448403/4898372646`
- **Interstitial:** `ca-app-pub-8581598902448403/8229085908`
- **Rewarded:** `ca-app-pub-8581598902448403/9791606676`

App ID is set in **iOS** `ios/App/App/Info.plist` (`GADApplicationIdentifier`). Ad unit IDs are in `src/services/adMobService.ts`.

## Checklist

1. **package.json** – `"@capacitor-community/admob": "^7.2.0"` → `npm install` → `npx cap sync ios`
2. **Podfile** – `pod 'CapacitorCommunityAdmob', :path => '../../node_modules/@capacitor-community/admob'` in `capacitor_pods` → `cd ios/App && pod install --repo-update` (ensure `LANG=en_US.UTF-8` if you see encoding errors)
3. **Info.plist** – `GADApplicationIdentifier`, `NSUserTrackingUsageDescription`, `GADIsAdManagerApp`, `SKAdNetworkItems`
4. **AppDelegate** – ATT request (no AdMob init; plugin uses Info.plist)
5. **adMobService.ts** – Banner / Interstitial / Rewarded ad unit IDs
6. **AdMobBanner.tsx** – Banner component
7. **App init** – `adMobService.initialize()` + `requestConsentInfo()` (e.g. in `MobileAppInit.tsx`)
8. **Pages** – `<AdMobBanner position="bottom" />`; `loadAndShowInterstitial()` / `showRewarded()` where needed

## Usage

- **Banner:** `<AdMobBanner position="bottom" autoShow={true} />`
- **Interstitial:** `await adMobService.loadAndShowInterstitial();`
- **Rewarded:** `const earned = await adMobService.showRewarded(); if (earned) { /* grant reward */ }`
