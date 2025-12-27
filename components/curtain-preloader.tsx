"use client"

import { useEffect, useState } from "react"

export default function CurtainPreloader() {
  const [isAnimating, setIsAnimating] = useState(true)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    const hasShown = sessionStorage.getItem("curtain-preloader-shown")

    if (hasShown === "true") {
      // Skip animation if already shown
      setShouldRender(false)
      return
    }

    // Mark as shown for this session
    sessionStorage.setItem("curtain-preloader-shown", "true")

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      // Quick fade out for reduced motion preference
      setTimeout(() => {
        setIsAnimating(false)
        setTimeout(() => {
          setShouldRender(false)
          document.body.style.overflow = originalOverflow || ""
        }, 200)
      }, 200)
    } else {
      // Normal curtain animation
      setTimeout(() => {
        setIsAnimating(false)
        // Remove from DOM and re-enable scrolling after animation completes
        setTimeout(() => {
          setShouldRender(false)
          document.body.style.overflow = originalOverflow || ""
        }, 1000)
      }, 100)
    }

    // Cleanup function to ensure scroll is always re-enabled
    return () => {
      document.body.style.overflow = originalOverflow || ""
    }
  }, [])

  // Don't render after animation completes
  if (!shouldRender) return null

  return (
    <div
      className="curtain-preloader fixed inset-0 z-[9999] pointer-events-none"
      style={{
        pointerEvents: isAnimating ? "all" : "none",
      }}
    >
      {/* Left Panel */}
      <div
        className={`absolute top-0 left-0 h-full w-1/2 bg-black transition-transform duration-1000 ease-in-out ${
          isAnimating ? "" : "-translate-x-full"
        }`}
        style={{
          boxShadow: isAnimating ? "2px 0 20px rgba(0, 0, 0, 0.8)" : "none",
        }}
      />

      {/* Right Panel */}
      <div
        className={`absolute top-0 right-0 h-full w-1/2 bg-black transition-transform duration-1000 ease-in-out ${
          isAnimating ? "" : "translate-x-full"
        }`}
        style={{
          boxShadow: isAnimating ? "-2px 0 20px rgba(0, 0, 0, 0.8)" : "none",
        }}
      />

      {/* Optional: Center line highlight for dramatic effect */}
      {isAnimating && (
        <div className="absolute top-0 left-1/2 h-full w-[2px] bg-gradient-to-b from-transparent via-purple-500/30 to-transparent animate-pulse" />
      )}
    </div>
  )
}
