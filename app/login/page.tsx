"use client"

import { signIn } from "next-auth/react"
import { Github, Mail, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full min-h-[calc(100vh-64px)] overflow-hidden">
        
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -z-10 opacity-50 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-8 shadow-2xl shadow-black/50">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 mb-6 shadow-lg shadow-primary/30">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Bienvenido</h1>
                <p className="text-zinc-400">Inicia sesión para gestionar tus archivos</p>
            </div>

            <div className="flex flex-col gap-4">
            <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="group relative flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-4 text-sm font-medium text-white transition-all hover:border-white/20 hover:shadow-lg hover:shadow-primary/5"
            >
                <Mail className="h-5 w-5 text-zinc-300 group-hover:text-primary transition-colors" />
                <span>Continuar con Google</span>
                <ArrowRight className="absolute right-4 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-500" />
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                className="group relative flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-4 text-sm font-medium text-white transition-all hover:border-white/20 hover:shadow-lg hover:shadow-primary/5"
            >
                <Github className="h-5 w-5 text-zinc-300 group-hover:text-white transition-colors" />
                <span>Continuar con GitHub</span>
                <ArrowRight className="absolute right-4 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-500" />
            </motion.button>
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs text-zinc-500">
                    Al iniciar sesión, aceptas nuestros <a href="#" className="underline hover:text-zinc-300">Términos</a> y <a href="#" className="underline hover:text-zinc-300">Política de Privacidad</a>.
                </p>
            </div>
        </div>
        
        {/* Decoratifve elements */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl -z-10" />
        <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-primary/20 rounded-full blur-2xl -z-10" />
      </motion.div>
    </main>
  )
}
