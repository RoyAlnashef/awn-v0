import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.awrightworld.awn",
  appName: "AWN",
  // Remote URL mode — the native shell loads the live production site.
  // webDir is required by the CLI for project generation but is never synced at runtime.
  webDir: "out",
  server: {
    url: "https://awrightnetwork.com",
    cleartext: false,
    androidScheme: "https",
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#0C0B09",
    scrollEnabled: true,
  },
  android: {
    backgroundColor: "#0C0B09",
  },
  plugins: {
    StatusBar: {
      style: "Dark",
      backgroundColor: "#080807",
      overlaysWebView: false,
    },
    PushNotifications: {
      // JS bridge to call these APIs is Phase 2.
      // Config is included here so the plugin is initialised correctly at launch.
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#0C0B09",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
