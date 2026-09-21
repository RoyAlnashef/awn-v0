# AWN Mobile Deployment Strategy
**Report Date:** September 21, 2026  
**Scope:** iOS & Android deployment options for AWN v0 (Next.js 16 / React 19)  
**Author:** AI Research Agent

---

## 1. What Capacitor Progress Was Made in the Old App

The previous developer completed a **fully functional Capacitor 7 integration** in `_misc/awn-old`. This was not a prototype — both native projects were generated and committed. Here is exactly what was in place:

### Configuration (`capacitor.config.ts`)
```ts
appId: 'com.awrightworld.awn'
appName: 'AWN'
server.url: 'https://awrightnetwork.com'   // Remote URL mode — no static bundling
server.androidScheme: 'https'
ios.backgroundColor: '#0C0B09'
android.backgroundColor: '#0C0B09'
```

The shell used **remote URL loading**: the native app is literally a branded container that loads the live production website. This is the fastest path to the App Store and the easiest to maintain — deploying a web update instantly updates the app without App Store review.

### Plugins Installed & Configured
| Plugin | Version | Purpose |
|---|---|---|
| `@capacitor/core` | ^7.0.0 | Bridge runtime |
| `@capacitor/ios` | ^7.0.0 | iOS native project |
| `@capacitor/android` | ^7.0.0 | Android native project |
| `@capacitor/app` | ^7.0.0 | App lifecycle events (background/foreground) |
| `@capacitor/haptics` | ^7.0.0 | Vibration / haptic feedback |
| `@capacitor/push-notifications` | ^7.0.0 | Native push (APNs + FCM) |
| `@capacitor/status-bar` | ^7.0.0 | Status bar style + color |
| `@capacitor/cli` | ^7.0.0 | Build tooling |

### Native Projects Generated
- **`android/`** — Full Gradle project with `MainActivity.java` extending `BridgeActivity`, `google-services.json` present (FCM), and Capacitor Gradle modules wired in
- **`ios/App/`** — Full Xcode project with `AppDelegate.swift` importing Capacitor, standard iOS project structure intact

### Status Bar & Push Notifications Were Configured
```ts
StatusBar: { style: 'Dark', backgroundColor: '#080807', overlaysWebView: false }
PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] }
```

### What Was NOT Done
- No custom native plugins were written (no Swift/Kotlin business logic)
- No App Store or Play Store submissions were made (no evidence of build signing)
- The splash screen plugin was referenced in config but `@capacitor/splash-screen` was not in the package.json (minor inconsistency)
- No CI/CD pipeline for native builds was set up
- No deep link or Universal Link configuration

**Summary:** The old app got to ~80% of the "ready to submit" line. The native projects exist, the plugins are wired, the app ID is registered. What remains is signing credentials, final build testing, and store submission — all of which are process/account steps, not code.

---

## 2. Current AWN v0 Stack Assessment

AWN v0 is a **Next.js 16 App Router** application with the following characteristics relevant to mobile deployment:

| Factor | Detail | Mobile Impact |
|---|---|---|
| Framework | Next.js 16 (App Router) | Requires static export OR remote URL mode for Capacitor |
| Styling | Tailwind CSS 4 | Works perfectly in WebView |
| Animations | Framer Motion (CSS/JS) | Works perfectly in WebView |
| Background FX | `@paper-design/shaders-react` MeshGradient | WebGL/canvas — works in iOS/Android WebView |
| Backend | Supabase (Realtime + Auth + Storage) | Works fine in WebView |
| Maps | Mapbox GL | Works in WebView |
| Push Notifications | Web Push / VAPID planned | ⚠️ Does NOT work in iOS WKWebView |
| Image optimization | `images.unoptimized: true` in config | Good — no Next/Image server dependency |
| Auth | Supabase SSR + cookies | Remote URL mode handles this cleanly |

### ⚠️ Technical Flag for Mobile

