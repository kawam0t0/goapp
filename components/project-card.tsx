"use client"

import { CalendarDays, MoreHorizontal, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/types"

interface ProjectCardProps {
  project: Project
  progress: number
  onClick: () => void
  onDelete: () => void
}

function getDaysUntilOpen(openDate: string) {
  const now = new Date()
  const open = new Date(openDate)
  const diff = Math.ceil(
    (open.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  )
  return diff
}

function getStatusColor(days: number) {
  if (days < 0) return "bg-muted text-muted-foreground"
  if (days <= 30) return "bg-destructive text-destructive-foreground"
  if (days <= 90) return "bg-warning text-warning-foreground"
  return "bg-primary text-primary-foreground"
}

export function ProjectCard({
  project,
  progress,
  onClick,
  onDelete,
}: ProjectCardProps) {
  const daysLeft = getDaysUntilOpen(project.openDate)
  const statusColor = getStatusColor(daysLeft)
  const totalTasks = project.lists.reduce((acc, l) => acc + l.cards.length, 0)
  const doneTasks = project.lists.reduce(
    (acc, l) => acc + l.cards.filter((c) => c.status === "done").length,
    0,
  )

  return (
    <Card
      className="group cursor-pointer overflow-hidden border border-border bg-card transition-all hover:shadow-lg hover:border-primary/30"
      onClick={onClick}
    >
      <div className="h-2 w-full bg-primary" />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-card-foreground truncate">
              {project.title}
            </h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(project.openDate).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">
              {doneTasks}/{totalTasks} タスク
            </span>
            <span className="font-semibold text-card-foreground">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <Badge variant="secondary" className={`text-xs ${statusColor}`}>
            {daysLeft < 0
              ? "OPEN済み"
              : daysLeft === 0
                ? "本日OPEN"
                : `OPENまで${daysLeft}日`}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
