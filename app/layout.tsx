import type React from "react"
import type { Metadata } from "next"
import { Orbitron, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Navigation from "@/components/navigation"
import ChristmasDecorations from "@/components/christmas-decorations"

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-heading" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })

export const metadata: Metadata = {
  title: "CWR Minecraft Building Competition 2025",
  description: "Epic building competition featuring 300+ talented builders competing for glory",
  generator: "v0.app",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
}

function getThemeClass() {
  return process.env.NEXT_PUBLIC_THEME === "xmas" ? "xmas" : "dark"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const themeClass = getThemeClass()

  return (
    <html lang="en" className={themeClass}>
      <body className={`${orbitron.variable} ${inter.variable} font-sans antialiased`}>
        <ChristmasDecorations />
        <Navigation />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
