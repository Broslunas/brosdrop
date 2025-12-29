"use client"

import { useState, useEffect, useRef, KeyboardEvent } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  placeholder?: string
  disabled?: boolean
}

export default function TagInput({ 
  value = [], 
  onChange, 
  maxTags = 5,
  placeholder = "Añadir etiqueta...",
  disabled = false
}: TagInputProps) {
  const [input, setInput] = useState("")
  const [suggestions, setSuggestions] = useState<{ tag: string, count: number }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch user's existing tags for autocomplete
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch('/api/tags')
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.tags || [])
        }
      } catch (error) {
        console.error('Error fetching tags:', error)
      }
    }
    fetchTags()
  }, [])

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    
    // Validation
    if (!trimmed) return
    
    if (trimmed.length > 30) {
      toast.error("Las etiquetas deben tener 30 caracteres o menos")
      return
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
      toast.error("Las etiquetas solo pueden contener letras, números, espacios, guiones y guiones bajos")
      return
    }

    if (value.includes(trimmed)) {
      toast.error("Esta etiqueta ya está añadida")
      return
    }

    if (value.length >= maxTags) {
      toast.error(`Máximo ${maxTags} etiquetas permitidas`)
      return
    }

    onChange([...value, trimmed])
    setInput("")
    setShowSuggestions(false)
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  const filteredSuggestions = suggestions.filter(s => 
    s.tag.toLowerCase().includes(input.toLowerCase()) && 
    !value.includes(s.tag)
  ).slice(0, 5)

  return (
    <div className="relative">
      <div className={`
        flex flex-wrap gap-2 p-3 rounded-xl border
        ${disabled 
          ? 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 cursor-not-allowed' 
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 focus-within:ring-1 focus-within:ring-primary'
        }
        min-h-[44px]
      `}>
        {/* Tag chips */}
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary dark:text-primary-light rounded-lg text-sm font-medium"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {/* Input */}
        {!disabled && value.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setShowSuggestions(e.target.value.length > 0)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(input.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
        )}
      </div>

      {/* Tag count indicator */}
      <div className="flex items-center justify-between mt-1.5 px-1">
        <span className={`text-xs ${value.length >= maxTags ? 'text-orange-500 font-medium' : 'text-zinc-500'}`}>
          {value.length}/{maxTags} etiquetas
        </span>
        <span className="text-xs text-zinc-400">
          Presiona Enter o , para añadir
        </span>
      </div>

      {/* Autocomplete suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addTag(suggestion.tag)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between"
            >
              <span className="text-zinc-900 dark:text-white">{suggestion.tag}</span>
              <span className="text-xs text-zinc-400">{suggestion.count} archivos</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
