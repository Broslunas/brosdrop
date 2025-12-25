
"use client"

import { useState } from "react"
import { Lock, ArrowRight, Loader2 } from "lucide-react"

interface Props {
    id: string
    onUnlock: (url: string) => void
    branding?: any
}

export default function PasswordGuard({ id, onUnlock, branding }: Props) {
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(false)

        try {
            const res = await fetch(`/api/files/${id}/unlock`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            })

            const data = await res.json()

            if (res.ok && data.url) {
                onUnlock(data.url)
            } else {
                setError(true)
            }
        } catch (err) {
            console.error(err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    return (
             <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl">
                {branding?.logo ? (
                     <div className="mx-auto mb-6 h-24 flex items-center justify-center">
                         <img src={branding.logo} alt="Logo" className="max-h-full max-w-full object-contain drop-shadow-lg" />
                     </div>
                ) : (
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Lock className="h-10 w-10" />
                    </div>
                )}
                
                <h2 className="mb-2 text-2xl font-bold text-white text-center">Archivo Protegido</h2>
                <p className="text-zinc-400 mb-6 text-center">Este archivo requiere contraseña para ser descargado.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Introduce la contraseña..."
                            className={`
                                w-full rounded-xl bg-zinc-800 border p-4 text-white resize-none 
                                focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all
                                ${error ? 'border-red-500 ring-red-500/20' : 'border-zinc-700'}
                            `}
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-2 ml-1">Contraseña incorrecta</p>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Desbloquear <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
             </div>
    )
}
