"use client"

import { useState, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, AlertCircle } from "lucide-react"
import JSZip from "jszip"

import { useSession } from "next-auth/react"
import { useModal } from "@/components/ModalProvider"

import UploadForm from "@/components/upload/UploadForm"
import UploadProgress from "@/components/upload/UploadProgress"
import UploadSuccess from "@/components/upload/UploadSuccess"

interface DropZoneProps {
    maxBytes?: number
    maxSizeLabel?: string
    planName?: string
    maxDays?: number
}

export default function DropZone({ maxBytes, maxSizeLabel, planName, maxDays }: DropZoneProps) {
  const { data: session } = useSession()
  const { showModal } = useModal()
  const [files, setFiles] = useState<File[]>([])
  
  // Check if verified (use as any because of type definitions)
  const isVerified = (session?.user as any)?.emailVerified

  // Limits
  const MAX_SIZE = maxBytes || (isVerified ? 200 * 1024 * 1024 : 10 * 1024 * 1024)
  const MAX_SIZE_LABEL = maxSizeLabel || (isVerified ? "200MB" : "10MB")
  // Default to 7 days if verified, 30 mins if not, unless maxDays provided
  const MAX_DAYS = maxDays !== undefined ? maxDays : (isVerified ? 7 : 0.02)

  // Default expiration logic
  const initialHours = Math.min(168, MAX_DAYS * 24) 
  const [expirationHours, setExpirationHours] = useState(initialHours)

  const [useCustomDate, setUseCustomDate] = useState(false)
  const [customDateValue, setCustomDateValue] = useState('')
  const [password, setPassword] = useState('')
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [customLink, setCustomLink] = useState('')
  const [showCustomLink, setShowCustomLink] = useState(false)

  // New Features State
  const [oneTimeDownload, setOneTimeDownload] = useState<number | null>(null)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [showEmailInput, setShowEmailInput] = useState(false)
  
  // QR Code State
  const [showQR, setShowQR] = useState(false)
  
  const totalSize = useMemo(() => files.reduce((acc, f) => acc + f.size, 0), [files])

  const validateFiles = (newFiles: File[]) => {
      const newTotalSize = newFiles.reduce((acc, f) => acc + f.size, 0) + totalSize
      
      if (newTotalSize > MAX_SIZE) {
          showModal({
              title: "Límite Excedido",
              message: `El tamaño total excede el límite de ${MAX_SIZE_LABEL}. ${!session ? 'Inicia sesión para subir hasta 200MB.' : !isVerified ? 'Verifica tu email para desbloquear 200MB.' : ''}`,
              type: "warning",
              confirmText: "Entendido"
          })
          return false
      }
      return true
  }

  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'zipping' | 'uploading' | 'success' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      if (validateFiles(droppedFiles)) {
          setFiles(prev => [...prev, ...droppedFiles])
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      if (validateFiles(selectedFiles)) {
        setFiles(prev => [...prev, ...selectedFiles])
      }
    }
    // Reset so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index: number) => {
      setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const [downloadUrl, setDownloadUrl] = useState('')

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploadStatus(files.length > 1 ? 'zipping' : 'uploading')
    setProgress(0)

    try {
        let fileToUpload: File;

        if (files.length > 1) {
            const zip = new JSZip()
            files.forEach(f => {
                zip.file(f.name, f)
            })
            const blob = await zip.generateAsync({ type: "blob" }, (metadata) => {
                setProgress(Math.round(metadata.percent))
            })
            fileToUpload = new File([blob], `brosdrop-bundle-${Date.now()}.zip`, { type: "application/zip" })
            setUploadStatus('uploading')
            setProgress(0)
        } else {
            fileToUpload = files[0]
        }

        // 1. Get Signed URL
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: JSON.stringify({
                name: fileToUpload.name,
                type: fileToUpload.type,
                size: fileToUpload.size,
                expiresInHours: session && !useCustomDate ? expirationHours : null,
                customExpiresAt: session && useCustomDate ? customDateValue : null,
                password: session && password ? password : null,
                customLink: session && customLink ? customLink : null,
                maxDownloads: oneTimeDownload, 
                recipientEmail: recipientEmail || null 
            }),
            headers: { 'Content-Type': 'application/json' }
        })

        if (!res.ok) throw new Error('Failed to start upload')
        
        const { url, id, expiresAt } = await res.json()

        // 2. Upload to R2
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', url, true)
        xhr.setRequestHeader('Content-Type', fileToUpload.type)

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100
                setProgress(Math.round(percentComplete))
            }
        }

        xhr.onload = () => {
            if (xhr.status === 200) {
                setUploadStatus('success')
                const identifier = (session && customLink) ? customLink : id
                const finalLink = `${window.location.origin}/d/${identifier}`
                setDownloadUrl(finalLink)
                
                // Feature: Send Email via Hook
                if (recipientEmail) {
                    const recipients = recipientEmail.split(',').map(e => e.trim()).filter(e => e)
                    if (recipients.length > 0) {
                        const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://n8n.broslunas.com/webhook/brosdrop-send-via-email'
                        fetch(webhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                recipients,
                                downloadUrl: finalLink,
                                fileName: fileToUpload.name,
                                fileSize: (fileToUpload.size / 1024 / 1024).toFixed(2) + ' MB',
                                senderEmail: session?.user?.email || 'guest',
                                expiresAt,
                                hasPassword: !!password,
                                password: password || null
                            })
                        }).catch(err => console.error("Failed to trigger email webhook", err))
                    }
                }

            } else {
                setUploadStatus('error')
            }
        }

        xhr.onerror = () => {
             setUploadStatus('error')
        }

        xhr.send(fileToUpload)

    } catch (err) {
        console.error(err)
        setUploadStatus('error') 
    }
  }

  const reset = () => {
    setFiles([])
    setUploadStatus('idle')
    setProgress(0)
    setDownloadUrl('')
    setUseCustomDate(false)
    setCustomDateValue('')
    setPassword('')
    setShowPasswordInput(false)
    setCustomLink('')
    setShowCustomLink(false)
    setOneTimeDownload(null)
    setRecipientEmail('')
    setShowQR(false)
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {files.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
              relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed
              transition-all duration-300 ease-in-out
              ${isDragging 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-900'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
             <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className={`
                    mb-6 rounded-2xl p-4 transition-colors duration-300
                    ${isDragging ? 'bg-primary/20 text-primary' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200'}
                `}>
                    <Upload className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-bold tracking-tight">
                    Subir Archivos
                </h3>
                <p className="text-sm text-zinc-400 max-w-[260px]">
                    Arrastra tus archivos aquí o haz clic para explorar. Máximo {MAX_SIZE_LABEL}.
                </p>
             </div>
             <input 
                type="file" 
                multiple
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect} 
             />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
             {uploadStatus === 'idle' && (
                <UploadForm
                    files={files}
                    isVerified={isVerified}
                    maxDays={MAX_DAYS}
                    expirationHours={expirationHours}
                    setExpirationHours={setExpirationHours}
                    useCustomDate={useCustomDate}
                    setUseCustomDate={setUseCustomDate}
                    customDateValue={customDateValue}
                    setCustomDateValue={setCustomDateValue}
                    password={password}
                    setPassword={setPassword}
                    setShowPasswordInput={setShowPasswordInput}
                    customLink={customLink}
                    setCustomLink={setCustomLink}
                    setShowCustomLink={setShowCustomLink}
                    oneTimeDownload={oneTimeDownload}
                    setOneTimeDownload={setOneTimeDownload}
                    recipientEmail={recipientEmail}
                    setRecipientEmail={setRecipientEmail}
                    showEmailInput={showEmailInput}
                    setShowEmailInput={setShowEmailInput}
                    onAddFiles={handleFileSelect}
                    onRemoveFile={removeFile}
                    onCancelAll={reset}
                    onUpload={handleUpload}
                    fileInputRef={fileInputRef}
                    totalSize={totalSize}
                />
             )}
             
             {(uploadStatus === 'uploading' || uploadStatus === 'zipping') && (
                 <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-xl">
                    <UploadProgress status={uploadStatus} progress={progress} />
                 </div>
             )}
             
             {uploadStatus === 'success' && (
                  <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-xl">
                     <UploadSuccess 
                        downloadUrl={downloadUrl}
                        showQR={showQR}
                        setShowQR={setShowQR}
                        onReset={reset}
                     />
                 </div>
             )}
             
             {uploadStatus === 'error' && (
                  <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-xl text-center py-4">
                     <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                         <AlertCircle className="h-6 w-6" />
                     </div>
                     <h4 className="text-lg font-bold text-red-500">Error al subir</h4>
                     <p className="text-sm text-zinc-500 mb-4">Algo salió mal.</p>
                     <button onClick={reset} className="w-full rounded-xl bg-zinc-800 py-3 text-sm font-medium hover:bg-zinc-700 transition-colors">
                         Intentar de nuevo
                     </button>
                  </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
