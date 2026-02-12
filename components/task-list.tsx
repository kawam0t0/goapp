"use client"

import { useState } from "react"
import {
  ArrowRightLeft,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Droppable, Draggable } from "@hello-pangea/dnd"
import { TaskCardComponent } from "@/components/task-card"
import type { TaskList as TaskListType, TaskCard, Member } from "@/lib/types"

interface TaskListProps {
  list: TaskListType
  members: Member[]
  onAddCard: () => void
  onDeleteList: () => void
  onToggleDirection: () => void
  onCardStatusChange: (cardId: string, status: TaskCard["status"]) => void
  onCardDelete: (cardId: string) => void
  onCardClick: (card: TaskCard) => void
}

export function TaskListComponent({
  list,
  members,
  onAddCard,
  onDeleteList,
  onToggleDirection,
  onCardStatusChange,
  onCardDelete,
  onCardClick,
}: TaskListProps) {
  const [collapsed, setCollapsed] = useState(false)
  const doneCount = list.cards.filter((c) => c.status === "done").length
  const totalCount = list.cards.length

  return (
    <div className="flex flex-col rounded-xl border border-border bg-muted/50 overflow-hidden">
      {/* List header with color bar */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: list.color || "hsl(var(--primary))" }}
      />
      <div className="flex items-center justify-between px-3 py-2">
        <button
          type="button"
          className="flex items-center gap-2 min-w-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          <h3 className="text-sm font-bold text-foreground truncate">
            {list.title}
          </h3>
          <span className="shrink-0 text-xs text-muted-foreground">
            {doneCount}/{totalCount}
          </span>
        </button>
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={onAddCard}
            aria-label="カードを追加"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onToggleDirection}>
                <ArrowRightLeft className="mr-2 h-3.5 w-3.5" />
                {list.direction === "vertical"
                  ? "横並びに切替"
                  : "縦並びに切替"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeleteList} className="text-destructive">
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                リストを削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards - Droppable area */}
      {!collapsed && (
        <Droppable
          droppableId={list.id}
          direction={list.direction === "horizontal" ? "horizontal" : "vertical"}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`px-2 pb-2 min-h-[60px] transition-colors rounded-b-xl ${
                snapshot.isDraggingOver ? "bg-primary/5" : ""
              } ${
                list.direction === "horizontal"
                  ? "flex gap-1.5 overflow-x-auto scrollbar-hide"
                  : "grid grid-cols-3 gap-1.5"
              }`}
            >
              {list.cards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={index}>
                  {(dragProvided, dragSnapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      className={
                        list.direction === "horizontal"
                          ? `min-w-[110px] w-[110px] shrink-0 ${dragSnapshot.isDragging ? "opacity-90 rotate-2 shadow-lg" : ""}`
                          : `${dragSnapshot.isDragging ? "opacity-90 rotate-2 shadow-lg" : ""}`
                      }
                    >
                      <TaskCardComponent
                        card={card}
                        members={members}
                        onStatusChange={(status) =>
                          onCardStatusChange(card.id, status)
                        }
                        onDelete={() => onCardDelete(card.id)}
                        onClick={() => {
                          if (!dragSnapshot.isDragging) {
                            onCardClick(card)
                          }
                        }}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {list.cards.length === 0 && !snapshot.isDraggingOver && (
                <button
                  type="button"
                  onClick={onAddCard}
                  className="col-span-3 flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border py-4 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  タスクを追加
                </button>
              )}
            </div>
          )}
        </Droppable>
      )}
    </div>
  )
}
