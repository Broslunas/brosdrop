"use client"

import { useState } from "react"
import DropZone from "@/components/DropZone"
import CloudIntegration from "@/components/CloudIntegration"
import { useSession } from "next-auth/react"
import { PLAN_LIMITS, formatBytes } from "@/lib/plans"
import { toast } from "sonner"

export default function UploadPage() {
  const { data: session } = useSession()
  const [importedFiles, setImportedFiles] = useState<File[]>([])
  
  const planName = (session?.user as any)?.plan || 'free'
  const limits = PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
  const sizeLabel = formatBytes(limits.maxBytes)

  const handleCloudImport = (files: File[]) => {
    console.log('Archivos importados desde la nube:', files)
    setImportedFiles(files)
    toast.success(
      `✅ ${files.length} archivo(s) importado(s) correctamente`,
      {
        description: 'Los archivos han sido añadidos. Configura las opciones y haz clic en Subir.'
      }
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 max-w-4xl mx-auto w-full px-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Subir Archivo</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Comparte archivos de forma segura. Tu límite actual es de {sizeLabel} por archivo.</p>
      </div>
      
      <div className="w-full space-y-8">
        {/* Main Upload Area */}
        <DropZone 
          maxBytes={limits.maxBytes} 
          maxSizeLabel={sizeLabel} 
          planName={planName} 
          maxDays={limits.maxDays}
          externalFiles={importedFiles}
          onExternalFilesProcessed={() => setImportedFiles([])}
        />

        {/* Cloud Import Integration - Below DropZone */}
        {session && (
          <div className="w-full">
            <CloudIntegration
              planName={planName}
              mode="import"
              onImportFiles={handleCloudImport}
            />
          </div>
        )}
      </div>
    </div>
  )
}
