"use client"

import { useState } from "react"
import { Mail, Bell, LayoutGrid, List, Save, Loader2, Globe } from "lucide-react"
import { useModal } from "@/components/ModalProvider"

interface PreferencesSectionProps {
    initialData: {
        newsletterSubscribed: boolean
        emailNotifications: boolean
        defaultPublicFiles: boolean
        defaultView: string
    }
}

export default function PreferencesSection({ initialData }: PreferencesSectionProps) {
    const { showModal } = useModal()
    const [data, setData] = useState(initialData)
    const [saving, setSaving] = useState(false)

    const handleChange = (key: string, value: any) => {
        setData(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            
            if (!res.ok) throw new Error("Failed to update")
            
            showModal({
                title: "Preferencias guardadas",
                message: "Tus preferencias se han actualizado correctamente.",
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

    return (
        <div className="glass-card border border-border rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Mail className="w-5 h-5" /> Preferencias
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

            <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border cursor-pointer hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Newsletter</p>
                            <p className="text-xs text-muted-foreground">Recibe noticias y actualizaciones.</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${data.newsletterSubscribed ? 'bg-primary' : 'bg-input'}`}>
                        <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={data.newsletterSubscribed}
                            onChange={e => handleChange('newsletterSubscribed', e.target.checked)}
                        />
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${data.newsletterSubscribed ? 'translate-x-6' : ''}`} />
                    </div>
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border cursor-pointer hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Notificaciones</p>
                            <p className="text-xs text-muted-foreground">Recibe alertas sobre tus archivos.</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${data.emailNotifications ? 'bg-primary' : 'bg-input'}`}>
                        <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={data.emailNotifications}
                            onChange={e => handleChange('emailNotifications', e.target.checked)}
                        />
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${data.emailNotifications ? 'translate-x-6' : ''}`} />
                    </div>
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border cursor-pointer hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                             <Globe className="w-5 h-5" /> 
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Visibilidad por defecto</p>
                            <p className="text-xs text-muted-foreground">Haz públicos los nuevos archivos automáticamente.</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${data.defaultPublicFiles ? 'bg-primary' : 'bg-input'}`}>
                        <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={data.defaultPublicFiles}
                            onChange={e => handleChange('defaultPublicFiles', e.target.checked)}
                        />
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${data.defaultPublicFiles ? 'translate-x-6' : ''}`} />
                    </div>
                </label>

                <div className="pt-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-3">Vista por defecto</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div 
                                onClick={() => handleChange('defaultView', 'grid')}
                                className={`cursor-pointer p-4 rounded-xl border flex items-center gap-3 transition-all hover-lift ${data.defaultView === 'grid' ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                                <span className="font-medium">Cuadrícula</span>
                            </div>
                            <div 
                                onClick={() => handleChange('defaultView', 'list')}
                                className={`cursor-pointer p-4 rounded-xl border flex items-center gap-3 transition-all hover-lift ${data.defaultView === 'list' ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                            >
                                <List className="w-5 h-5" />
                                <span className="font-medium">Lista</span>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    )
}
