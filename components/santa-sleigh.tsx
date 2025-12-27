"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface SantaSleighConfig {
  enabled: boolean
  imageUrl: string
  width: number
  height: number
  minDelay: number
  maxDelay: number
  animationDuration: number
}

export default function SantaSleigh() {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState(-200)
  const [config, setConfig] = useState<SantaSleighConfig | null>(null)

  useEffect(() => {
    fetch("/api/data/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.santaSleigh) {
          setConfig(data.santaSleigh)
        }
      })
      .catch((err) => console.error("Failed to load Santa sleigh config:", err))
  }, [])

  useEffect(() => {
    if (!config || !config.enabled) return

    const triggerSanta = () => {
      const randomDelay = Math.random() * (config.maxDelay - config.minDelay) + config.minDelay

      setTimeout(() => {
        setIsVisible(true)
        setPosition(-200)

        const startTime = Date.now()

        const animate = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / config.animationDuration, 1)

          const newPosition = -200 + (window.innerWidth + 400) * progress
          setPosition(newPosition)

          if (progress < 1) {
            requestAnimationFrame(animate)
          } else {
            setIsVisible(false)
            triggerSanta()
          }
        }

        requestAnimationFrame(animate)
      }, randomDelay)
    }

    triggerSanta()
  }, [config])

  if (!isVisible || !config) return null

  return (
    <div
      className="fixed top-[15%] z-50 pointer-events-none"
      style={{
        left: `${position}px`,
        transform: "translateY(-50%)",
      }}
    >
      <div className="relative animate-bounce-slow">
        <Image
          src={config.imageUrl || "/placeholder.svg"}
          alt="Santa Sleigh"
          width={config.width}
          height={config.height}
          className="drop-shadow-2xl"
          priority={false}
        />
      </div>
    </div>
  )
}
