# References for Capacitor Phase 1

## Similar Implementations

### awn-old Capacitor Setup

- **Location:** `_misc/awn-old/capacitor.config.ts`
- **Relevance:** The previous developer completed a fully functional Capacitor 7 integration. Native projects were generated and committed. App ID `com.awrightworld.awn` is established.
- **Key patterns borrowed:**
  - Remote URL mode (`server.url: 'https://awrightnetwork.com'`) — no static bundling
  - iOS background color `#0C0B09`, `scrollEnabled: false`, `contentInset: 'always'`
  - Android background color `#0C0B09`
  - StatusBar plugin config: `style: 'Dark'`, `backgroundColor: '#080807'`, `overlaysWebView: false`
  - PushNotifications `presentationOptions: ['badge', 'sound', 'alert']`
  - SplashScreen `launchShowDuration: 0` (instant dismiss)

### awn-old Android Project

- **Location:** `_misc/awn-old/android/`
- **Relevance:** Shows what a generated Android project looks like after `npx cap add android`. `MainActivity.java` extends `BridgeActivity`, Capacitor Gradle modules wired in.
- **Note:** We are generating fresh — not copying this.

### awn-old iOS Project

- **Location:** `_misc/awn-old/ios/App/`
- **Relevance:** Shows what a generated iOS project looks like after `npx cap add ios`. `AppDelegate.swift` imports Capacitor, standard Xcode structure.
- **Note:** We are generating fresh — not copying this.
