export interface Member {
  name: string
  email: string
  color: string
}

export interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

export interface TaskCard {
  id: string
  title: string
  description?: string
  checklist?: ChecklistItem[]
  status: "todo" | "done"
  priority: "low" | "medium" | "high"
  assignee?: string
  dueDate?: string
  createdAt: string
  rowIndex?: number
}

export interface TaskList {
  id: string
  title: string
  direction: "vertical" | "horizontal"
  cards: TaskCard[]
  color?: string
}

export interface Project {
  id: string
  title: string
  openDate: string
  description?: string
  progress: number
  lists: TaskList[]
  createdAt: string
  spreadsheetId?: string
}
