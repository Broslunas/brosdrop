"use client"

import { useState, useMemo, useEffect } from "react"
import { ITransfer } from "@/models/Transfer"
import { Trash2, ExternalLink, Copy, FileIcon, Calendar, Download, HardDrive, Eye, Search, Filter, ArrowUpDown, Check, X, Grid, List as ListIcon, Edit2, Lock, Music, Video, Image as ImageIcon, FileText, Archive, FileCode } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useModal } from "@/components/ModalProvider"
import EditFileModal from "@/components/EditFileModal"

// Format bytes to human readable
const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return FileIcon

  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) return Music
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return Video
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return ImageIcon
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return Archive
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'html', 'css', 'json'].includes(ext)) return FileCode
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) return FileText
  
  return FileIcon
}

export default function DashboardClient({ 
    initialFiles, 
    historyFiles = [], 
    defaultView = 'grid',
    onFileDeleted,
    onFileUpdated
}: { 
    initialFiles: any[], 
    historyFiles?: any[], 
    defaultView?: string,
    onFileDeleted?: (id: string) => void,
    onFileUpdated?: (file: any) => void
}) {
  const [files, setFiles] = useState<ITransfer[]>(initialFiles)
  const [history, setHistory] = useState<any[]>(historyFiles)
  
  useEffect(() => {
    setFiles(initialFiles)
  }, [initialFiles])
  
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { showModal } = useModal()
  
  const [editingFile, setEditingFile] = useState<ITransfer | null>(null)

  const handleSaveEdit = async (id: string, newName: string, password?: string | null) => {
      try {
          const res = await fetch(`/api/files/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  name: newName, 
                  password: password, 
                  removePassword: password === null 
              })
          })
          
          const data = await res.json()

          if (!res.ok) {
              throw new Error(data.error || "Error al actualizar")
          }
          
          const updated = { ...files.find(f => f._id === id)!, originalName: newName, passwordHash: data.transfer.passwordHash }
          setFiles(prev => prev.map(f => f._id === id ? updated : f))
          if (onFileUpdated) onFileUpdated(updated)
          
          showModal({ title: "Actualizado", message: "Archivo actualizado correctamente.", type: "success" })
      } catch (e: any) {
          console.error(e)
          showModal({ title: "Error", message: e.message || "No se pudo actualizar el archivo.", type: "error" })
      }
  }

  // Advanced States
  const [searchTerm, setSearchTerm] = useState("")
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const [sortBy, setSortBy] = useState<'date' | 'size' | 'downloads'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView as 'grid' | 'list')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Filter & Sort Logic
  const filteredAndSortedFiles = useMemo(() => {
      let data = tab === 'active' ? files : history
      
      // Search
      if (searchTerm) {
          data = data.filter(f => f.originalName.toLowerCase().includes(searchTerm.toLowerCase()))
      }

      // Sort
      return [...data].sort((a, b) => {
          let valA, valB
          switch (sortBy) {
              case 'date':
                  valA = new Date(a.createdAt).getTime()
                  valB = new Date(b.createdAt).getTime()
                  break
              case 'size':
                  valA = a.size
                  valB = b.size
                  break
              case 'downloads':
                  valA = a.downloads || 0
                  valB = b.downloads || 0
                  break
              default:
                  return 0
          }
          return sortOrder === 'desc' ? valB - valA : valA - valB
      })
  }, [files, history, tab, searchTerm, sortBy, sortOrder])

  const toggleSelect = (id: string) => {
      const newSelected = new Set(selectedIds)
      if (newSelected.has(id)) newSelected.delete(id)
      else newSelected.add(id)
      setSelectedIds(newSelected)
  }

  const selectAll = () => {
      if (selectedIds.size === filteredAndSortedFiles.length) {
          setSelectedIds(new Set())
      } else {
          setSelectedIds(new Set(filteredAndSortedFiles.map(f => f._id)))
      }
  }

  const handleDelete = (id: string, isHistory: boolean = false) => {
    showModal({
        title: isHistory ? "Ocultar del Historial" : "Eliminar Archivo",
        message: isHistory 
            ? "¿Quieres ocultar este archivo de tu historial? No se eliminarán datos, solo desaparecerá de esta lista."
            : "¿Estás seguro de que quieres eliminar este archivo? Pasará a tu historial de inactivos.",
        type: "confirm",
        confirmText: isHistory ? "Ocultar" : "Eliminar",
        cancelText: "Cancelar",
        onConfirm: async () => {
            setDeletingId(id)
            try {
              if (isHistory) {
                  const res = await fetch(`/api/history/${id}`, { method: "DELETE" })
                  if (!res.ok) throw new Error("Failed to hide")
                  setHistory(prev => prev.filter(f => f._id !== id))
              } else {
                  const res = await fetch(`/api/files/${id}`, { method: "DELETE" })
                  if (!res.ok) throw new Error("Failed to delete")
                  setFiles(prev => prev.filter(f => f._id !== id))
                  if (onFileDeleted) onFileDeleted(id)
                  router.refresh()
              }
              // Remove from selection if present
              const newSelected = new Set(selectedIds);
              newSelected.delete(id);
              setSelectedIds(newSelected);
            } catch (err) {
              console.error(err)
              showModal({ title: "Error", message: "Error al procesar la solicitud", type: "error" })
            } finally {
              setDeletingId(null)
            }
        }
    })
  }
  
  const handleBulkDelete = () => {
      if (selectedIds.size === 0) return
      
      const isHistory = tab === 'history'
      showModal({
        title: isHistory ? `Ocultar ${selectedIds.size} archivos` : `Eliminar ${selectedIds.size} archivos`,
        message: "Esta acción afectará a todos los elementos seleccionados.",
        type: "confirm",
        confirmText: "Confirmar",
        cancelText: "Cancelar",
        onConfirm: async () => {
            // Bulk delete logic would go here. For now, sequential/parallel requests or a new API endpoint.
            // Let's implement basic parallel requests for now as I can't add new API easily in this step without interrupting.
            // Ideally should be a bulk API.
            try {
                // Determine API endpoint
                const endpoint = isHistory ? '/api/history/' : '/api/files/'
                
                // Optimistic update
                if (isHistory) {
                    setHistory(prev => prev.filter(f => !selectedIds.has(f._id)))
                } else {
                    setFiles(prev => prev.filter(f => !selectedIds.has(f._id)))
                }
                
                // Fire and forget requests (mostly) or Promise.all
                const promises = Array.from(selectedIds).map(id => fetch(`${endpoint}${id}`, { method: 'DELETE' }))
                await Promise.all(promises)
                
                setSelectedIds(new Set())
                router.refresh()
            } catch (e) {
                console.error(e)
                alert("Error en eliminación masiva")
            }
        }
      })
  }

  const copyLink = (id: string) => {
     // Search in both arrays
     const file = history.find(f => f._id === id) || files.find(f => f._id === id)
     // Use original transferID for expired files if present, else id
     const targetId = (tab === 'history' && file?.transferId) ? file.transferId : id
     
     const url = `${window.location.origin}/d/${targetId}`
     
     navigator.clipboard.writeText(url)
     showModal({ 
         title: "Enlace Copiado", 
         message: "El enlace de descarga ha sido copiado al portapapeles.",
         type: "success",
         confirmText: "Entendido"
     })
  }

  if (files.length === 0 && history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400">
        <HardDrive className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-xl font-medium text-white">Sin archivos</h3>
        <p>Sube archivos para comenzar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm sticky top-4 z-20">
            {/* Search */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Buscar archivos..." 
                    className="w-full bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none placeholder:text-zinc-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                <div className="flex bg-zinc-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setTab('active')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === 'active' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
                    >
                        Activos ({files.length})
                    </button>
                    <button 
                        onClick={() => setTab('history')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === 'history' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
                    >
                        Historial ({history.length})
                    </button>
                </div>

                <div className="h-6 w-px bg-white/10 mx-2" />
                
                <button 
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowUpDown className="w-4 h-4" />
                </button>
                
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-zinc-800 text-zinc-300 text-xs py-2 px-3 rounded-xl border-none outline-none cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                    <option value="date">Fecha</option>
                    <option value="size">Tamaño</option>
                    <option value="downloads">Descargas</option>
                </select>

                <div className="h-6 w-px bg-white/10 mx-2" />

                 <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                    <Grid className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                    <ListIcon className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Selection Bar */}
        <AnimatePresence>
        {selectedIds.size > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-between bg-primary/10 border border-primary/20 p-3 rounded-xl px-6"
            >
                <span className="text-sm text-primary font-medium">{selectedIds.size} seleccionados</span>
                <div className="flex gap-4">
                     <button onClick={() => setSelectedIds(new Set())} className="text-xs text-primary/70 hover:text-primary transition-colors">Cancelar</button>
                     <button onClick={handleBulkDelete} className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors font-bold shadow-lg shadow-primary/20">
                         {tab === 'active' ? 'Eliminar' : 'Ocultar'}
                     </button>
                </div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* Files Grid / List */}
        {filteredAndSortedFiles.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
                No se encontraron archivos que coincidan.
            </div>
        ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <AnimatePresence mode="popLayout">
                {filteredAndSortedFiles.map((file) => (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={file._id} 
                        className={`
                            group relative border rounded-2xl transition-all duration-300
                            ${selectedIds.has(file._id) ? 'bg-primary/5 border-primary/50' : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-800/50 hover:border-white/10'}
                            ${tab === 'history' ? 'opacity-75 grayscale hover:grayscale-0' : ''}
                            ${viewMode === 'list' ? 'flex items-center gap-6 p-4' : 'p-6'}
                        `}
                        onClick={() => toggleSelect(file._id)}
                    >
                        {/* Checkbox Overlay */}
                        <div className={`
                            absolute top-4 right-4 z-10 transition-all duration-200
                            ${selectedIds.has(file._id) ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100'}
                        `}>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${selectedIds.has(file._id) ? 'bg-primary border-primary' : 'bg-black/50 border-white/30'}`}>
                                {selectedIds.has(file._id) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                            </div>
                        </div>

                        {/* Icon */}
                        <div className={`${viewMode === 'list' ? 'shrink-0' : 'mb-4 flex justify-between items-start'}`}>
                            <div className={`relative p-3 rounded-xl ${tab === 'history' ? 'bg-zinc-800 text-zinc-500' : 'bg-blue-500/10 text-blue-400'}`}>
                                <FileIcon className="w-6 h-6" />
                                {file.passwordHash && (
                                    <div className="absolute -top-2 -right-2 bg-zinc-900 rounded-full p-1 border border-zinc-800 shadow-sm" title="Protegido con contraseña">
                                        <Lock className="w-3 h-3 text-orange-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow min-w-0">
                            <h3 className={`font-medium text-white mb-1 truncate ${tab === 'history' ? 'line-through text-zinc-500' : ''}`} title={file.originalName}>
                                {file.originalName}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                <span>{formatBytes(file.size)}</span>
                                {viewMode === 'list' && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats & Actions */}
                        <div className={`${viewMode === 'list' ? 'flex items-center gap-8 shrink-0' : 'mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500'}`}>
                             {/* Stats */}
                             <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5" title="Descargas">
                                    <Download className="w-3.5 h-3.5" />
                                    <span>{file.downloads}</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="Visitas">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{file.views || 0}</span>
                                </div>
                             </div>

                             {/* Single Actions */}
                             <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <button 
                                    onClick={() => copyLink(file._id)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                {tab === 'active' && (
                                    <button 
                                        onClick={() => setEditingFile(file)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleDelete(file._id, tab === 'history')}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
        )}

        <EditFileModal 
            isOpen={!!editingFile}
            onClose={() => setEditingFile(null)}
            file={editingFile}
            onSave={handleSaveEdit}
        />
    </div>
  )
}
