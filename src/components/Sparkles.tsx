'use client'

import { useEffect, useState } from 'react'

interface Sparkle {
  id: string
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

interface SparklesProps {
  count?: number
  minSize?: number
  maxSize?: number
  className?: string
}

export function Sparkles({
  count = 15,
  minSize = 8,
  maxSize = 20,
  className = ''
}: SparklesProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    const generateSparkle = (): Sparkle => ({
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (maxSize - minSize) + minSize,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 1.5,
    })

    setSparkles(Array.from({ length: count }, generateSparkle))

    // Regenerate sparkles periodically
    const interval = setInterval(() => {
      setSparkles(prev => {
        const newSparkles = [...prev]
        const indexToReplace = Math.floor(Math.random() * newSparkles.length)
        newSparkles[indexToReplace] = generateSparkle()
        return newSparkles
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [count, minSize, maxSize])

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-sparkle"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${sparkle.duration}s`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-full w-full"
          >
            <path
              d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
              fill="currentColor"
              className="text-[rgb(var(--primary-400))] opacity-70"
            />
          </svg>
        </div>
      ))}
    </div>
  )
}
