import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  textSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  largeTouchTargets: boolean;
  voiceOver: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: any) => void;
  resetToDefaults: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const defaultSettings: AccessibilitySettings = {
  textSize: 1,
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  largeTouchTargets: false,
  voiceOver: false,
};

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }

    // Check system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setSettings(prev => ({
      ...prev,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
    }));
  }, []);

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
    
    // Apply settings to document
    applyAccessibilitySettings(newSettings);
  };

  const applyAccessibilitySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Apply text size
    root.style.setProperty('--text-scale', newSettings.textSize.toString());
    
    // Apply high contrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Apply large touch targets
    if (newSettings.largeTouchTargets) {
      root.classList.add('large-touch-targets');
    } else {
      root.classList.remove('large-touch-targets');
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
    applyAccessibilitySettings(defaultSettings);
  };

  // Apply settings on mount and when they change
  useEffect(() => {
    applyAccessibilitySettings(settings);
  }, [settings]);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetToDefaults }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
