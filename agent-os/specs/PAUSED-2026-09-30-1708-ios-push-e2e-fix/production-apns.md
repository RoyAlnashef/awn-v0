# TestFlight and App Store — Production APNs

When moving beyond Xcode debug:

1. **Entitlements:** Set `aps-environment` to `production` in `ios/App/App/App.entitlements` (or use Xcode capability for release builds).
2. **Vercel:** Set `APNS_USE_SANDBOX=false` (or remove / use default from `.env.example`).
3. **Rebuild** release/TestFlight IPA and reinstall on device.
4. Re-verify token registration and dispatch (production APNs host: `api.push.apple.com`).

Debug builds with development tokens will fail against production APNs (`BadDeviceToken`). Keep sandbox and production env aligned with the build channel.

Per-category notification toggles in Settings remain deferred (Phase 2).
