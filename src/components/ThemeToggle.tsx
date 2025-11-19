'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const themes = ['light', 'dark', 'pastel-blue', 'pastel-purple', 'pastel-green', 'pastel-peach', 'pastel-yellow']
const themeIcons: Record<string, string> = {
  'light': '☀️',
  'dark': '🌙',
  'pastel-blue': '💙',
  'pastel-purple': '💜',
  'pastel-green': '💚',
  'pastel-peach': '🧡',
  'pastel-yellow': '💛',
}

const themeNames: Record<string, string> = {
  'light': 'Light',
  'dark': 'Dark',
  'pastel-blue': 'Blue',
  'pastel-purple': 'Purple',
  'pastel-green': 'Green',
  'pastel-peach': 'Peach',
  'pastel-yellow': 'Yellow',
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) return (
    <div className="h-8 w-20 rounded-full bg-[rgb(var(--primary-100)_/_0.5)]" />
  )

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme || 'light')
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 rounded-full border border-[rgb(var(--primary-200))] bg-[rgb(var(--primary-100)_/_0.8)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[rgb(var(--text-secondary))] shadow-sm shadow-[rgb(var(--primary-100)_/_0.7)] transition hover:bg-[rgb(var(--primary-200)_/_0.9)]"
      aria-label="Toggle theme"
    >
      {themeIcons[theme || 'light']} {themeNames[theme || 'light']}
    </button>
  )
}
