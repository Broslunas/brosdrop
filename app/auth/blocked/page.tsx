"use client"

import { useSearchParams } from "next/navigation"
import { ShieldAlert } from "lucide-react"

export default function BlockedPage() {
    const searchParams = useSearchParams()
    const message = searchParams.get('message') || "Tu cuenta ha sido bloqueada temporalmente por los administradores."

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-black">
            <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-zinc-900/50 p-8 backdrop-blur-xl text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
                    <ShieldAlert className="h-10 w-10" />
                </div>
                
                <h1 className="mb-2 text-2xl font-bold text-white">Acceso Bloqueado</h1>
                
                <div className="mb-6 p-4 bg-red-500/5 rounded-xl border border-red-500/10 text-sm text-red-200">
                    {message}
                </div>
                
                <p className="text-zinc-400 text-sm mb-6">
                    Si crees que esto es un error, por favor contacta con soporte.
                </p>

                <a 
                    href="https://broslunas.com/contact" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
                >
                    Contactar Soporte
                </a>
            </div>
        </div>
    )
}
