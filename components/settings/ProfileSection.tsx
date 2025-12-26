"use client"

import { User, Camera } from "lucide-react"

interface ProfileSectionProps {
    name: string
    image: string
    onNameChange: (val: string) => void
    onImageChange: (val: string) => void
}

export default function ProfileSection({ name, image, onNameChange, onImageChange }: ProfileSectionProps) {
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => onImageChange(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5" /> Perfil
            </h2>

            {/* Profile Picture */}
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 group-hover:border-primary transition-colors">
                        {image ? (
                            <img src={image} alt="Profile" className="w-full h-full object-cover" />
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
                    onChange={e => onNameChange(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Tu nombre"
                />
            </div>
        </div>
    )
}
