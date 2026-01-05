"use client"

import { signIn } from "next-auth/react"
import { Github, Mail, ArrowRight, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function LoginClient() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-zinc-950 relative overflow-hidden transition-colors duration-300">
        
        {/* Background Gradients */}
        <div className="absolute top-[-20%] right-[-20%] w-[40rem] h-[40rem] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[128px] opacity-40 dark:opacity-20 animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[40rem] h-[40rem] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[128px] opacity-40 dark:opacity-20 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="w-full max-w-sm relative z-10 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-8 group justify-center w-full">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver al inicio
                    </Link>

                    <div className="mb-8 text-center">
                        <div className="mx-auto w-12 h-12 bg-zinc-100 dark:bg-white/5 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-white/10 mb-4">
                             <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Bienvenido</h1>
                        <p className="text-zinc-600 dark:text-zinc-400">Inicia sesión para gestionar tus archivos</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                            className="group relative flex items-center justify-center gap-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 py-4 text-sm font-medium text-zinc-700 dark:text-white transition-all hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-lg hover:shadow-primary/5 shadow-sm"
                        >
                            <Mail className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors" />
                            <span>Continuar con Google</span>
                            <ArrowRight className="absolute right-4 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-400 dark:text-zinc-500" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                            className="group relative flex items-center justify-center gap-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 py-4 text-sm font-medium text-zinc-700 dark:text-white transition-all hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-lg hover:shadow-primary/5 shadow-sm"
                        >
                            <Github className="h-5 w-5 text-zinc-400 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                            <span>Continuar con GitHub</span>
                            <ArrowRight className="absolute right-4 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-400 dark:text-zinc-500" />
                        </motion.button>
                    </div>

                    <div className="mt-8">
                        <p className="text-xs text-center text-zinc-500">
                             Al continuar, aceptas nuestros <a href="/terms" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">Términos de Servicio</a> y <a href="/privacy" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">Política de Privacidad</a>.
                        </p>
                    </div>
                </motion.div>
        </div>
    </main>
  )
}
