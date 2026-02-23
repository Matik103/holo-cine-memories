import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
  AdmobConsentStatus,
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// CineMind AdMob App ID: ca-app-pub-8581598902448403~3787278014 (set in iOS Info.plist)
// Ad unit IDs (iOS)
const BANNER_AD_UNIT_ID_IOS = 'ca-app-pub-8581598902448403/4898372646';
const INTERSTITIAL_AD_UNIT_ID_IOS = 'ca-app-pub-8581598902448403/8229085908';
const REWARDED_AD_UNIT_ID_IOS = 'ca-app-pub-8581598902448403/9791606676';

export class AdMobService {
  private static initialized = false;
  private static consentRequested = false;

  static async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;
    if (this.initialized) return;
    await AdMob.initialize();
    this.initialized = true;
  }

  static async requestConsentInfo(): Promise<{ consentStatus: string; consentRequired: boolean }> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      return { consentStatus: 'notRequired', consentRequired: false };
    }
    if (this.consentRequested) return { consentStatus: 'obtained', consentRequired: false };
    this.consentRequested = true;
    try {
      const consentInfo = await AdMob.requestConsentInfo();
      if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
        const updated = await AdMob.showConsentForm();
        return { consentStatus: updated.status, consentRequired: updated.status === AdmobConsentStatus.REQUIRED };
      }
      return { consentStatus: consentInfo.status, consentRequired: consentInfo.status === AdmobConsentStatus.REQUIRED };
    } catch {
      return { consentStatus: 'unknown', consentRequired: false };
    }
  }

  static async showBanner(position: 'top' | 'bottom' = 'bottom', adUnitId?: string): Promise<void> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;
    if (!this.initialized) await this.initialize();
    const adId = adUnitId ?? BANNER_AD_UNIT_ID_IOS;
    await AdMob.showBanner({
      adId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: position === 'top' ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
    });
  }

  static async hideBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;
    await AdMob.hideBanner();
  }

  static async removeBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;
    await AdMob.removeBanner();
  }

  static async loadInterstitial(adUnitId?: string): Promise<void> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;
    if (!this.initialized) await this.initialize();
    const ref: { h1: { remove: () => void } | null; h2: { remove: () => void } | null } = { h1: null, h2: null };
    return new Promise((resolve, reject) => {
      const cleanup = (): void => { ref.h1?.remove(); ref.h2?.remove(); };
      void Promise.all([
        AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => { cleanup(); resolve(); }),
        AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (e: unknown) => { cleanup(); reject(e); }),
      ]).then(([a, b]) => { ref.h1 = a; ref.h2 = b; void AdMob.prepareInterstitial({ adId: adUnitId ?? INTERSTITIAL_AD_UNIT_ID_IOS }); });
    });
  }

  static async showInterstitial(): Promise<void> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;
    await AdMob.showInterstitial();
  }

  static async loadAndShowInterstitial(adUnitId?: string): Promise<void> {
    await this.loadInterstitial(adUnitId);
    setTimeout(() => this.showInterstitial(), 1000);
  }

  static async loadRewarded(adUnitId?: string): Promise<void> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;
    if (!this.initialized) await this.initialize();
    return new Promise((resolve, reject) => {
      AdMob.addListener(RewardAdPluginEvents.Loaded, () => resolve());
      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (e: unknown) => reject(e));
      AdMob.prepareRewardVideoAd({ adId: adUnitId ?? REWARDED_AD_UNIT_ID_IOS });
    });
  }

  static async showRewarded(adUnitId?: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return false;
    return new Promise((resolve) => {
      AdMob.addListener(RewardAdPluginEvents.Rewarded, () => resolve(true));
      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => resolve(false));
      AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => resolve(false));
      this.loadRewarded(adUnitId).catch(() => resolve(false));
      setTimeout(() => {
        AdMob.showRewardVideoAd().catch(() => resolve(false));
      }, 1000);
    });
  }
}

export const adMobService = {
  initialize: AdMobService.initialize.bind(AdMobService),
  requestConsentInfo: AdMobService.requestConsentInfo.bind(AdMobService),
  showBanner: AdMobService.showBanner.bind(AdMobService),
  hideBanner: AdMobService.hideBanner.bind(AdMobService),
  removeBanner: AdMobService.removeBanner.bind(AdMobService),
  loadInterstitial: AdMobService.loadInterstitial.bind(AdMobService),
  showInterstitial: AdMobService.showInterstitial.bind(AdMobService),
  loadAndShowInterstitial: AdMobService.loadAndShowInterstitial.bind(AdMobService),
  loadRewarded: AdMobService.loadRewarded.bind(AdMobService),
  showRewarded: AdMobService.showRewarded.bind(AdMobService),
};
