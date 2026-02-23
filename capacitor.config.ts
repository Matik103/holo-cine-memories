import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tech.erconsulting.cinem',
  appName: 'CineMind Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Development: Enable live reload from web server
    // url: 'http://localhost:8080',
    // cleartext: true
  },
  plugins: {
    // iOS: resize body when keyboard opens so the view shifts up and the user sees what they type (Waze-style)
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
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
