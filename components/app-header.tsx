"use client"

import Image from "next/image"
import { ArrowLeft, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AppHeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export function AppHeader({ title, showBack, onBack }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        {showBack ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 text-foreground"
            aria-label="戻る"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : null}
        <div className="flex items-center gap-2">
          <Image
            src="/icons/go-logo.png"
            alt="GO"
            width={36}
            height={36}
            className="rounded-lg"
          />
          {title ? (
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
          ) : (
            <h1 className="text-lg font-bold text-primary">タスク管理</h1>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 text-muted-foreground"
        aria-label="通知"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
      </Button>
    </header>
  )
}
