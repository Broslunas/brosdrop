"use client"

import { useState, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, File as FileIcon, CheckCircle, AlertCircle, Clock, Calendar, Lock, Music, Video, Image as ImageIcon, FileText, Archive, FileCode, Link as LinkIcon, Mail, Flame, QrCode, Trash2, Plus } from "lucide-react"
import QRCode from "react-qr-code"
import JSZip from "jszip"

import { useSession } from "next-auth/react"
import { useModal } from "@/components/ModalProvider"

interface DropZoneProps {
    maxBytes?: number
    maxSizeLabel?: string
    planName?: string
    maxDays?: number
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return FileIcon

  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext)) return Music
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'].includes(ext)) return Video
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return ImageIcon
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return Archive
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'html', 'css', 'json', 'xml', 'java', 'cpp', 'c', 'php', 'rb', 'go'].includes(ext)) return FileCode
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt'].includes(ext)) return FileText
  
  return FileIcon
}

const getFileIconColor = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return 'bg-primary/10 text-primary'

  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext)) return 'bg-green-500/10 text-green-400'
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'].includes(ext)) return 'bg-purple-500/10 text-purple-400'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'bg-pink-500/10 text-pink-400'
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return 'bg-orange-500/10 text-orange-400'
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'html', 'css', 'json', 'xml', 'java', 'cpp', 'c', 'php', 'rb', 'go'].includes(ext)) return 'bg-cyan-500/10 text-cyan-400'
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt'].includes(ext)) return 'bg-red-500/10 text-red-400'
  
  return 'bg-primary/10 text-primary'
}

