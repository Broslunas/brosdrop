"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Check, X, Zap, Crown, Star, Shield, Clock } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import PaymentModal from "@/components/PaymentModal"

const plans = [
    {
        name: "Free",
        price: "€0",
        description: "Para uso personal básico.",
        icon: Star,
        features: [
            "200 MB por archivo",
            "5 archivos activos simultáneos",
            "Caducidad 7 días",
            "1 archivo con contraseña",
            "1 enlace personalizado",
            "Almacenamiento temporal"
        ],
        missing: [
            "Personalización de marca",
            "Mayor caducidad",
            "Soporte prioritario"
        ],
        cta: "Tu Plan Actual",
        current: true,
        gradient: "from-zinc-500 to-zinc-700"
    },
    {
        name: "Plus",
        price: "€4.99",
        period: "/mes",
        description: "Para freelancers y uso frecuente.",
        icon: Zap,
        features: [
            "500 MB por archivo",
            "20 GB almacenamiento total",
            "50 archivos activos simultáneos",
            "5 archivos con contraseña",
            "5 enlaces personalizados",
            "Personalización QR (Colores)",
            "Caducidad 30 días",
            "Gestión Multi-archivo (Zip/Separado)",
            "Acceso API (50 uploads/día)",
            "Soporte por email"
        ],
        missing: [
            "Personalización de marca",
            "Archivos ilimitados"
        ],
        cta: "Seleccionar Plan",
        current: false,
        disabled: false,
        popular: false,
        gradient: "from-blue-500 to-cyan-500"
    },
    {
        name: "Pro",
        price: "€14.99",
        period: "/mes",
        description: "Para creativos y profesionales.",
        icon: Crown,
        features: [
            "5 GB por archivo",
            "200 GB almacenamiento total",
            "250 archivos activos simultáneos",
            "50 archivos con contraseña",
            "25 enlaces personalizados",
            "Personalización QR (Colores + Logo)",
            "Caducidad 1 año",
            "Gestión Multi-archivo (Zip/Separado)",
            "Acceso API (500 uploads/día)",
            "Tu Logo y Fondo"
        ],
        missing: [],
        cta: "Seleccionar Plan",
        current: false,
        disabled: false,
        popular: true,
        gradient: "from-orange-500 to-pink-500"
    }
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { 
            staggerChildren: 0.1 
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
}

export default function PricingPage() {
    const { data: session } = useSession()
    const userPlan = (session?.user as any)?.plan || 'free'

    const [isAnnual, setIsAnnual] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string} | null>(null)

    const openCheckout = (plan: any) => {
        console.log("Opening checkout for plan:", plan)
        if (plan.name === 'Free') return;
        
        let priceToCharge = plan.price
        if (isAnnual) {
             const base = parseFloat(plan.price.replace("€", ""))
             // Annual price: Monthly Base * 12 * 0.8 (20% off)
             priceToCharge = `€${(base * 12 * 0.8).toFixed(2)}` 
        }

        setSelectedPlan({ name: plan.name, price: priceToCharge })
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-pink-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6 mb-20"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                            Planes Flexibles
                        </span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Potencia tus envíos con el plan perfecto para ti. <br className="hidden md:block"/>
                        Desde uso casual hasta flujos de trabajo profesionales.
                    </p>
                    
                    {/* Toggle */}
                    <div className="inline-flex items-center p-1 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-full mt-8">
                        <button 
                            onClick={() => setIsAnnual(false)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${!isAnnual ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Mensual
                        </button>
                        <button 
                            onClick={() => setIsAnnual(true)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${isAnnual ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Anual
                            <span className="text-[10px] font-bold bg-gradient-to-r from-orange-400 to-pink-500 text-black px-1.5 py-0.5 rounded-full">-20%</span>
                        </button>
                    </div>
                </motion.div>

                {/* Grid */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-32"
                >
                    {plans.map((plan) => (
                        <motion.div 
                            key={plan.name}
                            variants={itemVariants}
                            className={`
                                relative p-8 rounded-[2rem] flex flex-col h-full
                                backdrop-blur-xl border transition-all duration-500 group
                                ${plan.popular 
                                    ? 'bg-zinc-900/60 border-primary/30 shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_60px_-10px_rgba(var(--primary-rgb),0.5)]' 
                                    : 'bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/60'
                                }
                            `}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 tracking-wide">
                                    <Crown className="w-3.5 h-3.5 fill-current" /> RECOMENDADO
                                </div>
                            )}

                            <div className="mb-8 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} p-0.5 mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                    <div className="w-full h-full bg-black/90 rounded-[14px] flex items-center justify-center">
                                        <plan.icon className={`w-7 h-7 text-transparent bg-gradient-to-br ${plan.gradient} bg-clip-text`} color="white" />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-sm text-zinc-400 mb-6 min-h-[40px]">{plan.description}</p>
                                
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold text-white tracking-tight">
                                        {isAnnual && plan.price !== "€0" 
                                            ? `€${(parseFloat(plan.price.slice(1)) * 0.8).toFixed(2)}` 
                                            : plan.price}
                                    </span>
                                    {plan.price !== "€0" && <span className="text-zinc-500 text-lg">/mes</span>}
                                </div>
                            </div>

                            <div className="space-y-4 flex-grow mb-8 text-sm relative z-10">
                                <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mb-6" />
                                {plan.features.map((feature, i) => {
                                    const isComingSoon = feature.includes("(Próximamente)")
                                    const text = feature.replace(" (Próximamente)", "")
                                    return (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className={`mt-0.5 p-0.5 rounded-full bg-gradient-to-br ${plan.gradient}`}>
                                                <Check className="w-3 h-3 text-black" strokeWidth={3} />
                                            </div>
                                            <span className="text-zinc-300 flex items-center gap-2">
                                                {text} 
                                                {isComingSoon && (
                                                    <span title="Próximamente" className="inline-flex items-center justify-center bg-white/10 rounded-full p-0.5 text-zinc-400">
                                                        <Clock className="w-3 h-3" />
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    )
                                })}
                                {plan.missing.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 opacity-40">
                                        <X className="w-4 h-4 text-zinc-500 mt-0.5" />
                                        <span className="text-zinc-500">{feature}</span>
                                    </div>
                                ))}
                            </div>

                                {(() => {
                                    const isUserPlan = plan.name.toLowerCase() === userPlan
                                    const isFree = plan.name === 'Free'
                                    
                                    return (
                                        <button 
                                            onClick={() => !isFree && !(plan as any).disabled && openCheckout(plan)}
                                            disabled={isFree || (plan as any).disabled}
                                            className={`
                                                w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 relative overflow-hidden group/btn hover:shadow-lg
                                                ${isFree || (plan as any).disabled
                                                    ? 'bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5' 
                                                    : plan.popular 
                                                        ? 'bg-white text-black hover:scale-[1.02] shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]' 
                                                        : 'bg-white/10 text-white hover:bg-white hover:text-black hover:scale-[1.02]'
                                                }
                                            `}
                                        >
                                           {isFree 
                                                ? (isUserPlan ? "Tu Plan Actual" : "Plan Gratuito")
                                                : (isUserPlan ? "Extender/Renovar" : plan.cta)
                                           }
                                        </button>
                                    )
                                })()}
                        </motion.div>
                    ))}
                </motion.div>

                
                {/* Comparison Table */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-6xl mx-auto"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Comparativa Detallada</h2>
                        <p className="text-zinc-400">Todo lo que necesitas saber.</p>
                    </div>

                    {/* Fancy Glass Table */}
                    <div className="relative rounded-[2rem] overflow-hidden">
                         <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem]" />
                         
                         {/* Header Glows */}
                         <div className="absolute top-0 right-0 w-[30%] h-full bg-primary/5 blur-[80px]" />

                         <div className="relative overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="p-8 font-medium text-zinc-500 uppercase tracking-widest text-xs w-[30%]">Funcionalidad</th>
                                        <th className="p-8 text-center text-zinc-400 text-xs uppercase tracking-widest w-[15%]">Invitado</th>
                                        <th className="p-8 text-center text-zinc-300 text-xs uppercase tracking-widest w-[15%]">Free</th>
                                        <th className="p-8 text-center text-blue-300 text-xs uppercase tracking-widest w-[20%]">Plus</th>
                                        <th className="p-8 text-center text-primary text-xs uppercase tracking-widest font-bold w-[20%] bg-white/[0.02]">Pro</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { name: "Subida Máxima", vals: ["10 MB", "200 MB", "500 MB", "5 GB"] },
                                        { name: "Caducidad Link", vals: ["30 min", "7 días", "30 días", "1 Año"] },
                                        { name: "Almacenamiento Cloud", vals: ["-", "500 MB", "20 GB", "200 GB"] },
                                        { name: "Archivos Simultáneos", vals: ["-", "5", "50", "250"] },
                                        { name: "Archivos con Clave", vals: [<X key="x" className="w-4 h-4 mx-auto text-zinc-600"/>, "1", "5", "50"] },
                                        { name: "Enlaces Personalizados", vals: ["-", "1", "5", "25"] },
                                        { name: "Personalización QR", vals: [<X key="x" className="w-4 h-4 mx-auto text-zinc-600"/>, <X key="x2" className="w-4 h-4 mx-auto text-zinc-600"/>, "Colores", "Colores + Logo"] },
                                        { name: "Acceso API Pública", vals: [<X key="x" className="w-4 h-4 mx-auto text-zinc-600"/>, <X key="x2" className="w-4 h-4 mx-auto text-zinc-600"/>, <Check key="check" className="w-4 h-4 mx-auto text-blue-400"/>, <Check key="check2" className="w-4 h-4 mx-auto text-primary"/>] },
                                        { name: "Soporte Prioritario", vals: [<X key="x" className="w-4 h-4 mx-auto text-zinc-600"/>, <X key="x2" className="w-4 h-4 mx-auto text-zinc-600"/>, <Check key="check" className="w-4 h-4 mx-auto text-blue-400"/>, <Check key="check2" className="w-4 h-4 mx-auto text-primary"/>] },
                                        { name: "Branding Personal", vals: [<X key="x" className="w-4 h-4 mx-auto text-zinc-600"/>, <X key="x2" className="w-4 h-4 mx-auto text-zinc-600"/>, <X key="x3" className="w-4 h-4 mx-auto text-zinc-600"/>, <Check key="check" className="w-4 h-4 mx-auto text-blue-400"/>] },
                                        { name: "Multi-archivos (Zip/Separado)", vals: [<X key="x" className="w-4 h-4 mx-auto text-zinc-600"/>, <X key="x2" className="w-4 h-4 mx-auto text-zinc-600"/>, <Check key="check" className="w-4 h-4 mx-auto text-blue-400"/>, <Check key="check2" className="w-4 h-4 mx-auto text-primary"/>] },
                                    ].map((row, i) => (
                                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="p-6 pl-8 font-medium text-zinc-300 group-hover:text-white transition-colors">{row.name}</td>
                                            <td className="p-6 text-center text-zinc-500">{row.vals[0]}</td>
                                            <td className="p-6 text-center text-zinc-400">{row.vals[1]}</td>
                                            <td className="p-6 text-center text-blue-200 font-medium">{row.vals[2]}</td>
                                            <td className="p-6 text-center text-white font-bold bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors shadow-[inset_1px_0_0_0_rgba(255,255,255,0.05)]">
                                                {row.vals[3]}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                <div className="text-center mt-20 pt-10 border-t border-white/10">
                    <p className="text-zinc-500 text-sm">
                        Todos los precios están en Euros (€). Puedes cancelar en cualquier momento desde tu panel.
                        ¿Dudas? <Link href="/contact" className="text-white hover:underline decoration-primary underline-offset-4">Contáctanos</Link>.
                    </p>
                </div>
            </div>
            
            <PaymentModal 
                isOpen={!!selectedPlan}
                onClose={() => setSelectedPlan(null)}
                planName={selectedPlan?.name || ""}
                price={selectedPlan?.price || "0"}
                isAnnual={isAnnual}
                currentPlan={userPlan}
            />
        </div>
    )
}
