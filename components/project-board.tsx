"use client"

import { useState, useCallback } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AppHeader } from "@/components/app-header"
import { TaskListComponent } from "@/components/task-list"
import { CreateListDialog } from "@/components/create-list-dialog"
import { CreateCardDialog } from "@/components/create-card-dialog"
import { CardDetailDialog } from "@/components/card-detail-dialog"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import type { Project, TaskCard, Member } from "@/lib/types"

interface ProjectBoardProps {
  project: Project
  members: Member[]
  progress: number
  isLoading?: boolean
  onBack: () => void
  onAddList: (data: {
    title: string
    direction: "vertical" | "horizontal"
    color?: string
  }) => void
  onDeleteList: (listId: string) => void
  onToggleListDirection: (listId: string) => void
  onAddCard: (
    listId: string,
    data: {
      title: string
      description?: string
      assignee?: string
      dueDate?: string
    },
  ) => void
  onCardStatusChange: (
    listId: string,
    cardId: string,
    status: TaskCard["status"],
  ) => void
  onCardDelete: (listId: string, cardId: string) => void
  onCardUpdate: (
    listId: string,
    cardId: string,
    data: Partial<Omit<TaskCard, "id" | "createdAt">>,
  ) => void
  onMoveCard: (
    sourceListId: string,
    cardId: string,
    targetListId: string,
    sourceIndex: number,
    destIndex: number,
  ) => void
}

export function ProjectBoard({
  project,
  members,
  progress,
  isLoading,
  onBack,
  onAddList,
  onDeleteList,
  onToggleListDirection,
  onAddCard,
  onCardStatusChange,
  onCardDelete,
  onCardUpdate,
  onMoveCard,
}: ProjectBoardProps) {
  const [showListDialog, setShowListDialog] = useState(false)
  const [cardDialogListId, setCardDialogListId] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<{
    card: TaskCard
    listId: string
  } | null>(null)

  const activeListForCardDialog = project.lists.find(
    (l) => l.id === cardDialogListId,
  )

  const totalTasks = project.lists.reduce((acc, l) => acc + l.cards.length, 0)
  const doneTasks = project.lists.reduce(
    (acc, l) => acc + l.cards.filter((c) => c.status === "done").length,
    0,
  )

  const daysLeft = Math.ceil(
    (new Date(project.openDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  )

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result
      if (!destination) return
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return

      onMoveCard(
        source.droppableId,
        draggableId,
        destination.droppableId,
        source.index,
        destination.index,
      )
    },
    [onMoveCard],
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader title={project.title} showBack onBack={onBack} />

      {/* Project summary bar */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">OPEN:</span>
            <span className="font-semibold text-card-foreground">
              {new Date(project.openDate).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-xs text-muted-foreground">
              ({daysLeft > 0 ? `あと${daysLeft}日` : "経過済み"})
            </span>
          </div>
        </div>
      </div>

      {/* Board content with DragDropContext */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">タスクを読み込み中...</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {project.lists.map((list) => (
              <TaskListComponent
                key={list.id}
                list={list}
                members={members}
                onAddCard={() => setCardDialogListId(list.id)}
                onDeleteList={() => onDeleteList(list.id)}
                onToggleDirection={() => onToggleListDirection(list.id)}
                onCardStatusChange={(cardId, status) =>
                  onCardStatusChange(list.id, cardId, status)
                }
                onCardDelete={(cardId) => onCardDelete(list.id, cardId)}
                onCardClick={(card) =>
                  setSelectedCard({ card, listId: list.id })
                }
              />
            ))}

            {/* Add list button */}
            <button
              type="button"
              onClick={() => setShowListDialog(true)}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-12 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
            >
              <Plus className="h-5 w-5" />
              リストを追加
            </button>
          </div>
          )}
        </div>
      </DragDropContext>

      {/* Bottom add button for mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          size="lg"
          onClick={() => setShowListDialog(true)}
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          aria-label="リストを追加"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Dialogs */}
      <CreateListDialog
        open={showListDialog}
        onOpenChange={setShowListDialog}
        onSubmit={onAddList}
      />

      {activeListForCardDialog && (
        <CreateCardDialog
          open={!!cardDialogListId}
          onOpenChange={(open) => {
            if (!open) setCardDialogListId(null)
          }}
          listTitle={activeListForCardDialog.title}
          members={members}
          onSubmit={(data) => {
            if (cardDialogListId) {
              onAddCard(cardDialogListId, data)
              setCardDialogListId(null)
            }
          }}
        />
      )}

      <CardDetailDialog
        card={selectedCard?.card ?? null}
        open={!!selectedCard}
        members={members}
        onOpenChange={(open) => {
          if (!open) setSelectedCard(null)
        }}
        onStatusChange={(status) => {
          if (selectedCard) {
            onCardStatusChange(
              selectedCard.listId,
              selectedCard.card.id,
              status,
            )
            setSelectedCard({
              ...selectedCard,
              card: { ...selectedCard.card, status },
            })
          }
        }}
        onUpdateCard={(data) => {
          if (selectedCard) {
            onCardUpdate(
              selectedCard.listId,
              selectedCard.card.id,
              data,
            )
            setSelectedCard({
              ...selectedCard,
              card: { ...selectedCard.card, ...data },
            })
          }
        }}
      />
    </div>
  )
}
