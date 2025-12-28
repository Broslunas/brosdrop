
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, Key, Copy, Check, Eye, EyeOff, RefreshCcw } from "lucide-react"

interface DeveloperSectionProps {
    plan: string
}

export default function DeveloperSection({ plan }: DeveloperSectionProps) {
    const [apiKey, setApiKey] = useState<string | null>(null)
    const [showKey, setShowKey] = useState(false)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const canAccessApi = plan === 'pro' || plan === 'plus'

    useEffect(() => {
        if (canAccessApi) {
            fetch('/api/keys')
                .then(res => res.json())
                .then(data => {
                    if (data.apiKey) setApiKey(data.apiKey)
                })
        }
    }, [canAccessApi])

    const generateKey = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/keys', { method: 'POST' })
            const data = await res.json()
            if (data.apiKey) {
                setApiKey(data.apiKey)
            }
        } catch (error) {
            console.error("Failed to generate key", error)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
                    <Terminal className="w-5 h-5" />
                </div>
                <div>
                     <h2 className="text-lg font-medium text-foreground">Desarrolladores & API</h2>
                     <p className="text-sm text-muted-foreground">Gestiona tus claves de API para integraciones.</p>
                </div>
            </div>

            {!canAccessApi ? (
                <div className="p-6 rounded-2xl glass-card border border-border text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                        <Key className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-foreground font-medium">Acceso API Bloqueado</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                            Actualiza a un plan <strong>Plus</strong> o <strong>Pro</strong> para obtener acceso a nuestra API pública y automatizar tus envíos.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="p-6 rounded-2xl glass-card border border-border space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground">Tu Clave API (Secret Key)</label>
                            {apiKey && (
                                <button 
                                    onClick={generateKey}
                                    disabled={loading}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                                >
                                    <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                    {loading ? 'Generando...' : 'Regenerar Clave'}
                                </button>
                            )}
                        </div>

                        {apiKey ? (
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex items-center gap-2 bg-card/80 dark:bg-black/80 border border-emerald-500/30 rounded-xl p-1 pr-1.5">
                                    <div className="flex-1 px-3 font-mono text-emerald-600 dark:text-emerald-400 text-sm truncate">
                                        {showKey ? apiKey : '•'.repeat(apiKey.length || 24)}
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => setShowKey(!showKey)}
                                            className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button 
                                            onClick={copyToClipboard}
                                            className="p-2 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 rounded-lg transition-colors"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 ml-1">
                                    Esta clave te da control total sobre tu cuenta. No la compartas con nadie.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-muted-foreground text-sm mb-4">Aún no tienes una clave API generada.</p>
                                <button 
                                    onClick={generateKey}
                                    disabled={loading}
                                    className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 hover:opacity-90 text-white text-sm font-medium rounded-lg transition-all shadow-lg hover-lift"
                                >
                                    {loading ? 'Generando...' : 'Generar Clave de API'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h4 className="text-sm font-medium text-foreground mb-3">Documentación Rápida</h4>
                        <div className="bg-muted/50 dark:bg-black/50 rounded-lg p-4 border border-border overflow-hidden">
                             <div className="font-mono text-xs text-muted-foreground space-y-1">
                                 <div className="flex gap-2">
                                     <span className="text-purple-600 dark:text-purple-400">curl</span>
                                     <span className="text-sky-600 dark:text-sky-300">-X</span>
                                     <span className="text-foreground">POST</span>
                                     <span className="text-green-600 dark:text-green-300">"{process.env.NEXT_PUBLIC_APP_URL}/api/v1/upload"</span>
                                     <span className="text-muted-foreground">\</span>
                                 </div>
                                 <div className="pl-4 flex gap-2">
                                     <span className="text-sky-600 dark:text-sky-300">-H</span>
                                     <span className="text-orange-600 dark:text-orange-300">"x-api-key: bdp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"</span>
                                     <span className="text-muted-foreground">\</span>
                                 </div>
                                 <div className="pl-4 flex gap-2">
                                     <span className="text-sky-600 dark:text-sky-300">-d</span>
                                     <span className="text-yellow-600 dark:text-yellow-300">'{"{"}"name": "file.txt", "size": 1024, "type": "text/plain"{"}"}'</span>
                                 </div>
                             </div>
                        </div>
                        <div className="mt-3 text-right">
                             <a href="/docs/api" className="text-xs text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline transition-colors">Ver documentación completa &rarr;</a>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
