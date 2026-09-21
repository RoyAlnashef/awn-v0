"use client"

import { Button } from "@/components/ui/button"
import { isNativePlatform } from "@/lib/push/is-native-platform"

import { usePush } from "./push-provider"

export function PushSettingsButton() {
  const { native, web } = usePush()
  const onNative = isNativePlatform()

  const enabled = onNative ? native.enabled : web.enabled
  const loading = onNative ? native.loading : web.loading
  const error = onNative ? native.error : web.error

  async function handleClick() {
    if (onNative) {
      if (enabled) return
      await native.enableNativePush()
      return
    }

    if (enabled) {
      await web.disableWebPush()
      return
    }

    await web.enableWebPush()
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={loading || (onNative && enabled)}
        onClick={() => void handleClick()}
      >
        {loading
          ? "Working…"
          : enabled
            ? onNative
              ? "Push enabled"
              : "Disable push"
            : "Enable push"}
      </Button>
      {error ? (
        <p className="max-w-48 text-right text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
