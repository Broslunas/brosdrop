"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { User, Camera, Save, Loader2 } from "lucide-react"
import Image from "next/image"
import { useModal } from "@/components/ModalProvider"

interface ProfileSectionProps {
    initialName: string
    initialImage: string
}

export default function ProfileSection({ initialName, initialImage }: ProfileSectionProps) {
    const { update } = useSession()
    const { showModal } = useModal()
    const [name, setName] = useState(initialName)
    const [image, setImage] = useState(initialImage)
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
                body: JSON.stringify({ name, image })
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
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5" /> Perfil
                </h2>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 hover:border-zinc-600"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                </button>
            </div>

            <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 group-hover:border-primary transition-colors">
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
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Tu nombre"
                    />
                </div>
            </div>
        </div>
    )
}
