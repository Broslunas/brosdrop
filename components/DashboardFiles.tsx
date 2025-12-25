"use client"

import { useState } from "react"
import { ITransfer } from "@/models/Transfer"
import { Trash2, ExternalLink, Copy, FileIcon, Calendar, Download, HardDrive } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

// Format bytes to human readable
const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

import { useModal } from "@/components/ModalProvider"

export default function DashboardClient({ initialFiles, historyFiles = [] }: { initialFiles: any[], historyFiles?: any[] }) {
  const [files, setFiles] = useState<ITransfer[]>(initialFiles)
  const [history, setHistory] = useState<any[]>(historyFiles)
  
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { showModal } = useModal()

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
                  router.refresh() // Refresh to update history list potentially
              }
            } catch (err) {
              console.error(err)
              showModal({ title: "Error", message: "Error al procesar la solicitud", type: "error" })
            } finally {
              setDeletingId(null)
            }
        }
    })
  }

  const copyLink = (id: string, isHistory: boolean = false) => {
     // For history, we use the transferId if available, or just the id if it matches
     // But wait, the history items have _id as their ExpiredTransfer ID.
     // The download page looks up by transferId OR ID?
     // In ExpiredTransfer check, it looks for { transferId: id }.
     // So we need to pass the ORIGINAL Transfer ID to the URL if we want it to work?
     // Actually, Step 325 schema says IExpiredTransfer has transferId.
     // Step 328 page.tsx uses `transferId: id` query.
     // So if I use the original ID (transferId), it will match.
     
     // The `id` passed here is `_id`. For history items, `_id` is the ExpiredTransfer ID.
     // The file object has `transferId`.
     // Let's modify the copyLink to take the full object or handle `transferId`.
     
     // Actually, wait. The page logic:
     // 1. Try Transfer.findById(id)
     // 2. If not found, try ExpiredTransfer.findOne({ transferId: id })
     
     // So if I validly want to show the "Expired" page, I must pass the ORIGINAL Transfer ID.
     // In `active` files, `_id` IS the Transfer ID.
     // In `history` files, `transferId` IS the Transfer ID.
     
     // I need to find the file object to get transferId if it's history.
     const file = history.find(f => f._id === id) || files.find(f => f._id === id)
     const targetId = (isHistory && file?.transferId) ? file.transferId : id
     
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
        <p>Sube archivos para verlos aquí.</p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
        {/* Active Files */}
        {files.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                {files.map((file) => (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={file._id} 
                        className="group relative bg-zinc-900/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:bg-zinc-800/50 hover:border-white/10 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                <FileIcon className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => copyLink(file._id)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                    title="Copiar Link"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(file._id)}
                                    disabled={deletingId === file._id}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-colors disabled:opacity-50"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="font-medium text-white mb-1 truncate" title={file.originalName}>
                            {file.originalName}
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6">
                            {formatBytes(file.size)}
                        </p>

                        <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-white/5 pt-4">
                            <div className="flex items-center gap-1.5" title={new Date(file.expiresAt).toLocaleString()}>
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Expira el {new Date(file.expiresAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Download className="w-3.5 h-3.5" />
                                <span>{file.downloads}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
        )}

        {/* History / Expired Files */}
        {history.length > 0 && (
            <div>
                <h2 className="text-lg font-semibold text-zinc-400 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Historial de Archivos (Inactivos)
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                    {history.map((file) => (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={file._id} 
                            className="group relative bg-zinc-900/20 grayscale backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:grayscale-0 hover:bg-zinc-900/40 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-lg bg-zinc-800 text-zinc-500">
                                    <FileIcon className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => copyLink(file._id, true)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                                        title="Copiar Link Original"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(file._id, true)}
                                        disabled={deletingId === file._id}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                        title="Ocultar del historial"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-medium text-zinc-400 mb-1 truncate line-through" title={file.originalName}>
                                {file.originalName}
                            </h3>
                            <p className="text-sm text-zinc-600 mb-6">
                                {formatBytes(file.size)} • Expirado
                            </p>

                            <div className="flex items-center justify-between text-xs text-zinc-600 border-t border-white/5 pt-4">
                                <div>
                                    No disponible
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Download className="w-3.5 h-3.5" />
                                    <span>{file.downloads}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
            </div>
        )}
    </div>
  )
}
