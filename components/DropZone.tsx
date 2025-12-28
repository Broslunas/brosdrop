"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, AlertCircle } from "lucide-react"
import { toast } from "sonner"
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
    externalFiles?: File[]
    onExternalFilesProcessed?: () => void
}

export default function DropZone({ maxBytes, maxSizeLabel, planName, maxDays, externalFiles, onExternalFilesProcessed }: DropZoneProps) {
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
  
  // Zip/Separate Toggle
  const [zipFiles, setZipFiles] = useState(true)
  
  const totalSize = useMemo(() => files.reduce((acc, f) => acc + f.size, 0), [files])

  const validateFiles = (newFiles: File[]) => {
      const newTotalSize = newFiles.reduce((acc, f) => acc + f.size, 0) + totalSize
      
      if (newTotalSize > MAX_SIZE) {
          toast.warning("Límite de tamaño excedido")
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

  // Handle external files from cloud import
  useEffect(() => {
    if (externalFiles && externalFiles.length > 0) {
      console.log('📥 Recibiendo archivos externos:', externalFiles.length)
      if (validateFiles(externalFiles)) {
        setFiles(prev => [...prev, ...externalFiles])
        toast.success(`${externalFiles.length} archivo(s) añadido(s) desde la nube`)
      }
      onExternalFilesProcessed?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalFiles])

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

  const [downloadUrls, setDownloadUrls] = useState<string[]>([])
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]) // Track file IDs for cloud export

  // Helper to upload a single file
  const uploadFile = async (file: File, index: number, total: number) => {
        // Calculate progress chunk for this file
        // To keep it simple, we just show 0-100% for the current file or global progress
        // Let's do global progress: (index / total) * 100 + (current_file_progress / total)

        // 1. Get Signed URL & Token
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: JSON.stringify({
                name: file.name,
                type: file.type,
                size: file.size,
                expiresInHours: session && !useCustomDate ? expirationHours : null,
                customExpiresAt: session && useCustomDate ? customDateValue : null,
                password: session && password ? password : null,
                customLink: (session && customLink && total === 1) ? customLink : null, 
                maxDownloads: oneTimeDownload, 
                recipientEmail: recipientEmail || null 
            }),
            headers: { 'Content-Type': 'application/json' }
        })

        if (!res.ok) throw new Error(`Failed to start upload for ${file.name}`)
        
        const { url, token, fileKey } = await res.json()

        // 2. Upload to R2
        return new Promise<{ link: string, fileId: string }>((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('PUT', url, true)
            xhr.setRequestHeader('Content-Type', file.type)

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const filePercent = (e.loaded / e.total) * 100
                    const globalPercent = ((index * 100) + filePercent) / total
                    setProgress(Math.round(globalPercent))
                }
            }

            xhr.onload = async () => {
                if (xhr.status === 200) {
                    try {
                        // 3. Finalize Upload (Create DB Record)
                        const completeRes = await fetch('/api/upload/complete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token })
                        })

                        if (!completeRes.ok) {
                            throw new Error('Failed to finalize upload')
                        }

                        const { id, link } = await completeRes.json()

                        // Email logic
                        if (recipientEmail) {
                            const recipients = recipientEmail.split(',').map(e => e.trim()).filter(e => e)
                            if (recipients.length > 0) {
                                // Re-parse basic info for email (safe estimate)
                                const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://n8n.broslunas.com/webhook/brosdrop-send-via-email'
                                fetch(webhookUrl, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        recipients,
                                        downloadUrl: link, // Use final link
                                        fileName: file.name,
                                        fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                                        senderEmail: session?.user?.email || 'guest',
                                        expiresAt: null, // We might not have this easily available without decoding token, can skip or pass from step 1 if needed.
                                        hasPassword: !!password,
                                        password: password || null
                                    })
                                }).catch(err => console.error("Failed to trigger email webhook", err))
                            }
                        }

                        resolve({ link, fileId: id })
                    } catch (err) {
                        reject(new Error(`Failed to finalize upload for ${file.name}`))
                    }
                } else {
                    reject(new Error(`Upload failed for ${file.name}`))
                }
            }

            xhr.onerror = () => {
                reject(new Error(`Network error for ${file.name}`))
            }
            xhr.send(file)
        })
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploadStatus(files.length > 1 && zipFiles ? 'zipping' : 'uploading')
    setProgress(0)
    setDownloadUrls([])
    setUploadedFileIds([])

    try {
        if (files.length > 1 && zipFiles) {
            // ZIP MODE
            const zip = new JSZip()
            files.forEach(f => {
                zip.file(f.name, f)
            })
            const blob = await zip.generateAsync({ type: "blob" }, (metadata) => {
                setProgress(Math.round(metadata.percent))
            })
            const fileToUpload = new File([blob], `brosdrop-bundle-${Date.now()}.zip`, { type: "application/zip" })
            
            setUploadStatus('uploading')
            setProgress(0)
            
            const result = await uploadFile(fileToUpload, 0, 1)
            setDownloadUrls([result.link])
            setUploadedFileIds([result.fileId])
            setUploadStatus('success')
            toast.success("Archivo ZIP subido correctamente")

        } else {
            // SEPARATE FILES MODE (or single file)
            const links: string[] = []
            const fileIds: string[] = []
            // If separate files mode with > 1 file, custom link should probably be ignored or handled 
            // (already handled in uploadFile logic to only use it if total === 1)
            
            for (let i = 0; i < files.length; i++) {
                const result = await uploadFile(files[i], i, files.length)
                links.push(result.link)
                fileIds.push(result.fileId)
            }
            setDownloadUrls(links)
            setUploadedFileIds(fileIds)
            setUploadStatus('success')
            toast.success("Archivos subidos correctamente")
        }

    } catch (err) {
        console.error(err)
        setUploadStatus('error')
        toast.error("Error al subir los archivos") 
    }
  }

  const reset = () => {
    setFiles([])
    setUploadStatus('idle')
    setProgress(0)
    setDownloadUrls([])
    setUseCustomDate(false)
    setCustomDateValue('')
    setPassword('')
    setShowPasswordInput(false)
    setCustomLink('')
    setShowCustomLink(false)
    setOneTimeDownload(null)
    setRecipientEmail('')
    setZipFiles(true)
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
                    planName={planName}
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
                    zipFiles={zipFiles}
                    setZipFiles={setZipFiles}
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
                        downloadUrls={downloadUrls}
                        uploadedFileIds={uploadedFileIds}
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
                     <p className="text-sm text-zinc-500 mb-4">Algo salió mal durante la subida.</p>
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
