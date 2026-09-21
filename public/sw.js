self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("push", (event) => {
  if (!event.data) return

  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: "AWN", body: event.data.text() }
  }

  const title = data.title || "AWN"
  const url =
    typeof data.url === "string" && data.url.startsWith("/") ? data.url : "/"

  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/android-chrome-192x192.png",
      badge: "/android-chrome-192x192.png",
      tag: data.tag || "awn",
      renotify: false,
      data: { url },
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/"

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ("focus" in client) {
            client.focus()
            if ("navigate" in client) {
              client.navigate(url)
            }
            return
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      }),
  )
})
