import { NextResponse } from "next/server"
import {
  getSheetsClient,
  getDriveClient,
  TEMPLATE_SHEET_ID,
} from "@/lib/google-sheets"

// DELETE: プロジェクトのスプレッドシートを削除し、一覧から除去
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId: spreadsheetId } = await params
    const drive = getDriveClient()
    const sheets = getSheetsClient()

    // 1. プロジェクトのスプレッドシートを削除(ゴミ箱へ)（共有ドライブ対応）
    try {
      await drive.files.update({
        fileId: spreadsheetId,
        supportsAllDrives: true,
        requestBody: { trashed: true },
      })
    } catch (e) {
      console.error("Failed to trash spreadsheet:", e)
    }

    // 2. テンプレートの「プロジェクト情報」から該当行を探して削除
    // E列(index 4)がスプレッドシートID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: TEMPLATE_SHEET_ID,
      range: "プロジェクト情報!A2:E",
    })

    const rows = response.data.values ?? []
    const rowIndex = rows.findIndex((row) => row[4] === spreadsheetId)

    if (rowIndex !== -1) {
      const sheetRow = rowIndex + 2 // ヘッダー分+1、0始まり+1
      await sheets.spreadsheets.values.clear({
        spreadsheetId: TEMPLATE_SHEET_ID,
        range: `プロジェクト情報!A${sheetRow}:E${sheetRow}`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete project:", error)
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    )
  }
}
