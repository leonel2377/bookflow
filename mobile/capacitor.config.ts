import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "online.stkmsoft.bookflow",
  appName: "BOOKFLOW",
  webDir: "../public",
  server: {
    url: "https://stkmsoft.online/fr",
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#faf9f7",
      showSpinner: false,
    },
  },
};

export default config;
