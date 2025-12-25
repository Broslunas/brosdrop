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

export default function DashboardClient({ initialFiles }: { initialFiles: any[] }) {
  // casting initialFiles to any[] to avoid strict type issues if serialization differs slightly, 
  // but ideally ITransfer[].
  const [files, setFiles] = useState<ITransfer[]>(initialFiles)
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file? This action cannot be undone.")) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/files/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      
      setFiles(prev => prev.filter(f => f._id !== id))
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Error deleting file")
    } finally {
      setDeletingId(null)
    }
  }

  const copyLink = (id: string) => {
     const url = `${window.location.origin}/d/${id}`
     navigator.clipboard.writeText(url)
     // alert("Link copied to clipboard!") 
     // A better notification would be nice but keeping it simple
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400">
        <HardDrive className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-xl font-medium text-white">No files found</h3>
        <p>Upload files to see them here.</p>
      </div>
    )
  }

  return (
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
                        title="Copy Link"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(file._id)}
                        disabled={deletingId === file._id}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete"
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
                    <span>Expires {new Date(file.expiresAt).toLocaleDateString()}</span>
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
  )
}
