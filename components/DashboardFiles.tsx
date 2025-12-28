"use client"

import { useState, useMemo, useEffect } from "react"
import { ITransfer } from "@/models/Transfer"
import { Trash2, ExternalLink, Copy, FileIcon, Calendar, Download, HardDrive, Eye, Search, Filter, ArrowUpDown, Check, X, Grid, List as ListIcon, Edit2, Lock, Music, Video, Image as ImageIcon, FileText, Archive, FileCode, Clock, QrCode, AlertTriangle, Globe, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useModal } from "@/components/ModalProvider"
import EditFileModal from "@/components/EditFileModal"
import QRModal from "@/components/QRModal"

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

const getFileIconColor = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'

  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) return 'bg-green-500/10 text-green-600 dark:text-green-400'
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'html', 'css', 'json'].includes(ext)) return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) return 'bg-red-500/10 text-red-600 dark:text-red-400'
  
  return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
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
  const [activeModalMode, setActiveModalMode] = useState<'edit' | 'qr'>('edit')

  const handleSaveEdit = async (id: string, newName: string, password?: string | null, newExpiration?: string, customLink?: string, maxDownloads?: number | null, qrOptions?: { fgColor: string, bgColor: string, logoUrl?: string }, isPublic?: boolean) => {
      try {
          const res = await fetch(`/api/files/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  name: newName, 
                  password: password, 
                  removePassword: password === null,
                  expiresAt: newExpiration,
                  customLink: customLink,
                  maxDownloads: maxDownloads,
                  qrOptions: qrOptions,
                  isPublic: isPublic
              })
          })
          
          const data = await res.json()

          if (!res.ok) {
              throw new Error(data.error || "Error al actualizar")
          }
          
          const updated = { 
              ...files.find(f => f._id === id)!, 
              originalName: newName, 
              passwordHash: data.transfer.passwordHash,
              expiresAt: data.transfer.expiresAt || newExpiration,
              customLink: data.transfer.customLink,
              maxDownloads: data.transfer.maxDownloads,
              qrOptions: data.transfer.qrOptions,
              isPublic: data.transfer.isPublic
          }
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
        <h3 className="text-xl font-medium text-zinc-900 dark:text-white">Sin archivos</h3>
        <p>Sube archivos para comenzar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-white/5 backdrop-blur-sm sticky top-4 z-20">
            {/* Search */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Buscar archivos..." 
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-white focus:ring-1 focus:ring-primary outline-none placeholder:text-zinc-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setTab('active')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === 'active' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                    >
                        Activos ({files.length})
                    </button>
                    <button 
                        onClick={() => setTab('history')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === 'history' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                    >
                        Historial ({history.length})
                    </button>
                </div>

                <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 mx-2" />
                
                <button 
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                    <ArrowUpDown className="w-4 h-4" />
                </button>
                
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-300 text-xs py-2 px-3 rounded-xl border-none outline-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                    <option value="date">Fecha</option>
                    <option value="size">Tamaño</option>
                    <option value="downloads">Descargas</option>
                </select>

                <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 mx-2" />

                 <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                    <Grid className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
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
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
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
                            ${selectedIds.has(file._id) ? 'bg-primary/5 border-primary/50' : 'bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-white/10'}
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
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${selectedIds.has(file._id) ? 'bg-primary border-primary' : 'bg-white/80 dark:bg-black/50 border-zinc-300 dark:border-white/30'}`}>
                                {selectedIds.has(file._id) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                            </div>
                        </div>

                        {/* Icon */}
                        <div className={`${viewMode === 'list' ? 'shrink-0' : 'mb-4 flex justify-between items-start'}`}>
                            <div className={`relative p-3 rounded-xl ${tab === 'history' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500' : (file.blocked ? 'bg-red-500/10 text-red-500 dark:text-red-400' : getFileIconColor(file.originalName))}`}>
                                {(() => {
                                    if (file.blocked) return <AlertTriangle className="w-6 h-6" />
                                    const Icon = getFileIcon(file.originalName)
                                    return <Icon className="w-6 h-6" />
                                })()}
                                {file.passwordHash && !file.blocked && (
                                    <div className="absolute -top-2 -right-2 bg-white dark:bg-zinc-900 rounded-full p-1 border border-zinc-200 dark:border-zinc-800 shadow-sm" title="Protegido con contraseña">
                                        <Lock className="w-3 h-3 text-orange-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow min-w-0">
                            <h3 className={`font-medium text-zinc-900 dark:text-white mb-1 truncate ${tab === 'history' ? 'line-through text-zinc-500' : ''}`} title={file.originalName}>
                                {file.originalName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                                <span>{formatBytes(file.size)}</span>
                                {viewMode === 'list' && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                    </>
                                )}
                                
                                {tab === 'active' && file.blocked && (
                                    <div className="w-full mt-2">
                                        <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-bold uppercase tracking-wider mb-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            <span>Bloqueado</span>
                                        </div>
                                        {file.blockedMessage && (
                                            <p className="text-[10px] text-red-500/80 dark:text-red-400/80 bg-red-500/5 p-1.5 rounded border border-red-500/10 line-clamp-2">
                                                {file.blockedMessage}
                                            </p>
                                        )}
                                    </div>
                                )}
                                
                                {tab === 'active' && file.expiresAt && !file.blocked && (
                                    <>
                                        <span className="hidden sm:block w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                        <div className="flex items-center gap-1.5 text-xs text-orange-600/80 dark:text-orange-400/80 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20 w-fit">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                                {(() => {
                                                    const diff = new Date(file.expiresAt).getTime() - Date.now()
                                                    if (diff < 0) return "Expirado"
                                                    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                                                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                                                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                                                    
                                                    if (days > 0) return `${days}d restantes`
                                                    if (hours > 0) return `${hours}h restantes`
                                                    return `${minutes}m restantes`
                                                })()}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats & Actions */}
                        <div className={`${viewMode === 'list' ? 'flex items-center gap-8 shrink-0' : 'mt-6 pt-4 border-t border-zinc-200 dark:border-white/5 flex items-center justify-between text-xs text-zinc-500'}`}>
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
                                    onClick={async () => {
                                        // Quick Toggle
                                        if (file.blocked) return
                                        try {
                                             const newStatus = !file.isPublic
                                             const res = await fetch(`/api/files/${file._id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ isPublic: newStatus })
                                            })
                                            if (!res.ok) throw new Error("Failed")
                                            
                                            setFiles(prev => prev.map(f => f._id === file._id ? { ...f, isPublic: newStatus } : f))
                                        } catch (e) {
                                            toast.error("Error al cambiar visibilidad")
                                        }
                                    }}
                                    disabled={file.blocked}
                                    className={`p-2 rounded-lg transition-colors ${file.blocked ? 'text-zinc-400 cursor-not-allowed' : (file.isPublic ? 'hover:bg-primary/10 text-primary hover:text-primary' : 'hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white')}`}
                                    title={file.blocked ? "Bloqueado" : (file.isPublic ? "Público (Visible en perfil)" : "Privado (Oculto en perfil)")}
                                >
                                    {file.isPublic ? <Globe className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button 
                                    onClick={() => copyLink(file._id)}
                                    disabled={file.blocked}
                                    className={`p-2 rounded-lg transition-colors ${file.blocked ? 'text-zinc-400 cursor-not-allowed' : 'hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                                    title={file.blocked ? "Acción no disponible" : "Copiar enlace"}
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                {tab === 'active' && (
                                    <button 
                                        onClick={() => {
                                            if (file.blocked) return
                                            setActiveModalMode('edit')
                                            setEditingFile(file)
                                        }}
                                        disabled={file.blocked}
                                        className={`p-2 rounded-lg transition-colors ${file.blocked ? 'text-zinc-400 cursor-not-allowed' : 'hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                                        title={file.blocked ? "Acción no disponible" : "Editar"}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                )}
                                {tab === 'active' && (
                                     <button 
                                        onClick={() => {
                                            if (file.blocked) return
                                            setActiveModalMode('qr')
                                            setEditingFile(file)
                                        }}
                                        disabled={file.blocked}
                                        className={`p-2 rounded-lg transition-colors ${file.blocked ? 'text-zinc-400 cursor-not-allowed' : 'hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                                        title={file.blocked ? "Acción no disponible" : "Código QR"}
                                    >
                                        <QrCode className="w-4 h-4" />
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleDelete(file._id, tab === 'history')}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    title="Eliminar"
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
            isOpen={activeModalMode === 'edit' && !!editingFile}
            onClose={() => setEditingFile(null)}
            file={editingFile}
            onSave={handleSaveEdit}
        />

        <QRModal 
            isOpen={activeModalMode === 'qr' && !!editingFile}
            onClose={() => setEditingFile(null)}
            file={editingFile}
            onSave={async (id, qrOptions) => {
                 if (!editingFile) return
                 await handleSaveEdit(
                    id, 
                    editingFile.originalName, 
                    undefined, 
                    undefined, 
                    editingFile.customLink || undefined, 
                    editingFile.maxDownloads, 
                    qrOptions
                 )
            }}
        />
    </div>
  )
}
