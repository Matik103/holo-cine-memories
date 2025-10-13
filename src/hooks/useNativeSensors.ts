import { useState, useEffect, useCallback } from 'react';
import { nativeSensorService } from '@/services/nativeSensorService';

export const useNativeSensors = () => {
  const [state, setState] = useState({
    isNative: false,
    permissions: { granted: false },
    deviceInfo: null,
    networkStatus: null,
    isInitialized: false
  });

  const initialize = useCallback(async () => {
    await nativeSensorService.initialize();
    
    const deviceInfo = await nativeSensorService.getDeviceInfo();
    const networkStatus = await nativeSensorService.getNetworkStatus();
    
    setState(prev => ({
      ...prev,
      isNative: nativeSensorService['isNative'],
      deviceInfo,
      networkStatus,
      isInitialized: true
    }));
  }, []);

  const requestPermissions = useCallback(async () => {
    const result = await nativeSensorService.requestPermissions();
    setState(prev => ({ ...prev, permissions: result }));
    return result;
  }, []);

  const triggerHapticFeedback = useCallback(
    async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      await nativeSensorService.triggerHaptic(style);
    },
    []
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    state,
    initialize,
    requestPermissions,
    triggerHapticFeedback,
    showNotification: nativeSensorService.showNotification.bind(nativeSensorService),
    checkAppState: nativeSensorService.checkAppState.bind(nativeSensorService)
  };
};