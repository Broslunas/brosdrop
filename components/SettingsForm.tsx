"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User, Save, Loader2 } from "lucide-react"
import { useModal } from "@/components/ModalProvider"

import ProfileSection from "./settings/ProfileSection"
import SubscriptionSection from "./settings/SubscriptionSection"
import PreferencesSection from "./settings/PreferencesSection"
import BrandingSection from "./settings/BrandingSection"
import DangerZoneSection from "./settings/DangerZoneSection"

export default function SettingsForm() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { showModal } = useModal()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    newsletterSubscribed: false,
    emailNotifications: true,
    defaultView: 'grid',
    branding: { logo: '', background: '', enabled: true },
    plan: 'free',
    planExpiresAt: null as string | null
  })

  // Load initial data
  useEffect(() => {
     fetch('/api/user')
        .then(res => res.json())
        .then(data => {
            if (data && !data.error) {
                setFormData({
                    name: data.name || session?.user?.name || "",
                    image: data.image || session?.user?.image || "",
                    newsletterSubscribed: data.newsletterSubscribed || false,
                    emailNotifications: data.emailNotifications ?? true,
                    defaultView: data.defaultView || 'grid',
                    branding: data.branding || { logo: '', background: '', enabled: true },
                    plan: data.plan || 'free',
                    planExpiresAt: data.planExpiresAt || null
                })
            }
        })
        .finally(() => setLoading(false))
  }, [session])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
        const res = await fetch('/api/user', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        
        if (!res.ok) throw new Error("Failed to update")
        
        // Update session (only name, avoid sending base64 image to cookie)
        await update({ name: formData.name })

        showModal({
            title: "Configuración guardada",
            message: "Tus cambios han sido actualizados correctamente.",
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

  const handleDeleteAccount = () => {
    showModal({
        title: "¿Eliminar cuenta?",
        message: "Estás a punto de eliminar tu cuenta permanentemente. Todos tus archivos y datos se perderán. Esta acción no se puede deshacer.",
        type: "confirm",
        confirmText: "Sí, eliminar cuenta",
        cancelText: "Cancelar",
        onConfirm: async () => {
            try {
                const res = await fetch('/api/user', { method: 'DELETE' })
                if (res.ok) {
                    signOut({ callbackUrl: '/' })
                }
            } catch (error) {
                console.error(error)
            }
        }
    })
  }

  if (loading) {
      return (
          <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5" /> Perfil
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <ProfileSection 
                    name={formData.name}
                    image={formData.image}
                    onNameChange={val => setFormData({...formData, name: val})}
                    onImageChange={val => setFormData({...formData, image: val})}
                />

                <div className="h-px bg-zinc-800" />

                <SubscriptionSection 
                    plan={formData.plan}
                    planExpiresAt={formData.planExpiresAt}
                />

                <div className="h-px bg-zinc-800" />

                <PreferencesSection 
                    newsletter={formData.newsletterSubscribed}
                    notifications={formData.emailNotifications}
                    defaultView={formData.defaultView}
                    onChange={(key, val) => setFormData({...formData, [key]: val})}
                />

                <div className="h-px bg-zinc-800" />

                <BrandingSection 
                    plan={formData.plan}
                    branding={formData.branding}
                    onChange={val => setFormData({...formData, branding: val})}
                />
                
                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={saving}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>

        <DangerZoneSection onDelete={handleDeleteAccount} />
    </div>
  )
}
