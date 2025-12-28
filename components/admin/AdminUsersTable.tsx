"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Search, 
    MoreHorizontal, 
    ChevronLeft, 
    ChevronRight,
    Edit2,
    Shield,
    HardDrive,
    User as UserIcon,
    Crown,
    Lock
} from "lucide-react"
import { formatBytes } from "@/lib/plans"
import { toast } from "sonner"
import { useModal } from "@/components/ModalProvider"

interface User {
    _id: string
    name: string
    email: string
    image?: string
    role: 'user' | 'admin'
    plan: 'free' | 'plus' | 'pro'
    createdAt: string
    filesCount: number
    storageUsed: number
    planExpiresAt?: string
    blocked?: boolean
    blockedMessage?: string
}

import EditUserModal from "@/components/admin/EditUserModal"

// ... existing imports

export default function AdminUsersTable() {
    const [users, setUsers] = useState<User[]>([])
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState("")
    
    const [debouncedSearch, setDebouncedSearch] = useState("")
    
    const [roleFilter, setRoleFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')

    const { showModal } = useModal()

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search: debouncedSearch,
                role: roleFilter,
                status: statusFilter
            })
            const res = await fetch(`/api/admin/users?${params}`)
            const data = await res.json()
            if (data.users) {
                setUsers(data.users)
                setTotalPages(data.pagination.pages)
            }
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar usuarios")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setPage(1) // Reset to page 1 on filter change
        fetchUsers()
    }, [debouncedSearch, roleFilter, statusFilter])

    useEffect(() => {
        if (page > 1) fetchUsers()
    }, [page])

    const handleUpdateUser = async (id: string, updates: Partial<User>) => {
        try {
             const res = await fetch(`/api/admin/users/${id}`, {
                 method: 'PUT',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(updates)
             })
             
             if (!res.ok) throw new Error("Update failed")
             
             toast.success("Usuario actualizado")
             fetchUsers()
        } catch (e) {
            toast.error("Error al actualizar usuario")
        }
    }

    // const handleMenuClick removed
    
    const PlanBadge = ({ plan }: { plan: string }) => {
        switch(plan) {
            case 'pro': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium border border-purple-500/20"><Crown className="w-3 h-3" /> Pro</span>
            case 'plus': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-500/20">Plus</span>
            default: return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border">Free</span>
        }
    }

    return (
        <div className="space-y-4">
             <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-border">
                <div className="flex-1 w-full max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                        type="text"
                        placeholder="Buscar usuarios..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-card border border-input rounded-xl pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-card border border-input rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                        <option value="all">Todos los Roles</option>
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                    </select>

                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-card border border-input rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                        <option value="all">Todos los Estados</option>
                        <option value="active">Activo</option>
                        <option value="blocked">Bloqueado</option>
                    </select>
                </div>
                {loading && <div className="text-sm text-muted-foreground animate-pulse">Cargando...</div>}
            </div>

            <div className="rounded-2xl border border-border bg-card/30 overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border text-muted-foreground">
                            <th className="p-4 font-medium">Usuario</th>
                            <th className="p-4 font-medium hidden md:table-cell">Rol</th>
                            <th className="p-4 font-medium">Plan</th>
                            <th className="p-4 font-medium hidden md:table-cell">Almacenamiento</th>
                            <th className="p-4 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                             <tr key={user._id} className="group hover:bg-white/5 transition-colors">
                                 <td className="p-4">
                                     <div className="flex items-center gap-3">
                                         <div className={`relative h-10 w-10 rounded-full flex items-center justify-center overflow-hidden ${user.blocked ? 'ring-2 ring-red-500' : 'bg-zinc-800'}`}>
                                             {user.image ? (
                                                 <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                             ) : (
                                                 <UserIcon className="w-5 h-5 text-zinc-500" />
                                             )}
                                             {user.blocked && (
                                                <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] flex items-center justify-center">
                                                    <Lock className="w-4 h-4 text-white drop-shadow-md" />
                                                </div>
                                             )}
                                         </div>
                                         <div>
                                             <div className="font-medium text-white flex items-center gap-2">
                                                {user.name}
                                                {user.blocked && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white uppercase tracking-wider">
                                                        Bloqueado
                                                    </span>
                                                )}
                                             </div>
                                             <div className="text-xs text-zinc-500">{user.email}</div>
                                         </div>
                                     </div>
                                 </td>
                                 <td className="p-4 hidden md:table-cell">
                                     {user.role === 'admin' ? (
                                         <span className="flex items-center gap-1 text-indigo-400 font-medium">
                                             <Shield className="w-3 h-3" /> Admin
                                         </span>
                                     ) : (
                                         <span className="text-zinc-500">Usuario</span>
                                     )}
                                 </td>
                                 <td className="p-4">
                                     <PlanBadge plan={user.plan} />
                                 </td>
                                 <td className="p-4 hidden md:table-cell">
                                     <div className="flex flex-col gap-1">
                                         <div className="text-zinc-300 font-medium">{formatBytes(user.storageUsed)}</div>
                                         <div className="text-xs text-zinc-500">{user.filesCount} archivos</div>
                                     </div>
                                 </td>
                                 <td className="p-4 text-right">
                                     <div className="text-right">
                                         <button
                                            onClick={() => setEditingUser(user)}
                                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                            title="Editar usuario"
                                         >
                                            <Edit2 className="w-4 h-4" />
                                         </button>
                                     </div>
                                 </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
             {/* Pagination */}
             {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-muted-foreground">
                        Página {page} de {totalPages}
                    </span>
                    <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

            )}
            
            {editingUser && (
                <EditUserModal 
                    isOpen={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    user={editingUser}
                    onUpdate={handleUpdateUser}
                />
            )}
        </div>
    )
}
