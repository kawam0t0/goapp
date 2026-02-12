"use client"

import React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    direction: "vertical" | "horizontal"
    color?: string
  }) => void
}

const LIST_COLORS = [
  { value: "#1E4B9E", label: "ブルー" },
  { value: "#2E7D32", label: "グリーン" },
  { value: "#E65100", label: "オレンジ" },
  { value: "#C62828", label: "レッド" },
  { value: "#6A1B9A", label: "パープル" },
  { value: "#00838F", label: "ティール" },
]

export function CreateListDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateListDialogProps) {
  const [title, setTitle] = useState("")
  const [direction, setDirection] = useState<"vertical" | "horizontal">(
    "vertical",
  )
  const [color, setColor] = useState(LIST_COLORS[0].value)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title: title.trim(), direction, color })
    setTitle("")
    setDirection("vertical")
    setColor(LIST_COLORS[0].value)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">新規リスト</DialogTitle>
          <DialogDescription>
            このプロジェクトに新しいタスクリストを追加します。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="listTitle" className="text-card-foreground">リスト名</Label>
            <Input
              id="listTitle"
              placeholder="例: 内装デザイン"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-card-foreground">カードの配置</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={direction === "vertical" ? "default" : "outline"}
                className={
                  direction === "vertical"
                    ? "flex-1 bg-primary text-primary-foreground"
                    : "flex-1"
                }
                onClick={() => setDirection("vertical")}
              >
                縦並び
              </Button>
              <Button
                type="button"
                variant={direction === "horizontal" ? "default" : "outline"}
                className={
                  direction === "horizontal"
                    ? "flex-1 bg-primary text-primary-foreground"
                    : "flex-1"
                }
                onClick={() => setDirection("horizontal")}
              >
                横並び
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {direction === "vertical"
                ? "カードが縦方向に並びます"
                : "カードが横方向にスクロールします"}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-card-foreground">カラー</Label>
            <div className="flex gap-2">
              {LIST_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${
                    color === c.value
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setColor(c.value)}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              作成する
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
