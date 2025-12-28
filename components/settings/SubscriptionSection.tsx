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
        <div className="glass-card border border-border rounded-3xl p-8">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" /> Suscripción
            </h3>
            
            <div className="bg-muted/30 border border-border rounded-2xl p-6 relative overflow-hidden">
                {plan !== 'free' && (
                    <div className={`absolute top-0 left-0 w-1 h-full ${plan === 'pro' ? 'bg-gradient-to-b from-orange-400 to-pink-500' : 'bg-blue-500'}`} />
                )}
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                            <p className="text-muted-foreground text-sm mb-1 uppercase tracking-wider font-semibold">Plan Actual</p>
                            <div className="flex items-center gap-3 mb-2">
                            <span className={`text-3xl font-bold capitalize ${plan === 'pro' ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500' : plan === 'plus' ? 'text-blue-500 dark:text-blue-400' : 'text-foreground'}`}>
                                {plan}
                            </span>
                            {plan === 'free' && <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs border border-border">Gratuito</span>}
                            </div>
                            
                            {planExpiresAt && (
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
                                className="gradient-primary hover:opacity-90 text-white px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover-lift"
                            >
                                <Zap className="w-4 h-4 text-yellow-300" />
                                Mejorar a Premium
                            </button>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground font-medium ml-1">Periodo de Renovación</p>
                                    <div className="grid grid-cols-4 gap-1 p-1 bg-muted/50 rounded-xl">
                                        {[1, 3, 6, 12].map(m => (
                                            <button 
                                                key={m}
                                                type="button"
                                                onClick={() => setRenewalMonths(m)}
                                                className={`aspect-square md:aspect-auto md:h-9 flex flex-col md:flex-row items-center justify-center gap-1 rounded-lg text-xs font-bold transition-all ${renewalMonths === m ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                            >
                                                <span>{m}M</span>
                                                {m === 12 && <span className="text-[9px] text-green-600 dark:text-green-400 bg-green-500/10 px-1 rounded">-20%</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => setShowRenewalModal(true)}
                                    className="bg-foreground text-background hover:opacity-90 px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-between group hover-lift"
                                >
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        <span>Renovar</span>
                                    </div>
                                    <span className="bg-background/10 px-2 py-0.5 rounded text-sm group-hover:bg-background/20 transition-colors">
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
                                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 text-center transition-colors"
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
