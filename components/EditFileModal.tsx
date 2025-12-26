
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Save, Lock, Edit2, Trash2, Clock } from "lucide-react"

interface EditFileModalProps {
  isOpen: boolean
  onClose: () => void
  file: any
  onSave: (id: string, newName: string, password?: string | null, newExpiration?: string) => Promise<void>
}

export default function EditFileModal({ isOpen, onClose, file, onSave }: EditFileModalProps) {
  const [name, setName] = useState(file?.originalName || "")
  const [password, setPassword] = useState("")
  const [hasPassword, setHasPassword] = useState(false) // Whether file currently has one or user wants to add one
  const [newExpiration, setNewExpiration] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Reset state when file changes or modal opens
  useEffect(() => {
      if (file) {
          setName(file.originalName)
          const isProtected = !!file.passwordHash || !!file.password
          setHasPassword(isProtected)
          setPassword("")
          // Format ISO to input datetime-local: YYYY-MM-DDThh:mm
          if (file.expiresAt) {
              setNewExpiration(new Date(file.expiresAt).toISOString().slice(0, 16))
          } else {
              setNewExpiration("")
          }
      }
  }, [file, isOpen])

  const handleSave = async () => {
      setIsSaving(true)
      try {
          // If hasPassword is false, we might want to remove it.
          // We pass null for password if removing? Or a flag?
          // The component API expects password string or null.
          let pwd = undefined
          if (hasPassword && password) pwd = password
          if (!hasPassword) pwd = null // Indicate removal
          
          await onSave(file._id, name, pwd, newExpiration)
          onClose()
      } catch (e) {
          console.error(e)
      } finally {
          setIsSaving(false)
      }
  }

  // If we toggle Has Password ON, user must type a password?
  // If we toggle OFF, we will remove it.

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-primary" /> Editar Archivo
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">Modifica los detalles de tu archivo.</p>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-zinc-500" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Name Input */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Nombre del Archivo</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>

                {/* Expiration Date Section */}
                <div className="p-4 rounded-xl border bg-zinc-800/50 border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                         <div className="flex items-center gap-2">
                             <Clock className="w-4 h-4 text-zinc-400" />
                             <span className="text-sm font-medium text-zinc-300">Fecha de Expiración</span>
                         </div>
                    </div>
                    
                    <p className="text-xs text-zinc-500 mb-4 ml-6">
                        Puedes reducir el tiempo de vida del archivo si lo deseas.
                    </p>

                    <div className="ml-6">
                         <input 
                             type="datetime-local"
                             value={newExpiration}
                             max={file?.expiresAt ? new Date(file.expiresAt).toISOString().slice(0, 16) : undefined}
                             onChange={(e) => setNewExpiration(e.target.value)}
                             className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none mb-1 text-zinc-400 [&::-webkit-calendar-picker-indicator]:invert"
                         />
                         {file?.expiresAt && (
                             <p className="text-xs text-zinc-500 mt-2">
                                 Máximo permitido: {new Date(file.expiresAt).toLocaleString()}
                             </p>
                         )}
                    </div>
                </div>

                {/* Password Section */}
                <div className={`p-4 rounded-xl border transition-colors ${hasPassword ? 'bg-primary/5 border-primary/20' : 'bg-zinc-800/50 border-zinc-800'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Lock className={`w-4 h-4 ${hasPassword ? 'text-primary' : 'text-zinc-400'}`} />
                            <span className="text-sm font-medium text-zinc-300">Protección con Contraseña</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={hasPassword}
                                onChange={(e) => setHasPassword(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>
                    
                    <p className="text-xs text-zinc-500 mb-4 ml-6">
                        {hasPassword 
                            ? "El archivo estará protegido. Desactiva para hacerlo público." 
                            : "El archivo es público. Activa para restringir el acceso."}
                    </p>

                    <AnimatePresence>
                    {hasPassword && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ml-6"
                        >
                            <input 
                                type="password" 
                                placeholder={(file?.passwordHash || file?.password) ? "Nueva contraseña (opcional)..." : "Establece una contraseña..."}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none mb-1 placeholder:text-zinc-600"
                            />
                            {(file?.passwordHash || file?.password) && !password && (
                                <p className="text-xs text-orange-400/80 mt-2 flex items-center gap-1.5">
                                    <Lock className="w-3 h-3" /> Contraseña actual activa. Déjalo vacío para mantenerla.
                                </p>
                            )}
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-8">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
