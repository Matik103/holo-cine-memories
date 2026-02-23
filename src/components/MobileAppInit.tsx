import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { adMobService } from '@/services/adMobService';

/** Scroll the focused input/textarea into view so the keyboard doesn't cover it (Waze-style). */
function scrollFocusedInputIntoView() {
  const el = document.activeElement;
  if (!el || !(el instanceof HTMLElement)) return;
  const tag = el.tagName.toLowerCase();
  const isEditable = tag === 'input' || tag === 'textarea' || el.isContentEditable;
  if (!isEditable) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.scrollIntoView({ block: 'center', behavior: 'smooth', inline: 'nearest' });
    });
  });
}

const MobileAppInit = () => {
  const keyboardCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const initMobileApp = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#000000' });
        await SplashScreen.hide();

        if (Capacitor.getPlatform() === 'ios') {
          await adMobService.initialize();
          await adMobService.requestConsentInfo();
        }

        const showHandler = () => setTimeout(scrollFocusedInputIntoView, 100);
        const showListener = await Keyboard.addListener('keyboardWillShow', showHandler);
        const showListenerDid = await Keyboard.addListener('keyboardDidShow', showHandler);
        keyboardCleanupRef.current = () => {
          showListener.remove();
          showListenerDid.remove();
        };

        App.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active?', isActive);
        });
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
      keyboardCleanupRef.current?.();
      keyboardCleanupRef.current = null;
      App.removeAllListeners();
    };
  }, []);

  return null;
};

export default MobileAppInit;