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
import { Textarea } from "@/components/ui/textarea"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    openDate: string
    description?: string
  }) => void
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateProjectDialogProps) {
  const [title, setTitle] = useState("")
  const [openDate, setOpenDate] = useState("")
  const [description, setDescription] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !openDate) return
    onSubmit({
      title: title.trim(),
      openDate,
      description: description.trim() || undefined,
    })
    setTitle("")
    setOpenDate("")
    setDescription("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">新規プロジェクト</DialogTitle>
          <DialogDescription>
            新しいOPEN準備プロジェクトを作成します。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-card-foreground">プロジェクト名</Label>
            <Input
              id="title"
              placeholder="例: 名古屋新店舗OPEN"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="openDate" className="text-card-foreground">OPEN日</Label>
            <Input
              id="openDate"
              type="date"
              value={openDate}
              onChange={(e) => setOpenDate(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-card-foreground">説明</Label>
            <Textarea
              id="description"
              placeholder="プロジェクトの説明（任意）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
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
