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
      console.log('Native sensors initialized');
    } catch (error) {
      console.error('Failed to initialize native sensors:', error);
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
      console.error('Permission request failed:', error);
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
      console.error('Haptic feedback failed:', error);
    }
  }

  async getDeviceInfo() {
    if (!this.isNative) return null;

    try {
      const info = await Device.getInfo();
      return info;
    } catch (error) {
      console.error('Failed to get device info:', error);
      return null;
    }
  }

  async getNetworkStatus() {
    if (!this.isNative) return null;

    try {
      const status = await Network.getStatus();
      return status;
    } catch (error) {
      console.error('Failed to get network status:', error);
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
      console.error('Failed to show notification:', error);
    }
  }

  async checkAppState() {
    if (!this.isNative) return 'active';

    try {
      const state = await App.getState();
      return state.isActive ? 'active' : 'background';
    } catch (error) {
      console.error('Failed to check app state:', error);
      return 'unknown';
    }
  }
}

export const nativeSensorService = new NativeSensorService();