"use client"

import { useEffect, useState } from "react"

export default function ChristmasLights() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Top Christmas lights decoration */}
      <div className="fixed top-16 left-0 right-0 z-40 pointer-events-none">
        <div className="christmas-lights" />
      </div>

      {/* Floating ornaments */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-10"
            style={{
              left: `${i * 12.5 + 5}%`,
              top: `${Math.random() * 20}%`,
              animation: `ornamentFloat ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {["🎄", "🎁", "⭐", "🔔", "❄️", "🎅", "🤶", "🦌"][i % 8]}
          </div>
        ))}
      </div>
    </>
  )
}
