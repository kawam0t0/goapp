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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Member } from "@/lib/types"
import { getMemberColor } from "@/lib/member-colors"

interface CreateCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listTitle: string
  members: Member[]
  onSubmit: (data: {
    title: string
    description?: string
    assignee?: string
    dueDate?: string
  }) => void
}

export function CreateCardDialog({
  open,
  onOpenChange,
  listTitle,
  members,
  onSubmit,
}: CreateCardDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignee, setAssignee] = useState("")
  const [dueDate, setDueDate] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      assignee: assignee || undefined,
      dueDate: dueDate || undefined,
    })
    setTitle("")
    setDescription("")
    setAssignee("")
    setDueDate("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">新規タスク</DialogTitle>
          <DialogDescription>
            「{listTitle}」にタスクを追加します
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cardTitle" className="text-card-foreground">
              タスク名
            </Label>
            <Input
              id="cardTitle"
              placeholder="例: 家具を発注する"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cardDesc" className="text-card-foreground">
              説明
            </Label>
            <Textarea
              id="cardDesc"
              placeholder="タスクの詳細（任意）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label className="text-card-foreground">担当者</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => {
                    const c = getMemberColor(m.color)
                    return (
                      <SelectItem key={m.email} value={m.name}>
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${c.dot}`}
                          />
                          {m.name}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cardDue" className="text-card-foreground">
                期日
              </Label>
              <Input
                id="cardDue"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
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
