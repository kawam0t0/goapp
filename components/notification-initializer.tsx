"use client"

import { useEffect } from "react"
import {
  requestNotificationPermission,
  registerServiceWorker,
} from "@/lib/notifications"

export function NotificationInitializer() {
  useEffect(() => {
    const initNotifications = async () => {
      // Service Worker登録
      await registerServiceWorker()

      // 通知権限リクエスト（初回のみ）
      const hasPermission = await requestNotificationPermission()
      if (hasPermission) {
        console.log("[v0] Notification permission granted")
      }
    }

    initNotifications()
  }, [])

  return null
}