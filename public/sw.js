// Service Worker for PWA notifications
self.addEventListener("install", (event) => {
  console.log("[v0] Service Worker installed")
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("[v0] Service Worker activated")
  event.waitUntil(clients.claim())
})

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || "GO Task Manager"
  const options = {
    body: data.body || "",
    icon: "/icons/go-logo.png",
    badge: "/icons/go-logo.png",
    data: data.data || {},
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/"),
  )
})
