"use client"

import { AlertTriangle } from "lucide-react"

export default function BlockedFileBanner({ 
  count 
}: { 
  count: number 
}) {
    if (count <= 0) return null

    return (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-red-500 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                <span>
                    {count === 1 
                        ? "Tienes 1 archivo bloqueado por administración. Verifica el estado en tu dashboard." 
                        : `Tienes ${count} archivos bloqueados por administración. Verifica el estado en tu dashboard.`}
                </span>
            </div>
        </div>
    )
}
