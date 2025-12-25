
"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User, Mail, Bell, Trash2, Camera, Save, Loader2 } from "lucide-react"
import { useModal } from "@/components/ModalProvider"

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
    emailNotifications: true
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
                    emailNotifications: data.emailNotifications ?? true
                })
            }
        })
        .finally(() => setLoading(false))
  }, [session])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, image: reader.result as string }))
        }
        reader.readAsDataURL(file)
    }
  }

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
        
        // Update session
        await update({ name: formData.name, image: formData.image })

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
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 group-hover:border-primary transition-colors">
                            {formData.image ? (
                                <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                    <User className="w-10 h-10" />
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                            <Camera className="w-4 h-4" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                    <div>
                        <p className="text-zinc-200 font-medium mb-1">Foto de Perfil</p>
                        <p className="text-sm text-zinc-500">Haz clic en el icono de cámara para cambiar tu foto.</p>
                    </div>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Nombre</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Tu nombre"
                    />
                </div>

                <div className="h-px bg-zinc-800 my-8" />

                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" /> Preferencias
                </h3>

                {/* Toggles */}
                <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-zinc-200">Newsletter</p>
                                <p className="text-xs text-zinc-500">Recibe noticias y actualizaciones.</p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors relative ${formData.newsletterSubscribed ? 'bg-primary' : 'bg-zinc-700'}`}>
                            <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={formData.newsletterSubscribed}
                                onChange={e => setFormData({...formData, newsletterSubscribed: e.target.checked})}
                            />
                            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.newsletterSubscribed ? 'translate-x-6' : ''}`} />
                        </div>
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-zinc-200">Notificaciones</p>
                                <p className="text-xs text-zinc-500">Recibe alertas sobre tus archivos.</p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors relative ${formData.emailNotifications ? 'bg-primary' : 'bg-zinc-700'}`}>
                            <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={formData.emailNotifications}
                                onChange={e => setFormData({...formData, emailNotifications: e.target.checked})}
                            />
                            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.emailNotifications ? 'translate-x-6' : ''}`} />
                        </div>
                    </label>
                </div>

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

        {/* Delete Account */}
        <div className="bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Zona de Peligro
            </h2>
            <p className="text-zinc-400 mb-6 text-sm">
                Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.
            </p>
            <button 
                disabled
                onClick={handleDeleteAccount}
                className="bg-red-500/50 cursor-not-allowed text-white/50 px-6 py-3 rounded-xl font-medium transition-colors"
            >
                Eliminar Cuenta (Deshabilitado temporalmente)
            </button>
        </div>
    </div>
  )
}
