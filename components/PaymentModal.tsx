
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Shield, AlertCircle, ArrowRight } from "lucide-react"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    planName: string
    price: string
    isAnnual: boolean
    currentPlan?: string
    months?: number
}

export default function PaymentModal({ isOpen, onClose, planName, price, isAnnual, currentPlan, months }: PaymentModalProps) {
    const router = useRouter()
    const { update } = useSession()
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    // Robust price parsing (handles "€4.99", "$4.99", "4.99")
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''))

    const handleApprove = async (data: any, actions: any) => {
        try {
            const order = await actions.order.capture()
            
            // Backend verification
            const res = await fetch("/api/checkout/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderID: order.id,
                    planName: planName.toLowerCase(),
                    isAnnual,
                    months: months || (isAnnual ? 12 : 1)
                })
            })

            if (!res.ok) throw new Error("Verification failed")
            
            const result = await res.json()
            if (result.success) {
                setSuccess(true)
                await update() // Refresh session with new plan
            }
        } catch (err) {
            console.error(err)
            setError("Hubo un error procesando tu pago. Por favor contacta a soporte.")
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-black/20 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white">Completar Pago</h3>
                                <p className="text-sm text-zinc-400">
                                    {months && months > 0 
                                        ? `Renovación por ${months} Mes${months > 1 ? 'es' : ''}`
                                        : `Plan ${planName} ${isAnnual ? 'Anual' : 'Mensual'}`
                                    }
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Summary */}
                            <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
                                <span className="text-zinc-300">Total a pagar:</span>
                                <span className="text-2xl font-bold text-white">{price}</span>
                            </div>

                            {currentPlan && currentPlan !== 'free' && currentPlan.toLowerCase() !== planName.toLowerCase() && (
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-200 flex gap-2 items-start">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <p>Actualización: Tu nuevo plan {planName} comenzará hoy y sustituirá los días restantes de tu plan actual.</p>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            {success ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-2">¡Pago Exitoso!</h4>
                                    <p className="text-zinc-400 mb-6">Tu cuenta ha sido actualizada.</p>
                                    
                                    <button 
                                        onClick={() => {
                                            router.push(`/dashboard?payment=success&plan=${planName}`)
                                            onClose()
                                        }}
                                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all"
                                    >
                                        Ir al Dashboard <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="min-h-[150px]">
                                     <PayPalScriptProvider options={{ 
                                         clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
                                         currency: "EUR"
                                     }}>
                                        <PayPalButtons 
                                            style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                                            createOrder={(data, actions) => {
                                                const description = months 
                                                    ? `Renovación BrosDrop ${months} Meses` 
                                                    : `BrosDrop Plan ${planName} (${isAnnual ? 'Anual' : 'Mensual'})`

                                                return actions.order.create({
                                                    intent: "CAPTURE",
                                                    purchase_units: [{
                                                        amount: {
                                                            currency_code: "EUR",
                                                            value: numericPrice.toString()
                                                        },
                                                        description: description
                                                    }]
                                                })
                                            }}
                                            onApprove={handleApprove}
                                            onError={(err) => {
                                                console.error("PayPal Error:", err)
                                            }}
                                        />
                                     </PayPalScriptProvider>
                                     <p className="text-xs text-center text-zinc-500 mt-4 flex items-center justify-center gap-1">
                                         <Shield className="w-3 h-3" /> Pago seguro vía PayPal
                                     </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
