"use client"

import { useEffect, useState } from "react"
import { isChristmasTheme } from "@/lib/theme-config"

export default function ChristmasDecorations() {
  const [isChristmas, setIsChristmas] = useState(false)

  useEffect(() => {
    setIsChristmas(isChristmasTheme())
  }, [])

  if (!isChristmas) return null

  return (
    <>
      {/* Christmas Ornaments floating on sides */}
      <div className="fixed left-4 top-1/4 z-10 animate-float text-4xl opacity-70 pointer-events-none">🎄</div>
      <div
        className="fixed right-4 top-1/3 z-10 animate-float text-4xl opacity-70 pointer-events-none"
        style={{ animationDelay: "1s" }}
      >
        🎁
      </div>
      <div
        className="fixed left-8 top-2/3 z-10 animate-float text-3xl opacity-60 pointer-events-none"
        style={{ animationDelay: "2s" }}
      >
        ⛄
      </div>
      <div
        className="fixed right-8 top-1/2 z-10 animate-float text-3xl opacity-60 pointer-events-none"
        style={{ animationDelay: "1.5s" }}
      >
        🔔
      </div>
      <div
        className="fixed left-1/4 top-20 z-10 animate-float text-2xl opacity-50 pointer-events-none"
        style={{ animationDelay: "0.5s" }}
      >
        ⭐
      </div>
      <div
        className="fixed right-1/4 top-32 z-10 animate-float text-2xl opacity-50 pointer-events-none"
        style={{ animationDelay: "2.5s" }}
      >
        🎅
      </div>

      {/* Christmas Lights String across top */}
      <div className="fixed top-0 left-0 right-0 z-50 h-2 bg-gradient-to-r from-red-600 via-green-600 to-yellow-500 opacity-30 christmas-lights pointer-events-none" />
    </>
  )
}
