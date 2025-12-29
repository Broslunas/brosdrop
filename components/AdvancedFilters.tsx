"use client"

import { useState, useEffect } from "react"
import { X, SlidersHorizontal, Calendar, FileType, HardDrive, Tag as TagIcon } from "lucide-react"

interface AdvancedFiltersProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterState) => void
  initialFilters?: FilterState
}

export interface FilterState {
  dateRange?: { start: string, end: string }
  fileTypes?: string[]
  sizeRange?: { min: number, max: number }
  tags?: string[]
  folderId?: string
}

const FILE_TYPE_OPTIONS = [
  { label: 'Imágenes', value: 'image/', icon: '🖼️' },
  { label: 'Videos', value: 'video/', icon: '🎬' },
  { label: 'Audio', value: 'audio/', icon: '🎵' },
  { label: 'Documentos', value: 'application/pdf', icon: '📄' },
  { label: 'Archivos', value: 'application/zip', icon: '📦' },
  { label: 'Código', value: 'text/', icon: '💻' }
]

const DATE_PRESETS = [
  { label: 'Hoy', days: 0 },
  { label: 'Últimos 7 días', days: 7 },
  { label: 'Últimos 30 días', days: 30 },
  { label: 'Últimos 90 días', days: 90 }
]

const SIZE_PRESETS = [
  { label: 'Pequeño (<10MB)', min: 0, max: 10 * 1024 * 1024 },
  { label: 'Mediano (10-100MB)', min: 10 * 1024 * 1024, max: 100 * 1024 * 1024 },
  { label: 'Grande (100MB-1GB)', min: 100 * 1024 * 1024, max: 1024 * 1024 * 1024 },
  { label: 'Muy grande (>1GB)', min: 1024 * 1024 * 1024, max: Infinity }
]

export default function AdvancedFilters({ 
  isOpen, 
  onClose, 
  onApply,
  initialFilters = {}
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [availableTags, setAvailableTags] = useState<{ tag: string, count: number }[]>([])
  const [folders, setFolders] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchTags()
      fetchFolders()
    }
  }, [isOpen])

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags')
      if (res.ok) {
        const data = await res.json()
        setAvailableTags(data.tags || [])
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/folders')
      if (res.ok) {
        const data = await res.json()
        setFolders(data.folders || [])
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
    }
  }

  const handleDatePreset = (days: number) => {
    const end = new Date().toISOString().split('T')[0]
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    setFilters(prev => ({ ...prev, dateRange: { start, end } }))
  }

  const handleSizePreset = (min: number, max: number) => {
    setFilters(prev => ({ ...prev, sizeRange: { min, max } }))
  }

  const toggleFileType = (type: string) => {
    setFilters(prev => {
      const current = prev.fileTypes || []
      const updated = current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type]
      return { ...prev, fileTypes: updated.length > 0 ? updated : undefined }
    })
  }

  const toggleTag = (tag: string) => {
    setFilters(prev => {
      const current = prev.tags || []
      const updated = current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag]
      return { ...prev, tags: updated.length > 0 ? updated : undefined }
    })
  }

  const clearFilters = () => {
    setFilters({})
  }

  const applyFilters = () => {
    onApply(filters)
    onClose()
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-zinc-200 dark:border-white/10 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Filtros Avanzados
            </h2>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Date Range */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Rango de Fechas
              </label>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {DATE_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleDatePreset(preset.days)}
                  className="px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Desde</label>
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { start: e.target.value, end: prev.dateRange?.end || '' }
                  }))}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Hasta</label>
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { start: prev.dateRange?.start || '', end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* File Types */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileType className="w-4 h-4 text-zinc-500" />
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Tipo de Archivo
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FILE_TYPE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => toggleFileType(option.value)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                    ${filters.fileTypes?.includes(option.value)
                      ? 'bg-primary/10 text-primary ring-1 ring-primary'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }
                  `}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Range */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-4 h-4 text-zinc-500" />
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Tamaño
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SIZE_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleSizePreset(preset.min, preset.max)}
                  className={`
                    px-3 py-2 rounded-lg text-sm transition-all
                    ${filters.sizeRange?.min === preset.min && filters.sizeRange?.max === preset.max
                      ? 'bg-primary/10 text-primary ring-1 ring-primary'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }
                  `}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TagIcon className="w-4 h-4 text-zinc-500" />
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Etiquetas
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 12).map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all
                      ${filters.tags?.includes(tag)
                        ? 'bg-primary/10 text-primary ring-1 ring-primary'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }
                    `}
                  >
                    <span>{tag}</span>
                    <span className="text-xs opacity-60">({count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Folders */}
          {folders.length > 0 && (
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 block">
                Carpeta
              </label>
              <select
                value={filters.folderId || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  folderId: e.target.value || undefined
                }))}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg text-sm"
              >
                <option value="">Todas las carpetas</option>
                <option value="none">Sin carpeta</option>
                {folders.map(folder => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name} ({folder.fileCount})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-zinc-200 dark:border-white/10">
          <button
            onClick={clearFilters}
            className="flex-1 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={applyFilters}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  )
}