export default function DropZone({ maxBytes, maxSizeLabel, planName, maxDays }: DropZoneProps) {
  const { data: session } = useSession()
  const { showModal } = useModal()
  const [files, setFiles] = useState<File[]>([])
  
  // Check if verified (use as any because of type definitions)
  const isVerified = (session?.user as any)?.emailVerified

  // Limits: Use props if available, else default
  const MAX_SIZE = maxBytes || (isVerified ? 200 * 1024 * 1024 : 10 * 1024 * 1024)
  const MAX_SIZE_LABEL = maxSizeLabel || (isVerified ? "200MB" : "10MB")
  // Default to 7 days if verified, 30 mins if not, unless maxDays provided
  const MAX_DAYS = maxDays !== undefined ? maxDays : (isVerified ? 7 : 0.02)

  // Default expiration to MAX_DAYS (in hours) or 7 days, maxed at MAX_DAYS
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
  
  const generateExpirationOptions = () => {
      const options = [{ label: '1 h', value: 1 }]
      if (MAX_DAYS >= 1) options.push({ label: '1 d', value: 24 })
      if (MAX_DAYS >= 3) options.push({ label: '3 d', value: 72 })
      if (MAX_DAYS >= 7) options.push({ label: '7 d', value: 168 })
      if (MAX_DAYS >= 30) options.push({ label: '30 d', value: 720 })
      if (MAX_DAYS >= 365) options.push({ label: '1 a', value: 8760 })
      return options
  }

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
    // Reset inputs so same file can be selected again if needed
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
                
                // Feature: Send Email
                if (recipientEmail) {
                    const recipients = recipientEmail.split(',').map(e => e.trim()).filter(e => e)
                    if (recipients.length > 0) {
                        fetch('https://n8n.broslunas.com/webhook/brosdrop-send-via-email', {
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
            className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-xl"
          >
             <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                     <h4 className="text-zinc-400 text-sm font-medium">
                        {files.length} archivo{files.length !== 1 && 's'} seleccionado{files.length !== 1 && 's'} ({(totalSize / 1024 / 1024).toFixed(2)} MB)
                     </h4>
                     {uploadStatus === 'idle' && (
                        <div className="flex gap-2">
                             <button
                                onClick={() => fileInputRef.current?.click()} 
                                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                title="Agregar más archivos"
                             >
                                 <Plus className="w-5 h-5" />
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); reset(); }}
                                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
                                title="Cancelar todo"
                             >
                                <X className="h-5 w-5" />
                             </button>
                        </div>
                     )}
                </div>

                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-white/5">
                             <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`rounded-lg p-2 ${getFileIconColor(file.name)}`}>
                                    {(() => {
                                        const Icon = getFileIcon(file.name)
                                        return <Icon className="h-4 w-4" />
                                    })()}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                     <span className="truncate text-sm font-medium text-zinc-200">{file.name}</span>
                                     <span className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                             </div>
                             {uploadStatus === 'idle' && (
                                <button 
                                    onClick={() => removeFile(i)}
                                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             )}
                        </div>
                    ))}
                </div>
                 {/* Hidden input for adding more files */}
                 <input 
                    type="file" 
                    multiple
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect} 
                 />
             </div>
             
             {/* Main Settings Form */}
             {isVerified && uploadStatus === 'idle' && (
                 <div className="space-y-6">
                    {/* Expiration */}
                     <div className="">
                        <label className="flex items-center justify-between text-sm font-medium text-zinc-400 mb-2">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Caducidad del enlace
                            </div>
                            {useCustomDate && (
                                 <button 
                                    onClick={() => { setUseCustomDate(false); setCustomDateValue('') }}
                                    className="text-xs text-primary hover:text-primary/80"
                                 >
                                    Volver a predefinidos
                                 </button>
                            )}
                        </label>
                        
                        {!useCustomDate ? (
                            <div className="grid grid-cols-5 gap-2">
                                {generateExpirationOptions().map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setExpirationHours(option.value)}
                                        className={`
                                            py-2 px-1 rounded-lg text-xs font-medium transition-all
                                            ${expirationHours === option.value 
                                                ? 'bg-white text-zinc-900 shadow-lg' 
                                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                            }
                                        `}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setUseCustomDate(true)}
                                    className="py-2 px-1 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-all flex items-center justify-center"
                                    title="Personalizar Fecha"
                                >
                                    <Calendar className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input 
                                    type="datetime-local" 
                                    value={customDateValue}
                                    onChange={(e) => setCustomDateValue(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                    max={new Date(Date.now() + MAX_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                                    className="w-full rounded-xl bg-zinc-800 border border-zinc-700 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        )}
                     </div>

                    {/* Advanced Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Password */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
                                <Lock className="w-4 h-4" />
                                Contraseña
                            </label>
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => { 
                                    setPassword(e.target.value)
                                    setShowPasswordInput(!!e.target.value) 
                                }}
                                placeholder="Opcional"
                                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>

                         {/* Custom Link */}
                         <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
                                <LinkIcon className="w-4 h-4" />
                                Link Personalizado
                            </label>
                            <div className="flex items-center rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden focus-within:ring-2 focus-within:ring-primary/50">
                                <span className="pl-3 pr-1 text-zinc-500 text-sm bg-zinc-800 select-none">/d/</span>
                                 <input 
                                    type="text"
                                    value={customLink}
                                    onChange={(e) => { 
                                        setCustomLink(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                                        setShowCustomLink(!!e.target.value) 
                                    }}
                                    placeholder="ej. fotos"
                                    className="w-full bg-zinc-800 border-none p-3 pl-1 text-sm text-white placeholder-zinc-600 outline-none"
                                />
                            </div>
                         </div>
                    </div>

                    {/* New Features: Max Downloads & Email */}
                    <div className="p-4 rounded-xl bg-zinc-800/40 border border-white/5 space-y-4">
                         {/* Max Downloads (Feature 5 update) */}
                         <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2 text-sm text-zinc-300">
                                 <Flame className={`w-4 h-4 ${oneTimeDownload ? 'text-orange-500' : 'text-zinc-500'}`} />
                                 <span>Límite de Descargas</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <input
                                     type="number"
                                     min="0"
                                     placeholder="∞"
                                     className="w-16 bg-zinc-900 border border-zinc-700 rounded-lg p-1 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                                     onChange={(e) => {
                                         const val = parseInt(e.target.value)
                                         setOneTimeDownload(val > 0 ? val : null)
                                     }}
                                 />
                             </div>
                         </div>
                         
                         {/* Email Send (Feature 2) */}
                         <div>
                             <div 
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => setShowEmailInput(!showEmailInput)}
                             >
                                 <div className="flex items-center gap-2 text-sm text-zinc-300">
                                     <Mail className={`w-4 h-4 ${recipientEmail ? 'text-blue-500' : 'text-zinc-500'}`} />
                                     <span>Enviar por Email</span>
                                 </div>
                                 <span className="text-lg text-zinc-500 leading-none">{showEmailInput ? '-' : '+'}</span>
                             </div>
                             {showEmailInput && (
                                 <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="mt-3 overflow-hidden"
                                 >
                                     <input 
                                        type="text"
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        placeholder="ej. correo1@ejemplo.com, correo2@ejemplo.com"
                                        className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                     />
                                 </motion.div>
                             )}
                         </div>
                    </div>
                 </div>
             )}
             
             {uploadStatus === 'idle' && (
                 <button
                    onClick={handleUpload}
                    className="w-full mt-6 py-4 rounded-xl bg-primary font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                    {files.length > 1 ? 'Tu archivo Zip y Transferir' : 'Transferir Archivo'}
                 </button>
             )}

             {(uploadStatus === 'uploading' || uploadStatus === 'zipping') && (
                 <div className="space-y-2 mt-6">
                    <div className="flex justify-between text-xs text-zinc-400">
                        <span>{uploadStatus === 'zipping' ? 'Comprimiendo archivos...' : 'Subiendo...'}</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                        <motion.div 
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "linear" }}
                        />
                    </div>
                 </div>
             )}
             
             {uploadStatus === 'success' && (
                 <div className="text-center py-4">
                     <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500"
                     >
                         <CheckCircle className="h-6 w-6" />
                     </motion.div>
                     <h4 className="text-lg font-bold text-green-500">¡Enviado!</h4>
                     <p className="text-sm text-zinc-500 mb-4">Tu archivo está listo para compartir.</p>
                     
                     {/* Feature 1: QR Code Modal/Display */}
                     {showQR && (
                         <div className="mb-4 flex flex-col items-center p-4 bg-white rounded-xl">
                             <QRCode value={downloadUrl} size={128} />
                             <p className="text-xs text-black mt-2 font-medium">Escanéame</p>
                         </div>
                     )}

                     <div className="flex flex-col gap-2">
                         <div className="flex gap-2">
                             <button onClick={reset} className="flex-1 rounded-xl bg-zinc-800 py-3 text-sm font-medium hover:bg-zinc-700 transition-colors">
                                 Enviar otro
                             </button>
                             <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(downloadUrl)
                                    showModal({
                                        title: "Enlace Copiado",
                                        message: "El enlace de descarga ha sido copiado al portapapeles.",
                                        type: "success"
                                    })
                                }}
                                className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                            >
                                 Copiar Link
                             </button>
                         </div>
                         <button 
                            onClick={() => setShowQR(!showQR)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-800/50 border border-zinc-700 py-2 text-sm font-medium hover:bg-zinc-800 transition-colors"
                         >
                             <QrCode className="w-4 h-4" />
                             {showQR ? "Ocultar QR" : "Mostrar QR Móvil"}
                         </button>
                     </div>
                 </div>
             )}
             
             {uploadStatus === 'error' && (
                  <div className="text-center py-4">
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
