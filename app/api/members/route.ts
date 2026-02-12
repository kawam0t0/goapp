import { NextResponse } from "next/server"
import { getSheetsClient, TEMPLATE_SHEET_ID } from "@/lib/google-sheets"

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
      range: "ユーザー!A2:C",
    })

    const rows = response.data.values ?? []

    const members = rows
      .filter((row) => row[0])
      .map((row) => ({
        name: row[0] ?? "",
        email: row[1] ?? "",
        color: row[2] ?? "Blue",
      }))

    return NextResponse.json({ members })
  } catch (error) {
    console.error("Failed to fetch members from Google Sheets:", error)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 },
    )
  }
}
