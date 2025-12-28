"use client"

import { useTheme } from "@/components/ThemeProvider"
import { useEffect, useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
    )
  }

  const themes: Array<{ id: "light" | "dark" | "system"; icon: typeof Sun; label: string }> = [
    { id: "light", icon: Sun, label: "Claro" },
    { id: "dark", icon: Moon, label: "Oscuro" },
    { id: "system", icon: Monitor, label: "Sistema" },
  ]

  const currentTheme = themes.find(t => t.id === theme) || themes[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="group relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        aria-label="Toggle theme"
      >
        <currentTheme.icon className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-32 origin-top-right rounded-lg border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          >
            <div className="flex flex-col gap-0.5">
              {themes.map((t) => {
                const isActive = theme === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id)
                      setIsOpen(false)
                    }}
                    className={`
                      flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors
                      ${isActive 
                        ? "bg-primary/10 text-primary dark:bg-primary/20" 
                        : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      }
                    `}
                  >
                    <t.icon className="h-3.5 w-3.5" />
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
