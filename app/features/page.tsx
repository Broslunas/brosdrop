"use client"

import { UploadCloud, Shield, Clock, Zap, Globe, FileType } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    name: 'Almacenamiento Seguro',
    description: 'Tus archivos son encriptados y almacenados de forma segura utilizando la tecnología Cloudflare R2.',
    icon: Shield,
    className: "md:col-span-2 md:row-span-2",
  },
  {
    name: 'Auto-Expiración',
    description: 'Limpieza automática para mantener tu privacidad.',
    icon: Clock,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    name: 'Velocidad Global',
    description: 'CDN Global de baja latencia.',
    icon: Zap,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    name: 'Sin Fronteras',
    description: 'Comparte con cualquier persona, en cualquier lugar.',
    icon: Globe,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    name: 'Cualquier Formato',
    description: 'Documentos, imágenes, videos y más.',
    icon: FileType,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    name: 'Drag & Drop',
    description: 'Interfaz simple e intuitiva.',
    icon: UploadCloud,
    className: "md:col-span-2 md:row-span-1",
  },
]

export default function FeaturesPage() {
  return (
    <div className="bg-zinc-950 min-h-screen py-24 sm:py-32 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]" />
            <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/20 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-500/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base font-semibold leading-7 text-indigo-400"
          >
            Características
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Todo lo que necesitas.
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-zinc-400"
          >
            Una suite completa de herramientas diseñadas para hacer que compartir archivos sea una experiencia premium.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
                {features.map((feature, i) => (
                    <motion.div
                        key={feature.name}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`
                            group relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/5 
                            hover:border-white/10 hover:bg-zinc-900/60 transition-all duration-300 p-8 flex flex-col justify-between
                            ${feature.className}
                        `}
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                            <feature.icon className="w-24 h-24 stroke-1 text-white" />
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex p-3 rounded-2xl bg-white/5 mb-4 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-6 h-6 text-indigo-400" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-2">{feature.name}</h3>
                            <p className="text-sm text-zinc-400">{feature.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}
