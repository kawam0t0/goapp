import { NextResponse } from "next/server"
import { getSheetsClient } from "@/lib/google-sheets"

// GET: プロジェクトのスプレッドシートから「タスク一覧」を取得
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId: spreadsheetId } = await params
    const sheets = getSheetsClient()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "タスク一覧!A2:G",
    })

    const rows = response.data.values ?? []

    // リスト名でグループ化してTaskList構造に変換
    const listMap = new Map<
      string,
      {
        title: string
        cards: {
          id: string
          title: string
          status: string
          assignee: string
          dueDate: string
          listName: string
          description: string
          createdAt: string
          rowIndex: number
        }[]
      }
    >()

    rows.forEach((row, index) => {
      const taskName = row[0] ?? ""
      if (!taskName) return

      const listName = row[4] ?? "未分類"
      const card = {
        id: `row-${index + 2}`, // スプレッドシートの行番号をIDとして使用
        title: taskName,
        status: row[1] ?? "未着手",
        assignee: row[2] ?? "",
        dueDate: row[3] ?? "",
        listName,
        description: row[5] ?? "",
        createdAt: row[6] ?? "",
        rowIndex: index + 2, // 実際のシート行番号(ヘッダー=1行目なので+2)
      }

      if (listMap.has(listName)) {
        listMap.get(listName)!.cards.push(card)
      } else {
        listMap.set(listName, { title: listName, cards: [card] })
      }
    })

    // ステータスをアプリのstatus型に変換
    const statusMap: Record<string, string> = {
      未着手: "todo",
      進行中: "in-progress",
      完了: "done",
    }

    const lists = Array.from(listMap.values()).map((list, listIndex) => ({
      id: `list-${listIndex}`,
      title: list.title,
      direction: "vertical" as const,
      color: ["#1E4B9E", "#2E7D32", "#E65100", "#C62828", "#6A1B9A", "#00838F"][
        listIndex % 6
      ],
      cards: list.cards.map((card) => ({
        id: card.id,
        title: card.title,
        description: card.description || undefined,
        status: (statusMap[card.status] ?? "todo") as
          | "todo"
          | "in-progress"
          | "done",
        priority: "medium" as const,
        assignee: card.assignee || undefined,
        dueDate: card.dueDate || undefined,
        createdAt: card.createdAt || new Date().toISOString().split("T")[0],
        rowIndex: card.rowIndex,
      })),
    }))

    return NextResponse.json({ lists })
  } catch (error) {
    console.error("Failed to fetch tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    )
  }
}

// POST: プロジェクトのスプレッドシートの「タスク一覧」に新しいタスクを追加
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId: spreadsheetId } = await params
    const body = await request.json()
    const { title, assignee, dueDate, listName, description } = body

    if (!title || !listName) {
      return NextResponse.json(
        { error: "title and listName are required" },
        { status: 400 },
      )
    }

    const sheets = getSheetsClient()
    const createdAt = new Date().toISOString().split("T")[0]

    // 既存データを取得して最終行を特定
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "タスク一覧!A:A",
    })
    const lastRow = (existingData.data.values?.length ?? 0) + 1

    // 確実にA列から書き込む
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `タスク一覧!A${lastRow}:G${lastRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            title,
            "未着手",
            assignee ?? "",
            dueDate ?? "",
            listName,
            description ?? "",
            createdAt,
          ],
        ],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to create task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    )
  }
}

// PUT: タスクの更新(ステータス変更、担当者変更、移動など)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId: spreadsheetId } = await params
    const body = await request.json()
    const { rowIndex, title, status, assignee, dueDate, listName, description } =
      body

    if (!rowIndex) {
      return NextResponse.json(
        { error: "rowIndex is required" },
        { status: 400 },
      )
    }

    const sheets = getSheetsClient()

    // ステータスを日本語に変換
    const statusMap: Record<string, string> = {
      todo: "未着手",
      "in-progress": "進行中",
      done: "完了",
    }

    const values = [
      title ?? "",
      statusMap[status] ?? status ?? "",
      assignee ?? "",
      dueDate ?? "",
      listName ?? "",
      description ?? "",
    ]

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `タスク一覧!A${rowIndex}:F${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update task:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    )
  }
}

// DELETE: タスクの行をクリア
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId: spreadsheetId } = await params
    const body = await request.json()
    const { rowIndex } = body

    if (!rowIndex) {
      return NextResponse.json(
        { error: "rowIndex is required" },
        { status: 400 },
      )
    }

    const sheets = getSheetsClient()

    // 行の内容をクリアする
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `タスク一覧!A${rowIndex}:G${rowIndex}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete task:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    )
  }
}
