"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle2,
  Circle,
  CalendarDays,
  User,
  Pencil,
  Save,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TaskCard, Member, ChecklistItem } from "@/lib/types"
import { findMember, getMemberColor } from "@/lib/member-colors"
import { parseChecklist, serializeChecklist } from "@/lib/checklist-utils"

interface CardDetailDialogProps {
  card: TaskCard | null
  open: boolean
  members: Member[]
  onOpenChange: (open: boolean) => void
  onStatusChange: (status: TaskCard["status"]) => void
  onUpdateCard: (data: Partial<Omit<TaskCard, "id" | "createdAt">>) => void
}

export function CardDetailDialog({
  card,
  open,
  members,
  onOpenChange,
  onStatusChange,
  onUpdateCard,
}: CardDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignee, setAssignee] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])

  useEffect(() => {
    if (card) {
      setTitle(card.title)
      setDescription(card.description || "")
      setAssignee(card.assignee || "")
      setDueDate(card.dueDate || "")
      setChecklist(parseChecklist(card.description || ""))
      setIsEditing(false)
    }
  }, [card])

  if (!card) return null

  const handleChecklistToggle = (itemId: string) => {
    const newChecklist = checklist.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item,
    )
    setChecklist(newChecklist)
    // 即座にスプレッドシートに反映
    const updatedDescription = serializeChecklist(newChecklist)
    onUpdateCard({ description: updatedDescription })
  }

  const handleSave = () => {
    if (!title.trim()) return
    onUpdateCard({
      title: title.trim(),
      description: description.trim() || undefined,
      assignee: assignee || undefined,
      dueDate: dueDate || undefined,
    })
    setChecklist(parseChecklist(description))
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTitle(card.title)
    setDescription(card.description || "")
    setAssignee(card.assignee || "")
    setDueDate(card.dueDate || "")
    setChecklist(parseChecklist(card.description || ""))
    setIsEditing(false)
  }

  const member = card.assignee ? findMember(members, card.assignee) : null
  const memberColor = member ? getMemberColor(member.color) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {isEditing ? (
            <>
              <DialogTitle className="text-card-foreground">
                タスクを編集
              </DialogTitle>
              <DialogDescription>各項目を編集できます</DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle className="text-card-foreground">
                {card.title}
              </DialogTitle>
              <DialogDescription>タスクの詳細</DialogDescription>
            </>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {isEditing ? (
            /* --- Edit mode --- */
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-title" className="text-card-foreground">
                  タスク名
                </Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="タスク名"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-desc" className="text-card-foreground">
                  説明
                </Label>
                <Textarea
                  id="edit-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="タスクの説明（任意）&#10;&#10;チェックリスト形式で入力する場合:&#10;・項目1&#10;・項目2&#10;・項目3"
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  「・」で始まる行はチェックリストとして表示されます
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
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
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-due" className="text-card-foreground">
                    期日
                  </Label>
                  <Input
                    id="edit-due"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  キャンセル
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  保存する
                </Button>
              </div>
            </>
          ) : (
            /* --- View mode --- */
            <>
              {checklist.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-card-foreground">
                    チェックリスト ({checklist.filter((i) => i.checked).length}/
                    {checklist.length})
                  </span>
                  <div className="flex flex-col gap-2 border border-border rounded-md p-3">
                    {checklist.map((item) => (
                      <div key={item.id} className="flex items-start gap-2">
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={() => handleChecklistToggle(item.id)}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor={item.id}
                          className={`flex-1 text-sm leading-relaxed cursor-pointer ${
                            item.checked
                              ? "line-through text-muted-foreground"
                              : "text-card-foreground"
                          }`}
                        >
                          {item.text}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : card.description ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                {card.assignee && memberColor ? (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-sm font-medium ${memberColor.bg} ${memberColor.text}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${memberColor.dot}`}
                    />
                    {card.assignee}
                  </span>
                ) : card.assignee ? (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    {card.assignee}
                  </span>
                ) : null}
                {card.dueDate && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(card.dueDate).toLocaleDateString("ja-JP")}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-card-foreground">
                  ステータス
                </span>
                <div className="flex gap-2">
                  <Button
                    variant={card.status === "todo" ? "default" : "outline"}
                    size="sm"
                    className={
                      card.status === "todo"
                        ? "bg-muted-foreground text-card"
                        : ""
                    }
                    onClick={() => onStatusChange("todo")}
                  >
                    <Circle className="mr-1.5 h-3.5 w-3.5" />
                    未着手
                  </Button>
                  <Button
                    variant={card.status === "done" ? "default" : "outline"}
                    size="sm"
                    className={
                      card.status === "done"
                        ? "bg-success text-success-foreground"
                        : ""
                    }
                    onClick={() => onStatusChange("done")}
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    完了
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  作成日:{" "}
                  {new Date(card.createdAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  編集
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
