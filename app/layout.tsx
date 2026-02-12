import React from "react"
import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import { Noto_Sans_JP } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
})

export const metadata: Metadata = {
  title: "GO Task Manager",
  description: "Store opening task management - OPEN preparation tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GO Task Manager",
  },
}

export const viewport: Viewport = {
  themeColor: "#1E4B9E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icons/go-logo.png" />
      </head>
      <body
        className={`${geist.variable} ${notoSansJP.variable} font-sans antialiased`}
      >
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
