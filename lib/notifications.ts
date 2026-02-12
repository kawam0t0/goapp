"use client"

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("[v0] This browser does not support notifications")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  return false
}

export async function registerServiceWorker(): Promise<
  ServiceWorkerRegistration | null
> {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      console.log("[v0] Service Worker registered:", registration)
      return registration
    } catch (error) {
      console.error("[v0] Service Worker registration failed:", error)
      return null
    }
  }
  return null
}

export function showLocalNotification(title: string, body: string) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icons/go-logo.png",
      badge: "/icons/go-logo.png",
    })
  }
}

export function checkDueDateNotifications(
  tasks: Array<{
    id: string
    title: string
    dueDate?: string
    status: string
  }>,
): void {
  const today = new Date()
  const threeDaysFromNow = new Date(today)
  threeDaysFromNow.setDate(today.getDate() + 3)

  tasks.forEach((task) => {
    if (task.status === "done" || !task.dueDate) return

    const dueDate = new Date(task.dueDate)
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    )

    if (daysUntilDue === 0) {
      showLocalNotification(
        "タスク期日: 本日",
        `「${task.title}」の期日は本日です`,
      )
    } else if (daysUntilDue > 0 && daysUntilDue <= 3) {
      showLocalNotification(
        "タスク期日が近づいています",
        `「${task.title}」の期日まで${daysUntilDue}日`,
      )
    } else if (daysUntilDue < 0) {
      showLocalNotification(
        "タスク期日超過",
        `「${task.title}」の期日を${Math.abs(daysUntilDue)}日過ぎています`,
      )
    }
  })
}
