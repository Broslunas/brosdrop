"use client"

import DropZone from "@/components/DropZone"
import CloudIntegration from "@/components/CloudIntegration"
import { Shield, Zap, Globe, Share2, Lock, Smartphone, ArrowRight, Check } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function HomeClient() {
  const { data: session } = useSession()
  const planName = (session?.user as any)?.planName || 'guest'
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center relative w-full overflow-x-hidden min-h-screen bg-white dark:bg-[#09090b] transition-colors duration-300">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[128px] opacity-50 animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[128px] opacity-50 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[40%] left-[40%] w-[50rem] h-[50rem] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[150px] opacity-30" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 relative z-10 flex flex-col space-y-16 md:space-y-32 pb-32">
      
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[90vh] w-full pt-20 relative">
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-8 max-w-4xl w-full flex flex-col items-center text-center z-10"
          >
            <motion.div variants={fadeInUp}>
                <div className="inline-flex items-center gap-2 p-1.5 px-4 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm font-medium text-zinc-600 dark:text-zinc-300 backdrop-blur-md mb-6 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span>Nuevo: Almacenamiento R2 de Cloudflare</span>
                    <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-400" />
                </div>
            </motion.div>
            
            <motion.h1 
                variants={fadeInUp}
                className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-500 dark:from-white dark:via-white dark:to-zinc-400 drop-shadow-sm leading-[1.1]"
            >
               Comparte archivos<br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">sin límites.</span>
            </motion.h1>
            
            <motion.p 
                variants={fadeInUp}
                className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
            >
               La forma más rápida, segura y elegante de enviar tus archivos grandes. Encriptado de extremo a extremo y sin registros.
            </motion.p>
            
            {/* Main Action - Floating Glass Card */}
            <motion.div 
                variants={fadeInUp}
                className="w-full max-w-2xl mx-auto mt-12 perspective-1000 space-y-6"
            >
                <div className="relative group mx-auto transform transition-transform hover:scale-[1.01] duration-500">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] blur opacity-20 dark:opacity-30 group-hover:opacity-40 dark:group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
                    <div className="relative p-2 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
                        <div className="bg-zinc-50/50 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-white/5 p-6 md:p-8">
                            <DropZone maxBytes={10 * 1024 * 1024} maxSizeLabel="10MB" planName="guest" />
                        </div>
                    </div>
                </div>

                {/* Cloud Integration for authenticated users */}
                {session && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <CloudIntegration
                      planName={planName}
                      mode="import"
                      onImportFiles={(files) => {
                        console.log('Archivos importados desde la nube:', files.length)
                      }}
                    />
                  </motion.div>
                )}
            </motion.div>
          </motion.div>

           {/* Scroll Indicator */}
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1.5, duration: 1 }}
             className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500 animate-bounce"
           >
              <span className="text-xs uppercase tracking-widest">Descubre Más</span>
              <div className="w-px h-12 bg-gradient-to-b from-zinc-400 dark:from-zinc-500 to-transparent" />
           </motion.div>
        </section>

        {/* Bento Grid Features */}
        <section className="w-full">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white">Todo lo que necesitas</h2>
                <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-lg">Potencia tu flujo de trabajo con herramientas diseñadas para profesionales.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
                {/* Large Card: Speed */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="md:col-span-2 row-span-2 rounded-3xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/10 p-8 relative overflow-hidden group hover:border-indigo-500/30 transition-colors shadow-sm dark:shadow-none"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Velocidad Relámpago</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed max-w-md">
                                Utilizamos la red global de Cloudflare para entregar tus archivos desde el servidor más cercano. Baja latencia, máxima velocidad.
                            </p>
                        </div>
                        
                        <div className="mt-8 relative h-48 w-full bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-white/5 overflow-hidden flex items-center justify-center">
                             {/* Abstract Speed Viz */}
                             <div className="flex gap-3 items-end h-32 pb-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-4 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                        initial={{ height: "20%" }}
                                        animate={{ 
                                            height: ["20%", "60%", "30%", "100%", "40%", "80%", "20%"],
                                            opacity: [0.5, 1, 0.5]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            ease: "easeInOut",
                                            delay: i * 0.2,
                                        }}
                                    />
                                ))}
                             </div>
                        </div>
                    </div>
                </motion.div>

                {/* Card: Security */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="rounded-3xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/10 p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors shadow-sm dark:shadow-none"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                         <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Seguridad Total</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">Encriptado AES-256 en reposo y TLS en tránsito.</p>
                    </div>
                </motion.div>

                {/* Card: Global */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/10 p-8 relative overflow-hidden group hover:border-pink-500/30 transition-colors shadow-sm dark:shadow-none"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-4">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Acceso Global</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">Servidores distribuidos en +200 ciudades.</p>
                    </div>
                </motion.div>

                {/* Wide Card: Mobile */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-3 rounded-3xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/10 p-8 md:p-12 relative overflow-hidden group flex flex-col md:flex-row items-center gap-12 shadow-sm dark:shadow-none"
                >
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 dark:opacity-10" />
                    <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white dark:from-zinc-900 to-transparent" />
                    
                    <div className="flex-1 space-y-6 relative z-10 text-center md:text-left">
                         <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">Lleva BrosDrop contigo</h3>
                         <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-md">
                            Totalmente optimizado para dispositivos móviles. Sube fotos desde tu teléfono o descarga documentos en tu tablet sin instalar aplicaciones.
                         </p>
                         <ul className="space-y-2 inline-block text-left">
                            {['Sin apps que instalar', 'Diseño responsivo', 'Gestos táctiles nativos'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                    <div className="p-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400"><Check className="w-3 h-3" /></div>
                                    {item}
                                </li>
                            ))}
                         </ul>
                    </div>
                    
                    <div className="flex-1 relative h-full min-h-[300px] w-full flex items-center justify-center">
                        <div className="relative w-48 h-80 bg-zinc-950 border-4 border-zinc-800 rounded-[2.5rem] shadow-2xl skew-y-[-6deg] group-hover:skew-y-0 transition-transform duration-700">
                             <div className="absolute top-0 left-0 w-full h-full bg-zinc-900 rounded-[2.2rem] overflow-hidden">
                                 {/* Mobile Screen Mockup */}
                                 <div className="h-8 w-1/2 bg-zinc-800 rounded-b-xl mx-auto mb-4" />
                                 <div className="p-4 space-y-4">
                                     <div className="w-full h-32 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
                                         <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                             <Zap className="w-6 h-6" />
                                         </div>
                                     </div>
                                     <div className="w-full h-2 bg-zinc-800 rounded" />
                                     <div className="w-2/3 h-2 bg-zinc-800 rounded" />
                                 </div>
                             </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>

        {/* Call to Action */}
        <section className="relative py-24 w-full">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none" />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative z-10 text-center space-y-8 max-w-3xl mx-auto"
            >
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
                    ¿Estás listo para <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">Mejorar?</span>
                </h2>
                <p className="text-xl text-zinc-600 dark:text-zinc-400">
                    Regístrate gratis y desbloquea transferencias de 200MB, enlaces con contraseña y mayor tiempo de expiración.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <Link href="/login" className="px-8 py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg shadow-black/10 dark:shadow-white/10 hover:shadow-xl" prefetch={true}>
                        Comenzar Gratis
                    </Link>
                    <Link href="/pricing" className="px-8 py-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white font-medium hover:bg-white dark:hover:bg-zinc-900 transition-colors backdrop-blur-sm" prefetch={true}>
                        Ver Planes Pro
                    </Link>
                </div>
            </motion.div>
        </section>

      </div>
    </main>
  )
}
