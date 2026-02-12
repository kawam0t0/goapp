import { google } from "googleapis"

function getAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  })
  return auth
}

export function getSheetsClient() {
  const auth = getAuth()
  return google.sheets({ version: "v4", auth })
}

export function getDriveClient() {
  const auth = getAuth()
  return google.drive({ version: "v3", auth })
}

export const TEMPLATE_SHEET_ID = process.env.GOOGLE_TEMPLATE_SHEET_ID ?? ""
