import { motion } from "framer-motion"
import { CheckCircle, Copy } from "lucide-react"
import { useModal } from "@/components/ModalProvider"
import { useSession } from "next-auth/react"
import CloudIntegration from "@/components/CloudIntegration"

interface UploadSuccessProps {
    downloadUrls: string[]
    uploadedFileIds?: string[] // IDs of uploaded files for cloud export
    onReset: () => void
}

export default function UploadSuccess({
    downloadUrls,
    uploadedFileIds = [],
    onReset
}: UploadSuccessProps) {
    const { showModal } = useModal()
    const { data: session } = useSession()
    const planName = (session?.user as any)?.planName || 'free'

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url)
        showModal({
            title: "Enlace Copiado",
            message: "El enlace de descarga ha sido copiado al portapapeles.",
            type: "success"
        })
    }
    
    const handleCopyAll = () => {
         navigator.clipboard.writeText(downloadUrls.join('\n'))
         showModal({
            title: "Enlaces Copiados",
            message: "Todos los enlaces han sido copiados al portapapeles.",
            type: "success"
        })
    }

    const singleUrl = downloadUrls.length === 1 ? downloadUrls[0] : null

    return (
        <div className="text-center py-4 space-y-6">
             <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500"
             >
                 <CheckCircle className="h-6 w-6" />
             </motion.div>
             <h4 className="text-lg font-bold text-green-500">¡Enviado!</h4>
             <p className="text-sm text-zinc-500 mb-4">
                 {downloadUrls.length > 1 ? 'Tus archivos están listos.' : 'Tu archivo está listo para compartir.'}
             </p>

             <div className="flex flex-col gap-2">
                 {/* Multiple Links List */}
                 {downloadUrls.length > 1 && (
                     <div className="text-left bg-zinc-800/50 rounded-xl p-2 mb-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                         {downloadUrls.map((url, i) => (
                             <div key={i} className="flex items-center justify-between p-2 text-xs text-zinc-300 border-b border-white/5 last:border-0">
                                 <span className="truncate flex-1">{url}</span>
                                 <button onClick={() => handleCopyLink(url)} className="p-1 hover:text-white">
                                     <Copy className="w-3 h-3" />
                                 </button>
                             </div>
                         ))}
                     </div>
                 )}

                 <div className="flex gap-2">
                     <button onClick={onReset} className="flex-1 rounded-xl bg-zinc-800 py-3 text-sm font-medium hover:bg-zinc-700 transition-colors">
                         Enviar otro
                     </button>
                     
                     {downloadUrls.length > 1 ? (
                         <button 
                            onClick={handleCopyAll}
                            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                        >
                            Copiar Todo
                        </button>
                     ) : (
                         <button 
                             onClick={() => singleUrl && handleCopyLink(singleUrl)}
                             className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                         >
                            Copiar Link
                         </button>
                     )}
                 </div>
             </div>

             {/* Cloud Export Integration for Plus/Pro users */}
             {session && uploadedFileIds.length > 0 && (planName === 'plus' || planName === 'pro') && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="pt-6 border-t border-white/10"
                >
                    <CloudIntegration
                        planName={planName}
                        mode="export"
                        uploadedFileIds={uploadedFileIds}
                        onExportComplete={() => {
                            showModal({
                                title: "Exportación Completada",
                                message: "Tus archivos han sido exportados exitosamente a la nube.",
                                type: "success"
                            })
                        }}
                    />
                </motion.div>
             )}
        </div>
    )
}
