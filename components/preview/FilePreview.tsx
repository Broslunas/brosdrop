"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ImagePreview from "./ImagePreview"
import VideoPreview from "./VideoPreview"
import AudioPreview from "./AudioPreview"
import PDFPreview from "./PDFPreview"
import CodePreview from "./CodePreview"
import DocumentPreview from "./DocumentPreview"

interface FilePreviewProps {
  fileName: string
  fileUrl: string
  fileSize: number
  onClose: () => void
  onDownload: () => void
}

export type FileType = 'image' | 'video' | 'audio' | 'pdf' | 'code' | 'document' | 'unknown'

const getFileType = (filename: string): FileType => {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return 'unknown'

  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'image'
  
  // Videos
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'ogv'].includes(ext)) return 'video'
  
  // Audio
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext)) return 'audio'
  
  // PDF
  if (ext === 'pdf') return 'pdf'
  
  // Code files
  if ([
    'js', 'ts', 'tsx', 'jsx', 'py', 'html', 'css', 'json', 'xml', 
    'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift', 'kt',
    'sh', 'bash', 'yml', 'yaml', 'md', 'txt', 'log', 'sql'
  ].includes(ext)) return 'code'
  
  // Documents (Word, Excel, PowerPoint)
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'].includes(ext)) return 'document'
  
  return 'unknown'
}

export default function FilePreview({ fileName, fileUrl, fileSize, onClose, onDownload }: FilePreviewProps) {
  const [mounted, setMounted] = useState(false)
  const fileType = getFileType(fileName)

  // Ensure we're on the client before using createPortal
  useEffect(() => {
    setMounted(true)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const renderPreview = () => {
    switch (fileType) {
      case 'image':
        return <ImagePreview fileUrl={fileUrl} fileName={fileName} />
      case 'video':
        return <VideoPreview fileUrl={fileUrl} fileName={fileName} />
      case 'audio':
        return <AudioPreview fileUrl={fileUrl} fileName={fileName} />
      case 'pdf':
        return <PDFPreview fileUrl={fileUrl} fileName={fileName} />
      case 'code':
        return <CodePreview fileUrl={fileUrl} fileName={fileName} />
      case 'document':
        return <DocumentPreview fileUrl={fileUrl} fileName={fileName} />
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-zinc-400 mb-4">Vista previa no disponible para este tipo de archivo</p>
              <button
                onClick={onDownload}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary rounded-xl text-white font-medium hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar para ver
              </button>
            </div>
          </div>
        )
    }
  }

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden w-[95vw] h-[95vh] max-w-7xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-xl">
            <div className="flex-1 min-w-0 mr-4">
              <h2 className="text-lg font-semibold text-white truncate">{fileName}</h2>
              <p className="text-sm text-zinc-500">
                {(fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Cerrar vista previa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="h-[calc(100%-73px)] overflow-auto bg-zinc-950">
            {renderPreview()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  // Only render portal on client-side
  if (!mounted) return null

  return createPortal(modalContent, document.body)
}
