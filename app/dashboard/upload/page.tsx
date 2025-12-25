import DropZone from "@/components/DropZone"

export default function UploadPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Subir Archivo</h1>
        <p className="text-zinc-400">Comparte archivos de forma segura. El límite es de 1GB por archivo.</p>
      </div>
      <DropZone />
    </div>
  )
}
