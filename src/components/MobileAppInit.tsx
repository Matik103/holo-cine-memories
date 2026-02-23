import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { adMobService } from '@/services/adMobService';

const MobileAppInit = () => {
  useEffect(() => {
    const initMobileApp = async () => {
      if (!Capacitor.isNativePlatform()) return;

      try {
        // Configure status bar
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#000000' });

        // Hide splash screen after initialization
        await SplashScreen.hide();

        // AdMob: initialize and request consent (ATT is requested in native AppDelegate)
        if (Capacitor.getPlatform() === 'ios') {
          await adMobService.initialize();
          await adMobService.requestConsentInfo();
        }

        // Handle app state changes
        App.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active?', isActive);
        });

        // Handle deep links
        App.addListener('appUrlOpen', (event) => {
          console.log('App opened with URL:', event.url);
        });

        console.log('Mobile app initialized successfully');
      } catch (error) {
        console.error('Mobile app initialization failed:', error);
      }
    };

    initMobileApp();

    return () => {
      if (Capacitor.isNativePlatform()) {
        App.removeAllListeners();
      }
    };
  }, []);

  return null;
};

export default MobileAppInit;