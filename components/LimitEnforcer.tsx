"use client"

import { useEffect, useRef } from "react"
import { useModal } from "@/components/ModalProvider"
import { useRouter, usePathname } from "next/navigation"

interface LimitEnforcerProps {
    isOverLimit: boolean
    message: string
}

export default function LimitEnforcer({ isOverLimit, message }: LimitEnforcerProps) {
    const { showModal } = useModal()
    const router = useRouter()
    const pathname = usePathname()
    const hasShown = useRef(false)

    useEffect(() => {
        if (isOverLimit) {
            // 1. Enforce Navigation Lock
            if (pathname !== "/dashboard/cleanup" && pathname !== "/pricing") {
                router.replace("/dashboard/cleanup")
                return 
            }

            // 2. Show Modal Explanation
            if (pathname === "/pricing") return

            if (!hasShown.current) {
                hasShown.current = true
                showModal({
                    title: "ACCIÓN REQUERIDA",
                    message: (
                        <div className="space-y-4">
                            <p className="font-medium text-red-200">
                                {message}
                            </p>
                            <p className="text-xs text-zinc-400">
                                Se ha restringido el acceso a otras secciones. Debes eliminar archivos antiguos para cumplir con los límites de tu plan o mejorar tu cuenta.
                            </p>
                        </div>
                    ),
                    type: "error",
                    persistent: true,
                    confirmText: "Mejorar Plan",
                    cancelText: "Liberar Espacio",
                    onConfirm: () => {
                        hasShown.current = false
                        router.push("/pricing")
                    },
                    onCancel: () => {
                       // Just close
                    }
                })
            }
        }
    }, [isOverLimit, message, showModal, router, pathname])

    return null
}
