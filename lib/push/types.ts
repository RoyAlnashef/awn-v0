export type PushPlatform = "ios" | "android" | "web"

export type NativePushSubscription = {
  type: "native"
  token: string
  platform: "ios" | "android"
}

export type WebPushSubscription = {
  type: "web"
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  expirationTime?: number | null
}

export type StoredPushSubscription = NativePushSubscription | WebPushSubscription

export type PushSubscriptionRow = {
  id: string
  user_id: string
  endpoint: string
  subscription: StoredPushSubscription | Record<string, unknown>
}

export type PushPayload = {
  title: string
  body: string
  url: string
  tag: string
}

export type DispatchResult = {
  sent: number
  total: number
  skipped?: boolean
  reason?: string
}

export type NotificationDispatchInput = {
  id: string
  user_id: string
  kind: string
  title: string
  body: string
  data: Record<string, unknown> | null
  room_id: string | null
}
