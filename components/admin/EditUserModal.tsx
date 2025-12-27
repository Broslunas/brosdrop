"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, Crown, Shield, User, Save, User as UserIcon } from "lucide-react"
import { toast } from "sonner"

interface EditUserModalProps {
    isOpen: boolean
    onClose: () => void
    user: any
    onUpdate: (id: string, data: any) => Promise<void>
}

export default function EditUserModal({ isOpen, onClose, user, onUpdate }: EditUserModalProps) {
    const [role, setRole] = useState(user?.role || 'user')
    const [plan, setPlan] = useState(user?.plan || 'free')
    const [expiresAt, setExpiresAt] = useState(user?.planExpiresAt ? new Date(user.planExpiresAt).toISOString().split('T')[0] : '')
    const [blocked, setBlocked] = useState(user?.blocked || false)
    const [blockedMessage, setBlockedMessage] = useState(user?.blockedMessage || '')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setRole(user.role)
            setPlan(user.plan)
            setExpiresAt(user.planExpiresAt ? new Date(user.planExpiresAt).toISOString().split('T')[0] : '')
            setBlocked(user.blocked || false)
            setBlockedMessage(user.blockedMessage || '')
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (blocked && !blockedMessage.trim()) {
            toast.error("Debes indicar un motivo para bloquear al usuario")
            return
        }

        setLoading(true)
        try {
            await onUpdate(user._id, {
                role,
                plan,
                planExpiresAt: expiresAt || null,
                blocked,
                blockedMessage
            })
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold text-white">Editar Usuario</h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar">

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* User Info Readonly */}
                            <div className="flex items-center gap-4 bg-zinc-800/50 p-4 rounded-xl border border-white/5">
                                <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                     {user.image ? (
                                         <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                     ) : (
                                         <UserIcon className="w-6 h-6 text-zinc-500" />
                                     )}
                                </div>
                                <div>
                                    <div className="font-medium text-white">{user.name}</div>
                                    <div className="text-sm text-zinc-500">{user.email}</div>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-zinc-400">Rol del Usuario</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('user')}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${role === 'user' ? 'bg-zinc-800 border-white/20 text-white' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800/50'}`}
                                    >
                                        <User className="w-4 h-4" /> User
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('admin')}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${role === 'admin' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800/50'}`}
                                    >
                                        <Shield className="w-4 h-4" /> Admin
                                    </button>
                                </div>
                            </div>

                            {/* Plan Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-zinc-400">Plan</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['free', 'plus', 'pro'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPlan(p)}
                                            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border capitalize transition-all ${plan === p ? 'bg-zinc-800 border-white/30 text-white' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800/50'}`}
                                        >
                                            {p === 'pro' && <Crown className="w-4 h-4 text-purple-400 mb-1" />}
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Expiration Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Vencimiento del Plan</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input 
                                        type="date" 
                                        value={expiresAt}
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <p className="text-xs text-zinc-500">Deja vacío para que no caduque nunca.</p>
                            </div>

                            {/* Block User Section */}
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <label className="text-sm font-medium text-red-400 flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Zona de Peligro / Bloqueo
                                </label>
                                <div className="space-y-3 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-zinc-300">Bloquear acceso al usuario</span>
                                        <button
                                            type="button"
                                            onClick={() => setBlocked(!blocked)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${blocked ? 'bg-red-500' : 'bg-zinc-700'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${blocked ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    
                                    {blocked && (
                                        <div className="space-y-2">
                                            <label className="text-xs text-zinc-500">Mensaje de bloqueo (visible para el usuario)</label>
                                            <textarea 
                                                value={blockedMessage}
                                                onChange={(e) => setBlockedMessage(e.target.value)}
                                                placeholder="Tu cuenta ha sido bloqueada por..."
                                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none h-24"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Guardando...' : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
