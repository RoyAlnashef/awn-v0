const SPLASH_FADE_MS = 200
const FONTS_READY_TIMEOUT_MS = 4_000
const SPLASH_FALLBACK_TIMEOUT_MS = 15_000

let dismissPromise: Promise<void> | null = null

function waitForDocumentReady(): Promise<void> {
  if (document.readyState === "complete") {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true })
  })
}

function waitForFontsReady(): Promise<void> {
  if (!document.fonts?.ready) {
    return Promise.resolve()
  }

  return Promise.race([
    document.fonts.ready.then(() => undefined),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, FONTS_READY_TIMEOUT_MS)
    }),
  ])
}

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

async function hideSplashOnce(): Promise<void> {
  const { SplashScreen } = await import("@capacitor/splash-screen")
  await SplashScreen.hide({ fadeOutDuration: SPLASH_FADE_MS })
}

/**
 * Keeps the native splash visible until the WebView has loaded resources and
 * painted at least one frame (document complete + fonts + rAF).
 */
export function dismissSplashWhenReady(): Promise<void> {
  if (!dismissPromise) {
    dismissPromise = (async () => {
      await waitForDocumentReady()
      await waitForFontsReady()
      await waitForNextPaint()
      await hideSplashOnce()
    })()
  }

  return dismissPromise
}

export function scheduleSplashDismissWithFallback(): void {
  const fallbackId = window.setTimeout(() => {
    void dismissSplashWhenReady()
  }, SPLASH_FALLBACK_TIMEOUT_MS)

  void dismissSplashWhenReady().finally(() => {
    window.clearTimeout(fallbackId)
  })
}
