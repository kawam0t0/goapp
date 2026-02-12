import type { ChecklistItem } from "./types"

/**
 * 説明文からチェックリスト項目を抽出
 * 形式: "・アイテム名" または "・[x]アイテム名" (チェック済み)
 */
export function parseChecklist(description: string): ChecklistItem[] {
  if (!description) return []
  
  const lines = description.split("\n")
  const checklist: ChecklistItem[] = []
  
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (trimmed.startsWith("・")) {
      const content = trimmed.substring(1).trim()
      // [x]で始まる場合はチェック済み
      if (content.startsWith("[x]") || content.startsWith("[X]")) {
        checklist.push({
          id: `item-${index}`,
          text: content.substring(3).trim(),
          checked: true,
        })
      } else {
        checklist.push({
          id: `item-${index}`,
          text: content,
          checked: false,
        })
      }
    }
  })
  
  return checklist
}

/**
 * チェックリスト項目を説明文に戻す
 */
export function serializeChecklist(checklist: ChecklistItem[]): string {
  return checklist
    .map((item) => {
      const prefix = item.checked ? "・[x]" : "・"
      return `${prefix}${item.text}`
    })
    .join("\n")
}
