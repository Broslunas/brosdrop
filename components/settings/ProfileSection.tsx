"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { User, Camera, Save, Loader2 } from "lucide-react"
import Image from "next/image"
import { useModal } from "@/components/ModalProvider"

interface ProfileSectionProps {
    initialName: string
    initialImage: string
    initialUserNameID: string
    initialIsPublicProfile: boolean
}

export default function ProfileSection({ initialName, initialImage, initialUserNameID, initialIsPublicProfile }: ProfileSectionProps) {
    const { update } = useSession()
    const { showModal } = useModal()
    const [name, setName] = useState(initialName)
    const [image, setImage] = useState(initialImage)
    const [userNameID, setUserNameID] = useState(initialUserNameID)
    const [isPublicProfile, setIsPublicProfile] = useState(initialIsPublicProfile)
    const [saving, setSaving] = useState(false)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setImage(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, image, userNameID, isPublicProfile })
            })
            
            if (!res.ok) throw new Error("Failed to update")
            
            await update({ name }) // Client side update

            showModal({
                title: "Perfil actualizado",
                message: "Tu información ha sido guardada correctamente.",
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
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5" /> Perfil
                </h2>
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
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border group-hover:border-primary transition-colors">
                            {image ? (
                                <Image 
                                    src={image} 
                                    alt="Profile" 
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <User className="w-10 h-10" />
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:opacity-90 transition-all shadow-lg hover-lift">
                            <Camera className="w-4 h-4" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                    <div>
                        <p className="text-foreground font-medium mb-1">Foto de Perfil</p>
                        <p className="text-sm text-muted-foreground">Haz clic en el icono de cámara para cambiar tu foto.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Nombre</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-card border border-input rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="Tu nombre"
                        />
                    </div>

                    {/* UserNameID */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">ID de Usuario (URL Pública)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-muted-foreground text-sm">brosdrop.com/user/</span>
                            <input 
                                type="text" 
                                value={userNameID}
                                onChange={e => setUserNameID(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                                className="w-full bg-card border border-input rounded-xl pl-[165px] pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="tu-id-unico"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Solo letras, números, guiones y guiones bajos.</p>
                    </div>
                </div>

                {/* Public Profile Toggle */}
                 <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                    <div>
                        <h3 className="text-foreground font-medium mb-1">Perfil Público</h3>
                        <p className="text-sm text-muted-foreground">Permitir que cualquiera vea tus archivos públicos en tu URL personalizada.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={isPublicProfile}
                            onChange={e => setIsPublicProfile(e.target.checked)}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </div>
    )
}
