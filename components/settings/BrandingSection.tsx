"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid, Camera, File, Image as ImageIcon, Save, Loader2 } from "lucide-react"
import { useModal } from "@/components/ModalProvider"

interface BrandingSectionProps {
    plan: string
    initialBranding: { logo: string, background: string, enabled: boolean }
}

export default function BrandingSection({ plan, initialBranding }: BrandingSectionProps) {
    const router = useRouter()
    const { showModal } = useModal()
    const [branding, setBranding] = useState(initialBranding)
    const [saving, setSaving] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'background') => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setBranding({ ...branding, [field]: reader.result as string })
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branding })
            })
            
            if (!res.ok) throw new Error("Failed to update")
            
            showModal({
                title: "Personalización guardada",
                message: "Tu marca ha sido actualizada correctamente.",
                type: "success"
            })
        } catch (error) {
            showModal({
                title: "Error",
                message: "No se pudieron guardar los cambios.",
                type: "error"
            })
        } finally {
            setSaving(false)
        }
    }

    if (plan !== 'pro') {
        return (
            <div className="glass-card border border-border rounded-3xl p-8">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-muted-foreground" /> Personalización de Marca
                </h3>
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:border-purple-500/40 transition-colors" onClick={() => router.push('/pricing')}>
                        <div className="relative z-10 flex flex-col items-start gap-4">
                            <div>
                            <h4 className="text-base font-bold text-foreground mb-2">Desbloquea Branding Personalizado</h4>
                            <p className="text-muted-foreground text-sm">
                                Con el Plan Pro, puedes añadir tu propio logo y un fondo personalizado a todas tus páginas de descarga.
                            </p>
                            </div>
                            <button type="button" className="gradient-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all hover-lift">
                                Mejorar a Pro
                            </button>
                        </div>
                </div>
            </div>
        )
    }

    return (
        <div className="glass-card border border-border rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-purple-600 dark:text-purple-500" /> Personalización (Pro)
                </h3>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover-lift"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                </button>
            </div>
            
            <div className="space-y-6">
                    {/* Enabled Toggle */}
                    <label className="flex items-center justify-between p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 cursor-pointer hover:bg-purple-500/20 transition-colors">
                    <div>
                        <p className="font-medium text-foreground">Personalización Activada</p>
                        <p className="text-xs text-muted-foreground">Muestra tu logo y fondo en la página de descarga.</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${branding?.enabled ? 'bg-purple-600 dark:bg-purple-500' : 'bg-input'}`}>
                        <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={branding?.enabled ?? true}
                            onChange={e => setBranding({ ...branding, enabled: e.target.checked })}
                        />
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${branding?.enabled ? 'translate-x-6' : ''}`} />
                    </div>
                </label>

                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Logo Personalizado</label>
                    <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden relative group">
                                {branding?.logo ? (
                                    <img src={branding.logo} className="w-full h-full object-contain p-2" alt="Logo" />
                                ) : (
                                    <File className="w-6 h-6 text-muted-foreground" />
                                )}
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                    <Camera className="w-4 h-4 text-white" />
                                    <input type="file" accept="image/*" className="hidden" 
                                        onChange={(e) => handleFileChange(e, 'logo')}
                                    />
                                </label>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                <p>Sube tu logo (PNG transparente recomendado).</p>
                                <button type="button" onClick={() => setBranding({ ...branding, logo: '' })} className="text-destructive hover:opacity-80 mt-1 transition-opacity">Eliminar logo</button>
                            </div>
                    </div>
                </div>

                {/* Background Upload */}
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Fondo de Pantalla</label>
                    <div className="h-32 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden relative group">
                            {branding?.background ? (
                                <img src={branding.background} className="w-full h-full object-cover" alt="Background" />
                            ) : (
                                <div className="text-muted-foreground flex flex-col items-center">
                                    <ImageIcon className="w-8 h-8 mb-2" />
                                    <span>Sin fondo personalizado</span>
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                <div className="bg-card/90 px-4 py-2 rounded-lg text-foreground text-sm flex items-center gap-2 shadow-lg">
                                    <Camera className="w-4 h-4" /> Cambiar Fondo
                                </div>
                                <input type="file" accept="image/*" className="hidden" 
                                    onChange={(e) => handleFileChange(e, 'background')}
                                />
                            </label>
                    </div>
                    {branding?.background && (
                            <button type="button" onClick={() => setBranding({ ...branding, background: '' })} className="text-xs text-destructive hover:opacity-80 mt-2 transition-opacity">Eliminar fondo</button>
                    )}
                </div>
            </div>
        </div>
    )
}
