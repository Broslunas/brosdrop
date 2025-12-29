"use client"

import { useState } from "react"
import { X, Folder, FolderOpen, FolderHeart, FolderCode, FolderKanban, Briefcase, Package } from "lucide-react"
import { toast } from "sonner"

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (folder: any) => void
  existingFolder?: any
  maxFolders?: number
  currentFolderCount?: number
}

const PRESET_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Gray', value: '#6B7280' }
]

const FOLDER_ICONS = [
  { name: 'Folder', icon: Folder },
  { name: 'FolderOpen', icon: FolderOpen },
  { name: 'FolderHeart', icon: FolderHeart },
  { name: 'FolderCode', icon: FolderCode },
  { name: 'FolderKanban', icon: FolderKanban },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Package', icon: Package }
]

export default function CreateFolderModal({
  isOpen,
  onClose,
  onSuccess,
  existingFolder,
  maxFolders = 3,
  currentFolderCount = 0
}: CreateFolderModalProps) {
  const [name, setName] = useState(existingFolder?.name || "")
  const [description, setDescription] = useState(existingFolder?.description || "")
  const [color, setColor] = useState(existingFolder?.color || '#3B82F6')
  const [icon, setIcon] = useState(existingFolder?.icon || 'Folder')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("El nombre de la carpeta es obligatorio")
      return
    }

    if (name.length > 50) {
      toast.error("El nombre debe tener 50 caracteres o menos")
      return
    }

    // Check limit only for new folders
    if (!existingFolder && currentFolderCount >= maxFolders) {
      toast.error(`Has alcanzado el límite de ${maxFolders} carpetas`)
      return
    }

    setLoading(true)

    try {
      const url = existingFolder 
        ? `/api/folders/${existingFolder._id}`
        : '/api/folders'
      
      const method = existingFolder ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          color,
          icon
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar la carpeta')
      }

      toast.success(existingFolder ? 'Carpeta actualizada' : 'Carpeta creada')
      onSuccess(data.folder)
      onClose()
      
      // Reset form
      if (!existingFolder) {
        setName("")
        setDescription("")
        setColor('#3B82F6')
        setIcon('Folder')
      }
    } catch (error: any) {
      console.error('Error saving folder:', error)
      toast.error(error.message || 'Error al guardar la carpeta')
    } finally {
      setLoading(false)
    }
  }

  const SelectedIcon = FOLDER_ICONS.find(i => i.name === icon)?.icon || Folder

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-white/10">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {existingFolder ? 'Editar Carpeta' : 'Nueva Carpeta'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <SelectedIcon className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-900 dark:text-white truncate">
                {name || 'Nombre de la carpeta'}
              </p>
              <p className="text-sm text-zinc-500 truncate">
                {description || 'Sin descripción'}
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Proyectos, Documentos..."
              maxLength={50}
              className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-1 focus:ring-primary outline-none"
              required
            />
            <p className="text-xs text-zinc-400 mt-1">{name.length}/50 caracteres</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción de la carpeta..."
              maxLength={200}
              rows={2}
              className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-1 focus:ring-primary outline-none resize-none"
            />
            <p className="text-xs text-zinc-400 mt-1">{description.length}/200 caracteres</p>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`
                    w-10 h-10 rounded-lg transition-all
                    ${color === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}
                  `}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Icono
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FOLDER_ICONS.map((i) => {
                const IconComponent = i.icon
                return (
                  <button
                    key={i.name}
                    type="button"
                    onClick={() => setIcon(i.name)}
                    className={`
                      p-3 rounded-xl transition-all
                      ${icon === i.name 
                        ? 'bg-primary/10 text-primary ring-2 ring-primary' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }
                    `}
                  >
                    <IconComponent className="w-6 h-6 mx-auto" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : (existingFolder ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
