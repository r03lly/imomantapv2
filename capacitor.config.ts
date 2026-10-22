import type { CapacitorConfig } from "@capacitor/cli";

// The app is server-rendered, so the native shell loads the deployed site.
// Set APP_URL to your Vercel address before running `npx cap sync android`.
const APP_URL = process.env.APP_URL || "https://GANTI-DENGAN-LINK-VERCEL.vercel.app";

const config: CapacitorConfig = {
  appId: "com.imomantap.app",
  appName: "IMO MANTAP",
  webDir: "public",
  server: {
    url: APP_URL,
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0f172a",
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: "#0f172a",
      style: "DARK",
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#2563eb",
    },
  },
};

export default config;
