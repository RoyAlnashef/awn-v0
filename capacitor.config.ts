import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.awrightworld.awn.app",
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
    backgroundColor: "#120E0F",
    scrollEnabled: true,
    // Ensures boot script can detect the native shell via UA before the bridge loads.
    appendUserAgent: "CapacitorAWN",
  },
  android: {
    backgroundColor: "#120E0F",
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
      launchAutoHide: false,
      backgroundColor: "#120E0F",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