**Push Notifications**  
The current tech stack doc plans **VAPID (Web Push API)** for browser push notifications. Web Push does not work inside a Capacitor WKWebView on iOS. If AWN has Capacitor native apps, push notifications must be implemented using `@capacitor/push-notifications` (which uses Apple Push Notification Service + Firebase Cloud Messaging) — not the browser Web Push API. Android WebView does support Web Push in some configurations, but native FCM via the Capacitor plugin is more reliable. This is a **required change** if Capacitor is chosen.

### What's Already in Good Shape
- `images.unoptimized: true` is set — means no Next.js image optimization server is needed, which is critical for static or remote-URL Capacitor builds
- Server Actions are used, but in remote URL mode Capacitor simply calls the live Vercel deployment, so these work as-is
- No Capacitor code exists yet in v0 — clean slate, no conflicts

---

## 3. Tool Options Compared

### Option A — Capacitor (Recommended ✅)
**What it is:** A thin native shell (maintained by Ionic) that wraps your existing web app in a WKWebView (iOS) or WebView (Android), providing a plugin bridge to native device APIs.

**How it works for AWN:** Identical to the old app approach. The native app shell loads `https://awrightnetwork.com`. Deploying a web update to Vercel instantly updates the app. App Store submission is done once; subsequent changes go through the web.

**Why it fits AWN:**
- AWN is a **professional network / community app** — not a game, not a feed requiring 60fps scroll. The primary interactions are profile pages, messaging, job cards, check-ins, and settings. These are all WebView-appropriate.
- The team already has a working reference implementation in `_misc/awn-old`. Copying and re-pointing the Capacitor config at v0's production URL is a matter of hours, not weeks.
- The old app had the same app ID (`com.awrightworld.awn`) — continuity is preserved.
- The core AWN user base is small and invite-only. Native feel is desirable but not the primary competitive differentiator.

**Migration effort:** Low (~1–3 days to get v0 to build parity with old Capacitor setup)

**Limitations:**
- WebView can feel slightly less "native" (scroll physics, transitions)
- No automatic OTA update for plugin-level or native code changes
- iOS push requires switching from VAPID to `@capacitor/push-notifications`

**Best for:** Speed to App Store, single codebase, small team maintenance burden

---

### Option B — PWA Only (No App Store)
**What it is:** A Progressive Web App installable from the browser via "Add to Home Screen."

**How it works for AWN:** Users visit `awrightnetwork.com` in Safari/Chrome, are prompted to install. The app appears on the home screen like a native app.

**Why it may be insufficient for AWN:**
- Apple heavily restricts PWAs on iOS — no background push notifications (this changed partially in iOS 16.4+, but behavior is still inconsistent), limited storage, no APNs integration
- App Store presence is a trust and discoverability signal. An invite-only professional network benefits from App Store listings.
- Not submittable to app stores, so "install from app store" CTA is unavailable

**Migration effort:** Already partially done (PWA icons are in `/public`, `apple-touch-icon.png` exists). Remaining: add `manifest.webmanifest`, service worker, and `<link rel="manifest">` to `layout.tsx`.

**Best for:** Supplement to Capacitor apps, not a replacement for iOS/Android presence

---

### Option C — Expo (React Native)
**What it is:** The leading React Native platform. Expo Router mirrors Next.js App Router conventions; Expo builds native iOS/Android apps that render using actual native UI components (not a WebView).

**Why it doesn't fit AWN right now:**
- **Would require rewriting the UI.** React Native uses `<View>`, `<Text>`, `<FlatList>` etc. — not `<div>`, `<p>`, Tailwind CSS classes, or shadcn components. The entire component library in `components/` would need to be ported.
- `@react-three/fiber`, Three.js, and `@paper-design/shaders-react` have no React Native equivalents. Shader backgrounds would need to be rebuilt or dropped.
- Best suited for a from-scratch mobile build, not wrapping an existing web app.

**Migration effort:** Extremely high (months). Essentially building a second app.

**Best for:** If AWN ever needs to compete on consumer-grade animation and native feel (TikTok/Instagram level). Not right for current stage.

---

