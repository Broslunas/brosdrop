"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useModal } from "@/components/ModalProvider"
import { useRouter } from "next/navigation"
import DashboardFiles from "@/components/DashboardFiles"
import { AlertTriangle } from "lucide-react"

// Import formatBytes or duplicate it (it's small)
const formatBytes = (bytes: number) => {
    if (!+bytes) return '0 Bytes'
    const k = 1000
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export default function CleanupClient({ initialFiles, plan }: { initialFiles: any[], plan: any }) {
    const [files, setFiles] = useState(initialFiles)
    const { showModal } = useModal()
    const router = useRouter()

    // Derived stats from CLIENT state
    const activeFilesCount = files.length
    const activeProtectedCount = files.filter(f => f.passwordHash).length
    const totalStorageBytes = files.reduce((acc, curr) => acc + (curr.size || 0), 0)

    const isFilesOver = plan.maxFiles !== Infinity && activeFilesCount > plan.maxFiles
    const isPwdOver = plan.maxPwd !== Infinity && activeProtectedCount > plan.maxPwd
    const isStorageOver = plan.maxTotalStorage && totalStorageBytes > plan.maxTotalStorage

    const hasShownSuccess = useRef(false)

    // Check if user is now compliant
    useEffect(() => {
        if (!isFilesOver && !isPwdOver && !isStorageOver && !hasShownSuccess.current) {
            hasShownSuccess.current = true
            showModal({
                title: "¡Cuenta Regularizada!",
                message: "Has vuelto a estar dentro de los límites. Ten cuidado en el futuro para evitar nuevos bloqueos.",
                type: "success",
                confirmText: "Volver al Dashboard",
                persistent: true,
                onConfirm: () => router.push("/dashboard")
            })
        }
    }, [isFilesOver, isPwdOver, isStorageOver, showModal, router])

    const handleFileDeleted = (id: string) => {
        setFiles(prev => prev.filter(f => f._id !== id))
        // Router refresh is called by DashboardFiles, so server state updates too
    }

    const handleFileUpdated = (updatedFile: any) => {
        setFiles(prev => prev.map(f => f._id === updatedFile._id ? updatedFile : f))
    }

    return (
        <div className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                <div className="p-4 bg-red-500/20 rounded-full text-red-500 flex-shrink-0">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-red-500 mb-2">Acción Requerida: Liberar Espacio</h1>
                    <p className="text-zinc-300 mb-4 max-w-3xl">
                        Has superado los límites de tu plan actual. Para seguir usando Brosdrop y evitar la eliminación automática de tus archivos más antiguos en 24 horas, debes eliminar archivos o quitar protecciones hasta estar dentro de los límites.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        {plan.maxFiles !== Infinity && (
                            <span className={`px-3 py-1 rounded-full border text-sm font-medium ${isFilesOver ? 'bg-zinc-900 border-red-500/50 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                                Archivos: {activeFilesCount} / {plan.maxFiles}
                            </span>
                        )}
                        {plan.maxPwd !== Infinity && (
                            <span className={`px-3 py-1 rounded-full border text-sm font-medium ${isPwdOver ? 'bg-zinc-900 border-red-500/50 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                                Con Clave: {activeProtectedCount} / {plan.maxPwd}
                            </span>
                        )}
                        {plan.maxTotalStorage && (
                            <span className={`px-3 py-1 rounded-full border text-sm font-medium ${isStorageOver ? 'bg-zinc-900 border-red-500/50 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                                Almacenamiento: {formatBytes(totalStorageBytes)} / {formatBytes(plan.maxTotalStorage)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <p className="text-zinc-400 mb-4 text-sm uppercase tracking-wider font-bold">Selecciona y elimina archivos</p>
                <DashboardFiles 
                    initialFiles={files} 
                    defaultView="list" 
                    onFileDeleted={handleFileDeleted}
                    onFileUpdated={handleFileUpdated}
                />
            </div>
        </div>
    )
}
