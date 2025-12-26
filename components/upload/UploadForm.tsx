"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Plus, X, Trash2, Clock, Calendar, Lock, Link as LinkIcon, Flame, Mail, Archive, Layers } from "lucide-react"
import { File as FileIcon, Music, Video, Image as ImageIcon, FileText, FileCode } from "lucide-react"

// Helpercitos
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


interface UploadFormProps {
    files: File[]
    isVerified: boolean
    planName?: string
    maxDays: number
    expirationHours: number
    setExpirationHours: (h: number) => void
    useCustomDate: boolean
    setUseCustomDate: (b: boolean) => void
    customDateValue: string
    setCustomDateValue: (s: string) => void
    password: string
    setPassword: (s: string) => void
    setShowPasswordInput: (b: boolean) => void // Dejar por compatibilidad, aunque puede ser inferido
    customLink: string
    setCustomLink: (s: string) => void
    setShowCustomLink: (b: boolean) => void
    oneTimeDownload: number | null
    setOneTimeDownload: (n: number | null) => void
    recipientEmail: string
    setRecipientEmail: (s: string) => void
    showEmailInput: boolean
    setShowEmailInput: (b: boolean) => void
    
    // Actions
    onAddFiles: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemoveFile: (index: number) => void
    onCancelAll: () => void
    onUpload: () => void
    
    // Zip state
    zipFiles: boolean
    setZipFiles: (zip: boolean) => void

    // Refs
    fileInputRef: React.RefObject<HTMLInputElement | null>
    totalSize: number
}

export default function UploadForm({
    files,
    isVerified,
    planName = 'free',
    maxDays,
    expirationHours,
    setExpirationHours,
    useCustomDate,
    setUseCustomDate,
    customDateValue,
    setCustomDateValue,
    password,
    setPassword,
    setShowPasswordInput,
    customLink,
    setCustomLink,
    setShowCustomLink,
    oneTimeDownload,
    setOneTimeDownload,
    recipientEmail,
    setRecipientEmail,
    showEmailInput,
    setShowEmailInput,
    onAddFiles,
    onRemoveFile,
    onCancelAll,
    onUpload,
    zipFiles,
    setZipFiles,
    fileInputRef,
    totalSize
}: UploadFormProps) {

  const generateExpirationOptions = () => {
      const options = [{ label: '1 h', value: 1 }]
      if (maxDays >= 1) options.push({ label: '1 d', value: 24 })
      if (maxDays >= 3) options.push({ label: '3 d', value: 72 })
      if (maxDays >= 7) options.push({ label: '7 d', value: 168 })
      if (maxDays >= 30) options.push({ label: '30 d', value: 720 })
      if (maxDays >= 365) options.push({ label: '1 a', value: 8760 })
      return options
  }

  const isProOrPlus = ['pro', 'plus'].includes(planName.toLowerCase())

  return (
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
                    <div className="flex gap-2">
                            <button
                            onClick={() => fileInputRef.current?.click()} 
                            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            title="Agregar más archivos"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                            <button 
                            onClick={(e) => { e.stopPropagation(); onCancelAll(); }}
                            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
                            title="Cancelar todo"
                            >
                            <X className="h-5 w-5" />
                            </button>
                    </div>
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
                            <button 
                                onClick={() => onRemoveFile(i)}
                                className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                    </div>
                ))}
            </div>
                {/* Hidden input for adding more files */}
                <input 
                type="file" 
                multiple
                ref={fileInputRef} 
                className="hidden" 
                onChange={onAddFiles} 
                />
        </div>
        
        {/* Main Settings Form */}
        {isVerified && (
            <div className="space-y-6">
                 {/* Multi-file toggle for Pro/Plus */}
                 {files.length > 1 && isProOrPlus && (
                     <div className="p-1 rounded-xl bg-zinc-800 border border-zinc-700 flex">
                         <button
                            onClick={() => setZipFiles(true)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${zipFiles ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
                         >
                             <Archive className="w-4 h-4" />
                             Comprimir ZIP
                         </button>
                         <button
                            onClick={() => setZipFiles(false)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${!zipFiles ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
                         >
                             <Layers className="w-4 h-4" />
                             Por Separado
                         </button>
                     </div>
                 )}

            {/* Expiration */}
                <div className="">
                <label className="flex items-center justify-between text-sm font-medium text-zinc-400 mb-2">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Caducidad del enlace
                    </div>
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
                            max={new Date(Date.now() + maxDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button 
                            onClick={() => { setUseCustomDate(false); setCustomDateValue('') }}
                            className="absolute right-3 top-3 text-xs text-zinc-500 hover:text-zinc-300"
                        >
                            Cancelar
                        </button>
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
        
        <button
            onClick={onUpload}
            className="w-full mt-6 py-4 rounded-xl bg-primary font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
            {files.length > 1 && zipFiles 
                ? 'Comprimir y Transferir' 
                : files.length > 1 
                    ? `Transferir ${files.length} Archivos`
                    : 'Transferir Archivo'
            }
        </button>
    </motion.div>
  )
}