### Option D — Tauri 2 Mobile
**What it is:** Tauri is a Rust-based runtime for apps. Tauri 2 added mobile (iOS/Android) support, using the system WebView (same as Capacitor) but with a Rust backend instead of a native plugin bridge.

**Why it's not right for AWN:**
- Tauri mobile is less mature than Capacitor. Plugin ecosystem is much smaller.
- Rust knowledge required for any native functionality.
- App Store submission experience is thinner — fewer battle-tested examples.
- Capacitor is specifically designed for the "web app → App Store" workflow that AWN needs.
- No benefit over Capacitor for AWN's use case.

**Best for:** Teams with Rust expertise building desktop + mobile apps where binary size matters.

---

### Option E — React Native WebView (manual)
**What it is:** Building a bare React Native app with a single `<WebView>` component pointing to your URL — essentially doing by hand what Capacitor automates.

**Why it's worse than Capacitor:**
- You'd lose all of Capacitor's plugin ecosystem (push, haptics, status bar, etc.)
- More boilerplate for less capability
- Capacitor is the maintained, modern successor to this pattern

**Best for:** Nothing — Capacitor obsoletes this approach.

---

## 4. Recommendation

**Use Capacitor.** Continue exactly where the old app left off.

The old developer made the right call, and the architecture hasn't changed: AWN is a web app hosted on Vercel, and Capacitor is the fastest, lowest-maintenance path to iOS and Android app stores for a web-first team.

### Recommended Implementation Plan

**Phase 1 — Wire up Capacitor (1–3 days)**
1. Copy `capacitor.config.ts` from `_misc/awn-old` into `awn-v0`, update any paths
2. Install the same Capacitor packages into `awn-v0`
3. Run `npx cap init` and `npx cap add ios` + `npx cap add android`
4. Point `server.url` at `https://awrightnetwork.com` (same as old app)
5. Verify dark background colors match current design (`#0C0B09`)

**Phase 2 — Replace VAPID Push with Capacitor Push (2–4 days)**
1. Install `@capacitor/push-notifications`
2. Create APNs key in Apple Developer portal, add to Xcode project
3. Set up Firebase project for Android FCM, add `google-services.json`
4. Implement a JavaScript bridge in the web app that calls Capacitor push APIs when running in native context (use `Capacitor.isNativePlatform()` guard)
5. Keep VAPID/Web Push for the browser PWA experience — these can coexist

**Phase 3 — Store Submission Setup (2–5 days)**
1. Enroll in Apple Developer Program ($99/yr) if not already active
2. Enroll in Google Play Console ($25 one-time) if not already active
3. Set up code signing in Xcode (provisioning profiles, certificates)
4. Create app listings in App Store Connect and Google Play Console
5. Generate screenshots and write store copy

---

## 5. Summary Comparison Table

| Factor | Capacitor | PWA Only | Expo/RN | Tauri 2 |
|---|---|---|---|---|
| Code reuse from v0 | ✅ 100% | ✅ 100% | ❌ Rewrite UI | ✅ 100% |
| App Store presence | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| Push notifications (iOS) | ✅ APNs plugin | ⚠️ Limited | ✅ Native | ⚠️ Limited plugin |
| Native feel | ⚠️ WebView | ⚠️ WebView | ✅ Native render | ⚠️ WebView |
| Team ramp-up | Low | Very Low | Very High | High (Rust) |
| Ecosystem maturity | ✅ High | ✅ Browser std | ✅ Very High | ⚠️ Medium |
| Time to App Store | ~1 week | N/A | Months | Unknown |
| Existing AWN progress | ✅ ~80% done | ⚠️ Partial | ❌ None | ❌ None |
| Ongoing maintenance | Low | Very Low | High (2 UIs) | Medium |
| **Verdict** | **✅ Recommended** | **Supplement** | **Future option** | **Not recommended** |

---

*For questions or next steps on implementation, see the Capacitor documentation at [capacitorjs.com/docs](https://capacitorjs.com/docs) and the existing native project in `_misc/awn-old/` for reference.*
