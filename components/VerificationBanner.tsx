
"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Send } from "lucide-react"
import { useSession } from "next-auth/react"
import { useModal } from "@/components/ModalProvider"

export default function VerificationBanner() {
    const { data: session } = useSession()
    const { showModal } = useModal()
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [hasShownModal, setHasShownModal] = useState(false)

    // Check if verified
    const user = session?.user as any
    const isVerified = user?.emailVerified
    
    // Check if "just registered" (created slightly less than 30 seconds ago)
    // We add a small buffer because of server/client time diffs, but getting createdAt from DB is reliable relative to Date.now() if clocks match.
    // Let's assume 30 seconds window for "Just Registered" flow.
    const isNewUser = user?.createdAt && (new Date().getTime() - new Date(user.createdAt).getTime()) < 45000

    useEffect(() => {
        if (!session || isVerified) return
        
        if (isNewUser && !hasShownModal) {
            setHasShownModal(true)
            showModal({
                title: "¡Bienvenido a Brosdrop!",
                message: "Te hemos enviado un correo de verificación. Por favor, revisa tu bandeja de entrada (y spam) para activar tu cuenta y disfrutar de 7 días de almacenamiento.",
                type: "success",
                confirmText: "Entendido"
            })
        }
    }, [session, isVerified, isNewUser, hasShownModal, showModal])

    if (!session || isVerified) return null

    const handleResend = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/auth/resend-verification', { method: 'POST' })
            if (res.ok) {
                setSent(true)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    
    // If just registered or just sent, show simpler message
    if (isNewUser || sent) {
         return (
            <div className="bg-green-500/10 border-b border-green-500/20 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-green-500 text-sm font-medium">
                     <Send className="h-4 w-4" />
                     <span>Correo de verificación enviado. Por favor revisa tu bandeja de entrada.</span>
                </div>
            </div>
         )
    }

    return (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-3">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 text-yellow-500">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                        Tu correo no ha sido verificado. Tus archivos expirarán en <strong>30 minutos</strong>.
                    </span>
                </div>
                
                <button 
                    onClick={handleResend}
                    disabled={loading}
                    className="flex items-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                    {loading ? 'Enviando...' : (
                        <>
                            <Send className="h-3 w-3" />
                            Reenviar correo de verificación
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
