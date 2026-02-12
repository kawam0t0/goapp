"use client"

import { useState, useEffect } from "react"
import { ProjectGallery } from "@/components/project-gallery"
import { ProjectBoard } from "@/components/project-board"
import { useProjects, useMembers, useProjectTasks } from "@/lib/store"
import { toast } from "sonner"
import {
  showLocalNotification,
  checkDueDateNotifications,
} from "@/lib/notifications"

export default function Home() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  )
  const { members } = useMembers()
  const {
    projects,
    isLoading: projectsLoading,
    addProject,
    deleteProject,
  } = useProjects()

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  const {
    lists,
    isLoading: tasksLoading,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    recalculateProgress,
  } = useProjectTasks(selectedProjectId)

  // Inject loaded lists into selected project
  const projectWithLists = selectedProject
    ? { ...selectedProject, lists, progress: recalculateProgress(lists) }
    : null

  // 期日チェック通知（プロジェクト開いた時）
  useEffect(() => {
    if (!projectWithLists || tasksLoading) return
    const allTasks = projectWithLists.lists.flatMap((list) =>
      list.cards.map((card) => ({
        id: card.id,
        title: card.title,
        dueDate: card.dueDate,
        status: card.status,
      })),
    )
    checkDueDateNotifications(allTasks)
  }, [projectWithLists, tasksLoading])

  if (projectWithLists) {
    return (
      <ProjectBoard
        project={projectWithLists}
        members={members}
        progress={projectWithLists.progress}
        isLoading={tasksLoading}
        onBack={() => setSelectedProjectId(null)}
        onAddList={async (data) => {
          // 新リスト作成: ダミーのプレースホルダータスクを追加
          try {
            await addCard(data.title, {
              title: `${data.title}のタスクを追加してください`,
              description: "このプレースホルダーは削除して構いません",
            })
            toast.success("リストを作成しました")
          } catch {
            toast.error("リストの作成に失敗しました")
          }
        }}
        onDeleteList={async (listId) => {
          const list = lists.find((l) => l.id === listId)
          if (!list) return
          try {
            // リスト内の全タスクを削除
            for (const card of list.cards) {
              await deleteCard(card)
            }
            toast.success("リストを削除しました")
          } catch {
            toast.error("リストの削除に失敗しました")
          }
        }}
        onToggleListDirection={() => {
          toast.info("リストの方向切替は現在サポートされていません")
        }}
        onAddCard={async (listId, data) => {
          const list = lists.find((l) => l.id === listId)
          if (!list) return
          try {
            await addCard(list.title, data)
            toast.success("タスクを作成しました")
            // 担当者アサイン通知
            if (data.assignee) {
              showLocalNotification(
                "担当者がアサインされました",
                `「${data.title}」の担当者: ${data.assignee}`,
              )
            }
          } catch {
            toast.error("タスクの作成に失敗しました")
          }
        }}
        onCardStatusChange={async (listId, cardId, status) => {
          const list = lists.find((l) => l.id === listId)
          const card = list?.cards.find((c) => c.id === cardId)
          if (!list || !card) return
          try {
            await updateCard(card, { status }, list.title)
            if (status === "done") toast.success("タスクを完了しました")
          } catch {
            toast.error("ステータスの更新に失敗しました")
          }
        }}
        onCardDelete={async (listId, cardId) => {
          const list = lists.find((l) => l.id === listId)
          const card = list?.cards.find((c) => c.id === cardId)
          if (!card) return
          try {
            await deleteCard(card)
            toast.success("タスクを削除しました")
          } catch {
            toast.error("タスクの削除に失敗しました")
          }
        }}
        onCardUpdate={async (listId, cardId, data) => {
          const list = lists.find((l) => l.id === listId)
          const card = list?.cards.find((c) => c.id === cardId)
          if (!list || !card) return
          try {
            await updateCard(card, data, list.title)
            toast.success("タスクを更新しました")
            // 担当者変更通知
            if (data.assignee && data.assignee !== card.assignee) {
              showLocalNotification(
                "担当者が変更されました",
                `「${card.title}」の担当者: ${data.assignee}`,
              )
            }
          } catch {
            toast.error("タスクの更新に失敗しました")
          }
        }}
        onMoveCard={(sourceListId, cardId, targetListId, sourceIndex, destIndex) => {
          moveCard(sourceListId, cardId, targetListId, sourceIndex, destIndex)
        }}
      />
    )
  }

  return (
    <ProjectGallery
      projects={projects}
      isLoading={projectsLoading}
      onCreateProject={async (data) => {
        try {
          await addProject(data)
          toast.success("プロジェクトを作成しました")
        } catch {
          toast.error("プロジェクトの作成に失敗しました")
        }
      }}
      onDeleteProject={async (id) => {
        try {
          await deleteProject(id)
          toast.success("プロジェクトを削除しました")
        } catch {
          toast.error("プロジェクトの削除に失敗しました")
        }
      }}
      onSelectProject={(id) => setSelectedProjectId(id)}
      recalculateProgress={() => 0}
    />
  )
}
