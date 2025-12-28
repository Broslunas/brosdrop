"use client"

import { Shield, Lock, Server, FileKey, Eye, Globe } from "lucide-react"
import { motion } from "framer-motion"

const securityFeatures = [
    {
        title: "Encriptación en Tránsito",
        description: "Todos los datos se transmiten mediante TLS 1.3, el estándar de seguridad más moderno, asegurando que nadie pueda interceptar tus archivos durante la subida o descarga.",
        icon: Globe,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        title: "Almacenamiento Seguro",
        description: "Utilizamos Cloudflare R2 con redundancia global. Tus archivos están protegidos en reposo y aislados de otros usuarios.",
        icon: Server,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20"
    },
    {
        title: "Protección con Contraseña",
        description: "Añade una capa extra de seguridad a tus transferencias sensibles. Las contraseñas se hash no se almacenan en texto plano.",
        icon: Lock,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
    },
    {
        title: "Enlaces Efímeros",
        description: "Configura la autodestrucción de tus archivos. Una vez expirados, se eliminan permanentemente de nuestros servidores sin posibilidad de recuperación.",
        icon: ClockIcon, // Defined below to avoid conflict/import issue if not in lucide
        color: "text-pink-400",
        bg: "bg-pink-500/10",
        border: "border-pink-500/20"
    }
]

function ClockIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    )
}

export default function SecurityPage() {
    return (
        <div className="bg-white dark:bg-zinc-950 min-h-screen py-24 sm:py-32 relative overflow-hidden transition-colors duration-300">
             {/* Background Effects */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                 <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]" />
                <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl lg:text-center mb-20">
                    <h2 className="text-base font-semibold leading-7 text-emerald-600 dark:text-emerald-400">Seguridad Primero</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                    Tus archivos, seguros y privados.
                    </p>
                    <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                    La privacidad no es una opción, es el defecto. Hemos construido BrosDrop desde cero pensando en la seguridad de tus datos.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {securityFeatures.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-8 rounded-3xl border ${feature.border} ${feature.bg} backdrop-blur-sm relative overflow-hidden group shadow-sm`}
                        >
                             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                                <feature.icon className={`w-32 h-32 ${feature.color}`} />
                            </div>

                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6 border ${feature.border}`}>
                                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{feature.title}</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Compliance Badge Area */}
                 <div className="mt-24 text-center">
                    <p className="text-zinc-500 dark:text-zinc-500 text-sm mb-8 uppercase tracking-widest font-semibold">Comprometidos con tu privacidad</p>
                    <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Mock logos for compliance/tech stack */}
                        <div className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-white/10 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-white">
                            <Shield className="w-5 h-5" /> GDPR Compliant
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-white/10 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-white">
                             <Lock className="w-5 h-5" /> SOC 2 Ready
                        </div>
                         <div className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-white/10 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-white">
                             <Server className="w-5 h-5" /> ISO 27001 Stds
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
