"use client"

import { Trash2 } from "lucide-react"

interface DangerZoneSectionProps {
    onDelete: () => void
}

export default function DangerZoneSection({ onDelete }: DangerZoneSectionProps) {
    return (
        <div className="bg-destructive/5 backdrop-blur-xl border border-destructive/20 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-destructive mb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Zona de Peligro
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
                Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.
            </p>
            <button 
                disabled
                onClick={onDelete}
                className="bg-destructive/50 cursor-not-allowed text-white/50 px-6 py-3 rounded-xl font-medium transition-colors"
            >
                Eliminar Cuenta (Deshabilitado temporalmente)
            </button>
        </div>
    )
}
