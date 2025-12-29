"use client"

import { useState, useEffect } from "react"
import { Folder as FolderIcon, FolderOpen, FolderHeart, FolderCode, FolderKanban, Briefcase, Package, Plus, MoreVertical, Edit2, Trash2, ChevronLeft, ChevronRight, FolderX } from "lucide-react"
import { toast } from "sonner"
import CreateFolderModal from "./CreateFolderModal"
import { useModal } from "./ModalProvider"

interface Folder {
  _id: string
  name: string
  color: string
  icon: string
  description?: string
  fileCount: number
}

interface FolderSidebarProps {
  onFolderSelect: (folderId: string | null) => void
  selectedFolderId: string | null
  maxFolders?: number
  onFoldersChange?: () => void
  draggedFileId?: string | null
  onDropFile?: (fileId: string, folderId: string | null) => void
  onDragOverFolder?: (folderId: string | null) => void
  dragOverFolderId?: string | null
}

const ICON_MAP: Record<string, any> = {
  Folder: FolderIcon,
  FolderOpen,
  FolderHeart,
  FolderCode,
  FolderKanban,
  Briefcase,
  Package
}

export default function FolderSidebar({ 
  onFolderSelect, 
  selectedFolderId,
  maxFolders = 3,
  onFoldersChange,
  draggedFileId,
  onDropFile,
  onDragOverFolder,
  dragOverFolderId
}: FolderSidebarProps) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [contextMenu, setContextMenu] = useState<{ folderId: string, x: number, y: number } | null>(null)
  const { showModal } = useModal()

  useEffect(() => {
    fetchFolders()
  }, [])

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/folders?includeEmpty=true')
      if (res.ok) {
        const data = await res.json()
        setFolders(data.folders || [])
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
      toast.error('Error al cargar carpetas')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = () => {
    if (folders.length >= maxFolders) {
      toast.error(`Has alcanzado el límite de ${maxFolders} carpetas`)
      return
    }
    setEditingFolder(null)
    setShowCreateModal(true)
  }

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder)
    setShowCreateModal(true)
    setContextMenu(null)
  }

  const handleDeleteFolder = (folder: Folder) => {
    setContextMenu(null)
    
    showModal({
      title: "Eliminar Carpeta",
      message: folder.fileCount > 0
        ? `¿Eliminar "${folder.name}"? Los ${folder.fileCount} archivos se moverán a "Todos los archivos".`
        : `¿Eliminar la carpeta "${folder.name}"?`,
      type: "confirm",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/folders/${folder._id}`, {
            method: 'DELETE'
          })

          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'Error al eliminar')
          }

          toast.success('Carpeta eliminada')
          setFolders(prev => prev.filter(f => f._id !== folder._id))
          
          if (selectedFolderId === folder._id) {
            onFolderSelect(null)
          }
          
          if (onFoldersChange) onFoldersChange()
        } catch (error: any) {
          console.error('Error deleting folder:', error)
          toast.error(error.message || 'Error al eliminar carpeta')
        }
      }
    })
  }

  const handleFolderSuccess = (folder: Folder) => {
    if (editingFolder) {
      // Update existing
      setFolders(prev => prev.map(f => f._id === folder._id ? folder : f))
    } else {
      // Add new
      setFolders(prev => [...prev, folder])
    }
    setShowCreateModal(false)
    setEditingFolder(null)
    if (onFoldersChange) onFoldersChange()
  }

  const handleContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ folderId, x: e.clientX, y: e.clientY })
  }

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white dark:bg-zinc-900/40 border-r border-zinc-200 dark:border-white/5 flex flex-col items-center py-4 gap-2">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          title="Expandir"
        >
          <ChevronRight className="w-5 h-5 text-zinc-500" />
        </button>
        
        {folders.slice(0, 5).map(folder => {
          const Icon = ICON_MAP[folder.icon] || FolderIcon
          return (
            <button
              key={folder._id}
              onClick={() => onFolderSelect(folder._id)}
              className={`
                p-2 rounded-lg transition-all
                ${selectedFolderId === folder._id 
                  ? 'ring-2 ring-primary scale-110' 
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }
              `}
              style={{ color: folder.color }}
              title={folder.name}
            >
              <Icon className="w-5 h-5" />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <div className="w-64 bg-white dark:bg-zinc-900/40 border-r border-zinc-200 dark:border-white/5 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Carpetas</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCreateFolder}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400"
              title="Nueva carpeta"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400"
              title="Contraer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Folder List */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* All Files */}
          <button
            onClick={() => onFolderSelect(null)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-1
              ${selectedFolderId === null
                ? 'bg-primary/10 text-primary'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }
            `}
          >
            <FolderIcon className="w-5 h-5 shrink-0" />
            <span className="flex-1 text-left font-medium text-sm">Todos los archivos</span>
          </button>

          {/* No Folder (files without folder) */}
          <button
            onClick={() => onFolderSelect('none')}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-2
              ${selectedFolderId === 'none'
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }
              ${dragOverFolderId === 'none' && draggedFileId ? 'ring-2 ring-orange-500 bg-orange-500/20 scale-105' : ''}
            `}
            onDragOver={(e) => {
              if (draggedFileId && onDragOverFolder) {
                e.preventDefault()
                e.stopPropagation()
                onDragOverFolder('none')
              }
            }}
            onDragLeave={(e) => {
              if (draggedFileId && onDragOverFolder) {
                e.preventDefault()
                e.stopPropagation()
                onDragOverFolder(null)
              }
            }}
            onDrop={(e) => {
              if (draggedFileId && onDropFile) {
                e.preventDefault()
                e.stopPropagation()
                const fileId = e.dataTransfer.getData('fileId')
                if (fileId) {
                  onDropFile(fileId, 'none')
                }
                if (onDragOverFolder) onDragOverFolder(null)
              }
            }}
          >
            <FolderX className="w-5 h-5 shrink-0" />
            <span className="flex-1 text-left text-sm">Sin carpeta</span>
          </button>

          {loading ? (
            <div className="text-center py-8 text-zinc-400 text-sm">
              Cargando...
            </div>
          ) : folders.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FolderIcon className="w-12 h-12 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                No tienes carpetas
              </p>
              <button
                onClick={handleCreateFolder}
                className="text-sm text-primary hover:underline font-medium"
              >
                Crear tu primera carpeta
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {folders.map(folder => {
                const Icon = ICON_MAP[folder.icon] || FolderIcon
                const isSelected = selectedFolderId === folder._id
                const isDragOver = dragOverFolderId === folder._id
                
                return (
                  <div
                    key={folder._id}
                    className={`
                      group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer
                      ${isSelected
                        ? 'ring-2 ring-inset'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }
                      ${isDragOver && draggedFileId ? 'ring-2 ring-primary bg-primary/10 scale-105' : ''}
                    `}
                    style={{
                      backgroundColor: isSelected ? `${folder.color}15` : undefined,
                      color: isSelected ? folder.color : undefined
                    }}
                    onClick={() => onFolderSelect(folder._id)}
                    onContextMenu={(e) => handleContextMenu(e, folder._id)}
                    onDragOver={(e) => {
                      if (draggedFileId && onDragOverFolder) {
                        e.preventDefault()
                        e.stopPropagation()
                        onDragOverFolder(folder._id)
                      }
                    }}
                    onDragLeave={(e) => {
                      if (draggedFileId && onDragOverFolder) {
                        e.preventDefault()
                        e.stopPropagation()
                        onDragOverFolder(null)
                      }
                    }}
                    onDrop={(e) => {
                      if (draggedFileId && onDropFile) {
                        e.preventDefault()
                        e.stopPropagation()
                        const fileId = e.dataTransfer.getData('fileId')
                        if (fileId) {
                          onDropFile(fileId, folder._id)
                        }
                        if (onDragOverFolder) onDragOverFolder(null)
                      }
                    }}
                  >
                    <Icon className="w-5 h-5 shrink-0" style={{ color: folder.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{folder.name}</p>
                      {folder.fileCount > 0 && (
                        <p className="text-xs opacity-60">{folder.fileCount} archivos</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleContextMenu(e, folder._id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-white/5">
          <p className="text-xs text-zinc-500 text-center">
            {folders.length}/{maxFolders} carpetas
          </p>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl shadow-lg py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              const folder = folders.find(f => f._id === contextMenu.folderId)
              if (folder) handleEditFolder(folder)
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={() => {
              const folder = folders.find(f => f._id === contextMenu.folderId)
              if (folder) handleDeleteFolder(folder)
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <CreateFolderModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingFolder(null)
        }}
        onSuccess={handleFolderSuccess}
        existingFolder={editingFolder}
        maxFolders={maxFolders}
        currentFolderCount={folders.length}
      />
    </>
  )
}
