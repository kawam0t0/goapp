import { NextResponse } from "next/server"
import {
  getSheetsClient,
  getDriveClient,
  TEMPLATE_SHEET_ID,
} from "@/lib/google-sheets"

// GET: テンプレートの「プロジェクト情報」シートから全プロジェクトを取得
export async function GET() {
  try {
    if (!TEMPLATE_SHEET_ID) {
      return NextResponse.json(
        { error: "GOOGLE_TEMPLATE_SHEET_ID is not configured" },
        { status: 500 },
      )
    }

    const sheets = getSheetsClient()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: TEMPLATE_SHEET_ID,
      range: "プロジェクト情報!A2:E",
    })

    const rows = response.data.values ?? []

    // A=プロジェクト名, B=OPEN日, C=説明, D=作成日, E=スプレッドシートID
    const projects = rows
      .filter((row) => row[0])
      .map((row, index) => ({
        id: row[4] ?? `proj-${index}`, // E列: スプレッドシートIDをプロジェクトIDとして使用
        title: row[0] ?? "",
        openDate: row[1] ?? "",
        description: row[2] ?? "",
        createdAt: row[3] ?? "",
        spreadsheetId: row[4] ?? "",
      }))

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    )
  }
}

// POST: テンプレートをコピーして新プロジェクトを作成
export async function POST(request: Request) {
  try {
    if (!TEMPLATE_SHEET_ID) {
      return NextResponse.json(
        { error: "GOOGLE_TEMPLATE_SHEET_ID is not configured" },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { title, openDate, description } = body

    console.log("[v0] Creating project with data:", { title, openDate, description })

    if (!title || !openDate) {
      return NextResponse.json(
        { error: "title, openDate are required" },
        { status: 400 },
      )
    }

    const drive = getDriveClient()
    const sheets = getSheetsClient()
    const createdAt = new Date().toISOString().split("T")[0]

    // 1. テンプレートスプレッドシートをコピー（共有ドライブ対応）
    const copyResponse = await drive.files.copy({
      fileId: TEMPLATE_SHEET_ID,
      supportsAllDrives: true,
      requestBody: {
        name: `${title}`,
      },
    })

    const newSpreadsheetId = copyResponse.data.id
    if (!newSpreadsheetId) {
      return NextResponse.json(
        { error: "Failed to copy template" },
        { status: 500 },
      )
    }

    // 2. 新スプレッドシートの「プロジェクト情報」シートにプロジェクト情報を書き込む
    // A=プロジェクト名, B=OPEN日, C=説明, D=作成日
    await sheets.spreadsheets.values.update({
      spreadsheetId: newSpreadsheetId,
      range: "プロジェクト情報!B1:B4",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [title],
          [openDate],
          [description ?? ""],
          [createdAt],
        ],
      },
    })

    // 3. テンプレートの「プロジェクト情報」シートにプロジェクト情報を追記
    // A=プロジェクト名, B=OPEN日, C=説明, D=作成日, E=スプレッドシートID
    await sheets.spreadsheets.values.append({
      spreadsheetId: TEMPLATE_SHEET_ID,
      range: "プロジェクト情報!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            title,
            openDate,
            description ?? "",
            createdAt,
            newSpreadsheetId,
          ],
        ],
      },
    })

    return NextResponse.json({
      project: {
        id: newSpreadsheetId,
        title,
        openDate,
        description: description ?? "",
        createdAt,
        spreadsheetId: newSpreadsheetId,
      },
    })
  } catch (error) {
    console.error("Failed to create project:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    )
  }
}
