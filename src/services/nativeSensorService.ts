import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';

class NativeSensorService {
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  async initialize() {
    if (!this.isNative) return;
    
    try {
      await this.requestPermissions();
    } catch (error) {
    }
  }

  async requestPermissions() {
    if (!this.isNative) return;

    try {
      // Request notification permissions
      await LocalNotifications.requestPermissions();
      
      // Motion permissions are auto-granted on iOS
      // No explicit permission needed
      
      return { granted: true };
    } catch (error) {
      return { granted: false };
    }
  }

  async triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'medium') {
    if (!this.isNative) return;

    try {
      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      }[style];

      await Haptics.impact({ style: impactStyle });
    } catch (error) {
    }
  }

  async getDeviceInfo() {
    if (!this.isNative) return null;

    try {
      const info = await Device.getInfo();
      return info;
    } catch (error) {
      return null;
    }
  }

  async getNetworkStatus() {
    if (!this.isNative) return null;

    try {
      const status = await Network.getStatus();
      return status;
    } catch (error) {
      return null;
    }
  }

  async showNotification(title: string, body: string) {
    if (!this.isNative) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) }
          }
        ]
      });
    } catch (error) {
    }
  }

  async checkAppState() {
    if (!this.isNative) return 'active';

    try {
      const state = await App.getState();
      return state.isActive ? 'active' : 'background';
    } catch (error) {
      return 'unknown';
    }
  }
}

export const nativeSensorService = new NativeSensorService();