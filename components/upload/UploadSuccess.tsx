import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, QrCode } from "lucide-react"
import QRCode from "react-qr-code"
import { useModal } from "@/components/ModalProvider"

interface UploadSuccessProps {
    downloadUrl: string
    showQR: boolean
    setShowQR: (show: boolean) => void
    onReset: () => void
}

export default function UploadSuccess({
    downloadUrl,
    showQR,
    setShowQR,
    onReset
}: UploadSuccessProps) {
    const { showModal } = useModal()

    const handleCopyLink = () => {
        navigator.clipboard.writeText(downloadUrl)
        showModal({
            title: "Enlace Copiado",
            message: "El enlace de descarga ha sido copiado al portapapeles.",
            type: "success"
        })
    }

    return (
        <div className="text-center py-4">
             <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500"
             >
                 <CheckCircle className="h-6 w-6" />
             </motion.div>
             <h4 className="text-lg font-bold text-green-500">¡Enviado!</h4>
             <p className="text-sm text-zinc-500 mb-4">Tu archivo está listo para compartir.</p>
             
             {showQR && (
                 <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 flex flex-col items-center p-4 bg-white rounded-xl"
                 >
                     <QRCode value={downloadUrl} size={128} />
                     <p className="text-xs text-black mt-2 font-medium">Escanéame</p>
                 </motion.div>
             )}

             <div className="flex flex-col gap-2">
                 <div className="flex gap-2">
                     <button onClick={onReset} className="flex-1 rounded-xl bg-zinc-800 py-3 text-sm font-medium hover:bg-zinc-700 transition-colors">
                         Enviar otro
                     </button>
                     <button 
                        onClick={handleCopyLink}
                        className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                    >
                         Copiar Link
                     </button>
                 </div>
                 <button 
                    onClick={() => setShowQR(!showQR)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-800/50 border border-zinc-700 py-2 text-sm font-medium hover:bg-zinc-800 transition-colors"
                 >
                     <QrCode className="w-4 h-4" />
                     {showQR ? "Ocultar QR" : "Mostrar QR Móvil"}
                 </button>
             </div>
        </div>
    )
}
