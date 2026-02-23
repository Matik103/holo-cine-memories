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
    // Waze-style: resize view when keyboard opens so it doesn't overlap inputs (sign in/up and all forms)
    Keyboard: {
      resize: 'native', // WebView resizes so content scrolls up; works with Android adjustResize
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
