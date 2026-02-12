"use client"

import { useRef, useEffect, useState } from "react"
import {
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { TaskCard as TaskCardType, Member } from "@/lib/types"
import { findMember, getMemberColor } from "@/lib/member-colors"

interface TaskCardProps {
  card: TaskCardType
  members: Member[]
  onStatusChange: (status: "todo" | "done") => void
  onDelete: () => void
  onClick: () => void
}

const statusConfig = {
  todo: {
    icon: Circle,
    label: "未着手",
    className: "text-muted-foreground",
  },
  done: {
    icon: CheckCircle2,
    label: "完了",
    className: "text-success",
  },
}

function AutoShrinkTitle({
  text,
  done,
}: {
  text: string
  done: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [fontSize, setFontSize] = useState(11)

  useEffect(() => {
    const container = containerRef.current
    const textEl = textRef.current
    if (!container || !textEl) return

    let size = 11
    textEl.style.fontSize = `${size}px`

    while (
      (textEl.scrollWidth > container.clientWidth ||
        textEl.scrollHeight > container.clientHeight) &&
      size > 7
    ) {
      size -= 0.5
      textEl.style.fontSize = `${size}px`
    }
    setFontSize(size)
  }, [text])

  return (
    <div
      ref={containerRef}
      className="h-[1.5rem] w-full overflow-hidden flex items-center"
    >
      <span
        ref={textRef}
        className={`font-semibold leading-tight line-clamp-2 break-all ${
          done ? "line-through text-muted-foreground" : "text-card-foreground"
        }`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {text}
      </span>
    </div>
  )
}

export function TaskCardComponent({
  card,
  members,
  onStatusChange,
  onDelete,
  onClick,
}: TaskCardProps) {
  const status = statusConfig[card.status] || statusConfig.todo
  const StatusIcon = status.icon
  const member = card.assignee ? findMember(members, card.assignee) : null
  const memberColor = member ? getMemberColor(member.color) : null

  return (
    <div
      className="group cursor-grab active:cursor-grabbing rounded-md border border-border bg-card p-1.5 shadow-sm transition-shadow hover:shadow-md hover:border-primary/20 h-[52px] flex flex-col justify-between overflow-hidden"
      onClick={onClick}
    >
      {/* Top row: status icon + title + menu */}
      <div className="flex items-start gap-1 min-w-0">
        <button
          type="button"
          className={`mt-0.5 shrink-0 ${status.className}`}
          onClick={(e) => {
            e.stopPropagation()
            const next = card.status === "todo" ? "done" : "todo"
            onStatusChange(next)
          }}
          aria-label={`ステータスを変更: ${status.label}`}
        >
          <StatusIcon className="h-3 w-3" />
        </button>
        <div className="flex-1 min-w-0">
          <AutoShrinkTitle text={card.title} done={card.status === "done"} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onStatusChange("todo")
              }}
            >
              <Circle className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              未着手
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onStatusChange("done")
              }}
            >
              <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-success" />
              完了
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bottom row: assignee (colored) + due */}
      <div className="flex flex-wrap items-center gap-1">
        {card.assignee && memberColor ? (
          <span
            className={`inline-flex items-center gap-0.5 rounded-sm px-1 py-px text-[9px] font-medium ${memberColor.bg} ${memberColor.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${memberColor.dot}`} />
            {card.assignee}
          </span>
        ) : card.assignee ? (
          <span className="text-[9px] text-muted-foreground truncate max-w-[60px]">
            {card.assignee}
          </span>
        ) : null}
        {card.dueDate ? (
          <span className="text-[9px] text-muted-foreground">
            {new Date(card.dueDate).toLocaleDateString("ja-JP", {
              month: "numeric",
              day: "numeric",
            })}
          </span>
        ) : null}
      </div>
    </div>
  )
}
