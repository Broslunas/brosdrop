"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Search, 
    Trash2, 
    ExternalLink, 
    MoreHorizontal, 
    ChevronLeft, 
    ChevronRight,
    Edit2,
    FileText,
    Shield,
    Download,
    Lock,
    Unlock,
    AlertTriangle,
    Eye,
    X
} from "lucide-react"
import { formatBytes } from "@/lib/plans"
import { toast } from "sonner"
import { useModal } from "@/components/ModalProvider"
import EditFileModal from "@/components/EditFileModal"

interface Transfer {
    _id: string
    originalName: string
    size: number
    createdAt: string
    downloads: number
    senderId: {
        email: string
        name: string
    } | null
    fileKey: string
    passwordHash?: string
    customLink?: string
    expiresAt?: string
    maxDownloads?: number | null
    blocked?: boolean
    blockedMessage?: string // Optional admin message
}

export default function AdminTransfersTable() {
    const [transfers, setTransfers] = useState<Transfer[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    
    const [statusFilter, setStatusFilter] = useState('all')

    // Add state for active dropdown
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)

    const { showModal } = useModal()
    const [editingFile, setEditingFile] = useState<Transfer | null>(null)
    
    // Blocking Modal State
    const [blockingFile, setBlockingFile] = useState<{id: string, name: string, currentStatus: boolean} | null>(null)
    const [blockReason, setBlockReason] = useState("")

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null)
        window.addEventListener('click', handleClickOutside)
        return () => window.removeEventListener('click', handleClickOutside)
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        setPage(1)
        fetchTransfers()
    }, [debouncedSearch, statusFilter])

    useEffect(() => {
        if (page > 1) fetchTransfers()
    }, [page])

    const fetchTransfers = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search: debouncedSearch,
                status: statusFilter
            })
            const res = await fetch(`/api/admin/transfers?${params}`)
            const data = await res.json()
            if (data.transfers) {
                setTransfers(data.transfers)
                setTotalPages(data.pagination.pages)
            }
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar archivos")
        } finally {
            setLoading(false)
        }
    }

    const handleEditSave = async (id: string, newName: string, password?: string | null, newExpiration?: string, customLink?: string, maxDownloads?: number | null) => {
        try {
             const res = await fetch(`/api/admin/transfers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: newName, 
                    password, 
                    removePassword: password === null, 
                    expiresAt: newExpiration, 
                    customLink,
                    maxDownloads
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Error al actualizar")
            }

            toast.success("Archivo actualizado correctamente")
            fetchTransfers()
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Error al guardar cambios")
        }
    }

    const handleBlockToggle = async (id: string, currentStatus: boolean, name: string) => {
        if (currentStatus) {
            // Unblocking - direct action (no reason needed)
             await performBlockAction(id, false, name)
        } else {
            // Blocking - open modal to ask for reason
            setBlockingFile({ id, name, currentStatus })
            setBlockReason("")
        }
    }

    const performBlockAction = async (id: string, shouldBlock: boolean, name: string, reason?: string) => {
         try {
            const res = await fetch(`/api/admin/transfers/${id}/block`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    blocked: shouldBlock,
                    blockedMessage: reason 
                })
            })
             if (res.ok) {
                 toast.success(shouldBlock ? `Archivo "${name}" bloqueado` : `Archivo "${name}" desbloqueado`)
                 fetchTransfers()
                 setBlockingFile(null)
             } else {
                 toast.error("Error al cambiar estado")
             }
        } catch (e) {
            toast.error("Error de conexión")
        }
    }

    const handleConfirmBlock = () => {
        if (!blockingFile) return
        if (!blockReason.trim()) {
            toast.error("Debes indicar un motivo")
            return
        }
        performBlockAction(blockingFile.id, true, blockingFile.name, blockReason)
    }

    const handleDelete = (id: string, name: string) => {
        showModal({
            title: "¿Eliminar archivo?",
            message: `Esta acción no se puede deshacer. Se eliminará "${name}" permanentemente.`,
            type: "error",
            confirmText: "Eliminar",
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/admin/transfers/${id}`, {
                        method: "DELETE"
                    })
                    if (res.ok) {
                        toast.success("Archivo eliminado")
                        fetchTransfers()
                    } else {
                        toast.error("Error al eliminar")
                    }
                } catch (e) {
                    toast.error("Error de conexión")
                }
            }
        })
    }
    
    const handleMenuClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        setOpenMenuId(openMenuId === id ? null : id)
    }

    useEffect(() => {
        fetchTransfers()
    }, [page, debouncedSearch])

    return (
        <div className="space-y-4">
             <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="flex-1 w-full max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input 
                        type="text"
                        placeholder="Buscar archivos por nombre o propietario..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">Todos los Archivos</option>
                        <option value="active">Activos</option>
                        <option value="blocked">Bloqueados</option>
                    </select>
                </div>
                {loading && <div className="text-sm text-zinc-500 animate-pulse">Cargando...</div>}
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900/30">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-zinc-400">
                            <th className="p-4 font-medium">Archivo</th>
                            <th className="p-4 font-medium hidden md:table-cell">Usuario</th>
                            <th className="p-4 font-medium">Estado</th>
                            <th className="p-4 font-medium text-center">Descargas</th>
                            <th className="p-4 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transfers.length === 0 && !loading ? (
                             <tr>
                                 <td colSpan={5} className="p-8 text-center text-zinc-500">
                                     No se encontraron archivos.
                                 </td>
                             </tr>
                        ) : (
                            transfers.map((t) => (
                                <tr key={t._id} className={`group transition-colors ${t.blocked ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-white/5'}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-zinc-400 ${t.blocked ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800'}`}>
                                                {t.blocked ? <AlertTriangle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="font-medium text-white truncate max-w-[200px]" title={t.originalName}>
                                                    {t.originalName}
                                                </div>
                                                <div className="text-xs text-zinc-500">
                                                    {new Date(t.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        {t.senderId && typeof t.senderId === 'object' ? (
                                            <div>
                                                <div className="text-white">{t.senderId.name || t.senderId.email || 'Sin Nombre'}</div>
                                                <div className="text-xs text-zinc-500">{t.senderId.email}</div>
                                            </div>
                                        ) : (
                                            <span className="text-zinc-500 italic">Anónimo / Guest</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-zinc-300">{formatBytes(t.size)}</div>
                                            {t.blocked && <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Bloqueado</div>}
                                            {t.passwordHash && !t.blocked && (
                                                 <div className="flex items-center gap-1 text-[10px] text-green-400">
                                                     <Shield className="w-3 h-3" /> Protegido
                                                 </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 text-xs">
                                            <Download className="w-3 h-3" />
                                            {t.downloads}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="relative inline-block text-left">
                                            {/* Quick Actions */}
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => setEditingFile(t)}
                                                    className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                
                                                <button
                                                    onClick={(e) => handleMenuClick(e, t._id)}
                                                    className={`p-2 rounded-lg transition-colors ${openMenuId === t._id ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-400'}`}
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Dropdown Menu */}
                                            <AnimatePresence>
                                                {openMenuId === t._id && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-zinc-900 border border-white/10 shadow-xl z-[100] overflow-hidden bg-opacity-95 backdrop-blur-sm"
                                                    >
                                                        <div className="p-1 space-y-0.5">
                                                            <a 
                                                                href={`/d/${t._id}`} 
                                                                target="_blank" 
                                                                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg"
                                                            >
                                                                <Eye className="w-4 h-4" /> Ver Archivo
                                                            </a>
                                                            <button 
                                                                onClick={() => handleBlockToggle(t._id, !!t.blocked, t.originalName)}
                                                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${t.blocked ? 'text-green-400 hover:bg-green-500/10' : 'text-orange-400 hover:bg-orange-500/10'}`}
                                                            >
                                                                {t.blocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                                {t.blocked ? "Desbloquear" : "Bloquear Acceso"}
                                                            </button>
                                                            <div className="h-px bg-white/5 my-1" />
                                                            <button 
                                                                onClick={() => handleDelete(t._id, t.originalName)}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Eliminar Definitivamente
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-zinc-400">
                        Página {page} de {totalPages}
                    </span>
                    <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Reuse EditFileModal but make sure it works for admin */}
            {/* Blocking Reason Modal */}
            <AnimatePresence>
                {blockingFile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setBlockingFile(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md bg-zinc-900 border border-red-500/20 rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-red-500" />
                                    Bloquear Archivo
                                </h2>
                                <button onClick={() => setBlockingFile(null)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <p className="text-zinc-300">
                                    Estás a punto de bloquear el archivo <span className="font-semibold text-white">"{blockingFile.name}"</span>.
                                    <br/>
                                    <span className="text-sm text-zinc-500">Este motivo será enviado por webhook.</span>
                                </p>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white">Motivo del bloqueo <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={blockReason}
                                        onChange={(e) => setBlockReason(e.target.value)}
                                        placeholder="Escribe la razón del bloqueo..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none h-24"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => setBlockingFile(null)}
                                        className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmBlock}
                                        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
                                    >
                                        Confirmar Bloqueo
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {editingFile && (
                <EditFileModal 
                    isOpen={!!editingFile}
                    onClose={() => setEditingFile(null)}
                    file={editingFile}
                    onSave={handleEditSave}
                />
            )}
        </div>
    )
}
