import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onEuLflXqmQa.CineMind',
  appName: 'CineMind',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Development: Enable live reload from web server
    // url: 'https://88d4f441-d76a-4bff-92ae-6ed2a7ba0f0f.lovableproject.com?forceHideBadge=true',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false,
      androidSpinnerStyle: "small",
      iosSpinnerStyle: "small"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    }
  }
};

export default config;
