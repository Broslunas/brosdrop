"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Crown, Calendar, Zap, CreditCard } from "lucide-react"
import { PRICING } from "@/lib/plans"
import PaymentModal from "@/components/PaymentModal"

interface SubscriptionSectionProps {
    plan: string
    planExpiresAt: string | null
}

export default function SubscriptionSection({ plan, planExpiresAt }: SubscriptionSectionProps) {
    const router = useRouter()
    const [showRenewalModal, setShowRenewalModal] = useState(false)
    const [renewalMonths, setRenewalMonths] = useState<number>(1)

    return (
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" /> Suscripción
            </h3>
            
            <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
                {plan !== 'free' && (
                    <div className={`absolute top-0 left-0 w-1 h-full ${plan === 'pro' ? 'bg-gradient-to-b from-orange-400 to-pink-500' : 'bg-blue-500'}`} />
                )}
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                            <p className="text-zinc-400 text-sm mb-1 uppercase tracking-wider font-semibold">Plan Actual</p>
                            <div className="flex items-center gap-3 mb-2">
                            <span className={`text-3xl font-bold capitalize ${plan === 'pro' ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500' : plan === 'plus' ? 'text-blue-400' : 'text-white'}`}>
                                {plan}
                            </span>
                            {plan === 'free' && <span className="bg-zinc-800 text-zinc-400 px-2 py-1 rounded text-xs border border-zinc-700">Gratuito</span>}
                            </div>
                            
                            {planExpiresAt && (
                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>Caduca el {new Date(planExpiresAt).toLocaleDateString()}</span>
                                </div>
                            )}
                    </div>

                    <div className="flex flex-col gap-4 min-w-[240px]">
                        {plan === 'free' ? (
                            <button 
                                type="button" 
                                onClick={() => router.push('/pricing')}
                                className="bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                <Zap className="w-4 h-4 text-yellow-300" />
                                Mejorar a Premium
                            </button>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <p className="text-xs text-zinc-500 font-medium ml-1">Periodo de Renovación</p>
                                    <div className="grid grid-cols-4 gap-1 p-1 bg-black/20 rounded-xl">
                                        {[1, 3, 6, 12].map(m => (
                                            <button 
                                                key={m}
                                                type="button"
                                                onClick={() => setRenewalMonths(m)}
                                                className={`aspect-square md:aspect-auto md:h-9 flex flex-col md:flex-row items-center justify-center gap-1 rounded-lg text-xs font-bold transition-all ${renewalMonths === m ? 'bg-zinc-700 text-white shadow-lg ring-1 ring-white/10' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                                            >
                                                <span>{m}M</span>
                                                {m === 12 && <span className="text-[9px] text-green-400 bg-green-500/10 px-1 rounded">-20%</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => setShowRenewalModal(true)}
                                    className="bg-white text-black hover:bg-zinc-200 px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        <span>Renovar</span>
                                    </div>
                                    <span className="bg-black/5 px-2 py-0.5 rounded text-sm group-hover:bg-black/10 transition-colors">
                                        {plan !== 'free' && (() => {
                                            const prices = (PRICING as any)[plan]
                                            if (!prices) return '€0'
                                            const price = renewalMonths === 12 ? prices.annual : (prices.monthly * renewalMonths)
                                            return `€${price.toFixed(2)}`
                                        })()}
                                    </span>
                                </button>
                                
                                <button 
                                    type="button" 
                                    onClick={() => router.push('/pricing')}
                                    className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 text-center"
                                >
                                    Comparar planes
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <PaymentModal 
                isOpen={showRenewalModal}
                onClose={() => setShowRenewalModal(false)}
                planName={plan}
                currentPlan={plan}
                isAnnual={renewalMonths === 12}
                months={renewalMonths}
                price={plan !== 'free' ? (() => {
                    const prices = (PRICING as any)[plan]
                    if (!prices) return '€0'
                    const price = renewalMonths === 12 ? prices.annual : (prices.monthly * renewalMonths)
                    return `€${price.toFixed(2)}`
                })() : '€0'}
            />
        </div>
    )
}
