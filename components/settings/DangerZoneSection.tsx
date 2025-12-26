"use client"

import { Trash2 } from "lucide-react"

interface DangerZoneSectionProps {
    onDelete: () => void
}

export default function DangerZoneSection({ onDelete }: DangerZoneSectionProps) {
    return (
        <div className="bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Zona de Peligro
            </h2>
            <p className="text-zinc-400 mb-6 text-sm">
                Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.
            </p>
            <button 
                disabled
                onClick={onDelete}
                className="bg-red-500/50 cursor-not-allowed text-white/50 px-6 py-3 rounded-xl font-medium transition-colors"
            >
                Eliminar Cuenta (Deshabilitado temporalmente)
            </button>
        </div>
    )
}
