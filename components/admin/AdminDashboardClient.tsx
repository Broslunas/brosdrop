"use client"

import { useState } from "react"
import { Shield, Users, HardDrive, FileText, Activity } from "lucide-react"
import AdminTransfersTable from "@/components/admin/AdminTransfersTable"
import AdminUsersTable from "@/components/admin/AdminUsersTable"
import { formatBytes } from "@/lib/plans"

export default function AdminDashboardClient({ 
    stats 
}: { 
    stats: {
        totalUsers: number
        proUsers: number
        plusUsers: number
        totalBytes: number
        totalFiles: number
    }
}) {
    const [view, setView] = useState<'files' | 'users'>('files')

    return (
        <div className="space-y-8">
             <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Shield className="h-8 w-8 text-indigo-500" />
                        Admin Dashboard
                    </h1>
                    <p className="text-zinc-400 mt-1">Visión general del sistema y gestión.</p>
                </div>
                
                <div className="flex bg-zinc-800 p-1 rounded-xl w-fit">
                    <button 
                        onClick={() => setView('files')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${view === 'files' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
                    >
                        <FileText className="w-4 h-4" />
                        Archivos
                    </button>
                    <button 
                        onClick={() => setView('users')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${view === 'users' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
                    >
                        <Users className="w-4 h-4" />
                        Usuarios
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                             <Users className="w-6 h-6" />
                        </div>
                        <div>
                             <p className="text-sm text-zinc-400">Usuarios Totales</p>
                             <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
                        </div>
                    </div>
                    <div className="flex gap-2 text-xs text-zinc-500">
                        <span className="text-purple-400 font-medium">{stats.proUsers} PRO</span>
                        <span>•</span>
                        <span className="text-blue-400 font-medium">{stats.plusUsers} PLUS</span>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-400">
                             <HardDrive className="w-6 h-6" />
                        </div>
                        <div>
                             <p className="text-sm text-zinc-400">Almacenamiento</p>
                             <h3 className="text-2xl font-bold text-white">{formatBytes(stats.totalBytes)}</h3>
                        </div>
                    </div>
                    <div className="text-xs text-zinc-500">
                        En uso en R2
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-green-500/10 text-green-400">
                             <FileText className="w-6 h-6" />
                        </div>
                        <div>
                             <p className="text-sm text-zinc-400">Archivos Activos</p>
                             <h3 className="text-2xl font-bold text-white">{stats.totalFiles}</h3>
                        </div>
                    </div>
                </div>
                 
                 <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
                             <Activity className="w-6 h-6" />
                        </div>
                        <div>
                             <p className="text-sm text-zinc-400">Estado del Sistema</p>
                             <h3 className="text-2xl font-bold text-green-400">Normal</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                 {view === 'files' ? <AdminTransfersTable /> : <AdminUsersTable />}
            </div>
        </div>
    )
}
