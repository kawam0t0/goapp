"use client"

import { useCallback } from "react"
import useSWR, { mutate as globalMutate } from "swr"
import type { Project, TaskList, TaskCard, Member } from "./types"

// --- Fetchers ---

const jsonFetcher = (url: string) => fetch(url).then((res) => res.json())

// --- Members (from template spreadsheet "ユーザー" sheet) ---

export function useMembers() {
  const { data, error, isLoading } = useSWR<{ members: Member[] }>(
    "/api/members",
    jsonFetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  )
  return { members: data?.members ?? [], isLoading, error }
}

// --- Projects (from template spreadsheet "プロジェクト一覧" sheet) ---

interface RawProject {
  id: string
  title: string
  openDate: string
  description: string
  spreadsheetId: string
  createdAt: string
}

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<{
    projects: RawProject[]
  }>("/api/projects", jsonFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })

  const projects: Project[] = (data?.projects ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    openDate: p.openDate,
    description: p.description,
    progress: 0, // will be recalculated after tasks loaded
    lists: [],
    createdAt: p.createdAt,
    spreadsheetId: p.spreadsheetId,
  }))

  const addProject = useCallback(
    async (projectData: {
      title: string
      openDate: string
      description?: string
    }) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      })
      if (!res.ok) {
        throw new Error("Failed to create project")
      }
      const result = await res.json()
      await mutate()
      return result.project
    },
    [mutate],
  )

  const deleteProject = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Failed to delete project")
      }
      await mutate()
    },
    [mutate],
  )

  return {
    projects,
    isLoading,
    error,
    addProject,
    deleteProject,
    refreshProjects: mutate,
  }
}

// --- Tasks for a specific project (from project's spreadsheet "タスク一覧" sheet) ---

export function useProjectTasks(projectId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ lists: TaskList[] }>(
    projectId ? `/api/projects/${projectId}/tasks` : null,
    jsonFetcher,
    { revalidateOnFocus: false, dedupingInterval: 15000 },
  )

  const lists: TaskList[] = data?.lists ?? []

  const addCard = useCallback(
    async (
      listName: string,
      cardData: {
        title: string
        description?: string
        assignee?: string
        dueDate?: string
      },
    ) => {
      if (!projectId) return
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cardData, listName }),
      })
      if (!res.ok) throw new Error("Failed to create task")
      await mutate()
    },
    [projectId, mutate],
  )

  const updateCard = useCallback(
    async (
      card: TaskCard,
      updates: Partial<Omit<TaskCard, "id" | "createdAt">>,
      listName: string,
    ) => {
      if (!projectId || !card.rowIndex) return
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowIndex: card.rowIndex,
          title: updates.title ?? card.title,
          status: updates.status ?? card.status,
          assignee: updates.assignee ?? card.assignee ?? "",
          dueDate: updates.dueDate ?? card.dueDate ?? "",
          listName: listName,
          description: updates.description ?? card.description ?? "",
        }),
      })
      if (!res.ok) throw new Error("Failed to update task")
      await mutate()
    },
    [projectId, mutate],
  )

  const deleteCard = useCallback(
    async (card: TaskCard) => {
      if (!projectId || !card.rowIndex) return
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex: card.rowIndex }),
      })
      if (!res.ok) throw new Error("Failed to delete task")
      await mutate()
    },
    [projectId, mutate],
  )

  const moveCard = useCallback(
    async (
      sourceListId: string,
      cardId: string,
      targetListId: string,
      sourceIndex: number,
      destIndex: number,
    ) => {
      if (!projectId) return

      // Optimistic UI: update local data immediately
      mutate(
        (currentData) => {
          if (!currentData) return currentData
          const newLists = currentData.lists.map((l) => ({
            ...l,
            cards: [...l.cards],
          }))

          const sourceList = newLists.find((l) => l.id === sourceListId)
          const targetList = newLists.find((l) => l.id === targetListId)
          if (!sourceList) return currentData

          const [movedCard] = sourceList.cards.splice(sourceIndex, 1)
          if (!movedCard) return currentData

          if (sourceListId === targetListId) {
            sourceList.cards.splice(destIndex, 0, movedCard)
          } else if (targetList) {
            targetList.cards.splice(destIndex, 0, movedCard)
            // Update the list name in spreadsheet
            if (movedCard.rowIndex) {
              fetch(`/api/projects/${projectId}/tasks`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  rowIndex: movedCard.rowIndex,
                  title: movedCard.title,
                  status: movedCard.status,
                  assignee: movedCard.assignee ?? "",
                  dueDate: movedCard.dueDate ?? "",
                  listName: targetList.title,
                  description: movedCard.description ?? "",
                }),
              })
            }
          }

          return { lists: newLists }
        },
        { revalidate: false },
      )
    },
    [projectId, mutate],
  )

  const recalculateProgress = useCallback(
    (listsToCalc?: TaskList[]) => {
      const targetLists = listsToCalc ?? lists
      const allCards = targetLists.flatMap((l) => l.cards)
      if (allCards.length === 0) return 0
      const doneCards = allCards.filter((c) => c.status === "done").length
      return Math.round((doneCards / allCards.length) * 100)
    },
    [lists],
  )

  return {
    lists,
    isLoading,
    error,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    recalculateProgress,
    refreshTasks: mutate,
  }
}
