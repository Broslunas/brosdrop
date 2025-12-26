
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Save, Lock, Edit2, Clock, Globe } from "lucide-react"

import { useSession } from "next-auth/react"

interface EditFileModalProps {
  isOpen: boolean
  onClose: () => void
  file: any
  onSave: (id: string, newName: string, password?: string | null, newExpiration?: string, customLink?: string, maxDownloads?: number | null) => Promise<void>
}

export default function EditFileModal({ isOpen, onClose, file, onSave }: EditFileModalProps) {
  const { data: session } = useSession()
  // Cast user to any to access plan
  const userPlan = (session?.user as any)?.plan || 'free'
  const isPro = userPlan === 'pro' || userPlan === 'admin' // Simple check, ideally use PLAN_LIMITS

  const [name, setName] = useState(file?.originalName || "")
  const [password, setPassword] = useState("")
  const [hasPassword, setHasPassword] = useState(false)
  const [newExpiration, setNewExpiration] = useState("")
  const [customLink, setCustomLink] = useState("")
  const [maxDownloads, setMaxDownloads] = useState<number | null>(null)
  
  const [isSaving, setIsSaving] = useState(false)

  // Reset state when file changes or modal opens
  useEffect(() => {
      if (file) {
          setName(file.originalName)
          const isProtected = !!file.passwordHash || !!file.password
          setHasPassword(isProtected)
          setPassword("")
          if (file.expiresAt) {
              setNewExpiration(new Date(file.expiresAt).toISOString().slice(0, 16))
          } else {
              setNewExpiration("")
          }
          setCustomLink(file.customLink || "")
          setMaxDownloads(file.maxDownloads || null)
      }
  }, [file, isOpen])

  const handleSave = async () => {
      setIsSaving(true)
      try {
          let pwd = undefined
          if (hasPassword && password) pwd = password
          if (!hasPassword) pwd = null 
          
          await onSave(file._id, name, pwd, newExpiration, customLink, maxDownloads)
          onClose()
      } catch (e) {
          console.error(e)
      } finally {
          setIsSaving(false)
      }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#0A0A0A] z-10 rounded-t-3xl">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                        <Edit2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Editar Archivo</h3>
                        <p className="text-xs text-zinc-400">Personaliza tu contenido</p>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                
                {/* Name Input */}
                <div className="group">
                    <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">Nombre del Archivo</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all placeholder:text-zinc-700"
                        placeholder="ej. mi-documento-final.pdf"
                    />
                </div>

                {/* Settings Grid */}
                <div className="grid gap-4">
                    
                    {/* Expiration */}
                    <div className="p-4 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 bg-blue-500/10 rounded-lg">
                                <Clock className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-zinc-200 mb-1">Caducidad</label>
                                <p className="text-xs text-zinc-500 mb-3">Define cuándo se eliminará este archivo.</p>
                                <input 
                                    type="datetime-local"
                                    value={newExpiration}
                                    max={file?.expiresAt ? new Date(file.expiresAt).toISOString().slice(0, 16) : undefined}
                                    onChange={(e) => setNewExpiration(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-blue-500/50 outline-none text-zinc-300 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
                                />
                                {file?.expiresAt && (
                                     <p className="text-[10px] text-zinc-600 mt-2">
                                         Límite original: {new Date(file.expiresAt).toLocaleString()}
                                     </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Custom Link */}
                    <div className="p-4 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 bg-purple-500/10 rounded-lg">
                                <Globe className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-zinc-200 mb-1">Alias Personalizado</label>
                                <p className="text-xs text-zinc-500 mb-3">Enlace corto y amigable.</p>
                                <div className="flex items-center rounded-lg bg-black/40 border border-white/10 overflow-hidden focus-within:ring-1 focus-within:ring-purple-500/50">
                                    <span className="pl-3 pr-1.5 text-zinc-600 text-xs select-none font-mono">/d/</span>
                                    <input 
                                        type="text" 
                                        placeholder="mi-enlace"
                                        value={customLink}
                                        onChange={(e) => setCustomLink(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        className="w-full bg-transparent border-none py-2 pr-3 text-white text-sm outline-none placeholder:text-zinc-700 font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className={`p-4 rounded-2xl border transition-all duration-300 ${hasPassword ? 'bg-primary/5 border-primary/20' : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/50'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${hasPassword ? 'bg-primary/20' : 'bg-orange-500/10'}`}>
                                    <Lock className={`w-4 h-4 ${hasPassword ? 'text-primary' : 'text-orange-400'}`} />
                                </div>
                                <div>
                                    <span className="block text-sm font-medium text-zinc-200">Contraseña</span>
                                    <span className="block text-xs text-zinc-500">{hasPassword ? 'Acceso Privado' : 'Acceso Público'}</span>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={hasPassword}
                                    onChange={(e) => setHasPassword(e.target.checked)}
                                />
                                <div className="w-10 h-6 bg-zinc-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner"></div>
                            </label>
                        </div>

                        <AnimatePresence>
                        {hasPassword && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <input 
                                    type="password" 
                                    placeholder={(file?.passwordHash || file?.password) ? "Cambiar contraseña (opcional)..." : "Establece una contraseña..."}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-primary/50 outline-none placeholder:text-zinc-600"
                                />
                                {(file?.passwordHash || file?.password) && !password && (
                                    <p className="text-[10px] text-zinc-500 mt-2 ml-1">
                                        * No escribas nada si quieres mantener la actual.
                                    </p>
                                )}
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>

                    {/* Max Downloads */}
                    <div className="p-4 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 bg-orange-500/10 rounded-lg">
                                <Clock className="w-4 h-4 text-orange-400" /> 
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-zinc-200 mb-1">Límite de Descargas</label>
                                <p className="text-xs text-zinc-500 mb-3">0 o vacío para ilimitado.</p>
                                <input 
                                    type="number" 
                                    min="0"
                                    placeholder="Ilimitado"
                                    value={maxDownloads || ''}
                                    onChange={(e) => setMaxDownloads(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-orange-500/50 outline-none placeholder:text-zinc-700"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-4 sm:p-6 border-t border-white/5 bg-[#0A0A0A] rounded-b-3xl">
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
                    >
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

