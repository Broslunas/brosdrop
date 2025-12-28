"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { LogOut, User, Bell, ChevronLeft, Moon, Crown, Zap, Check, Menu } from "lucide-react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { useModal } from "@/components/ModalProvider"
import { useSidebar } from "./SidebarContext"

export default function DashboardHeader() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toggleMobileSidebar } = useSidebar()
  const { showModal } = useModal()
  
  const [avatar, setAvatar] = useState<string | null | undefined>(session?.user?.image)
  const plan = (session?.user as any)?.plan || 'free'

  useEffect(() => {
    // ... existing useEffect for payment success
    if (searchParams?.get('payment') === 'success') {
         const planName = searchParams.get('plan') || 'plus'
         const isPro = planName.toLowerCase().includes('pro')

         showModal({
             title: `¡Bienvenido al Plan ${isPro ? 'Pro' : 'Plus'}!`,
             message: (
                <div className="space-y-4 mt-2">
                    <p className="text-zinc-300">Gracias por actualizar. Ahora tienes acceso a:</p>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-zinc-200">
                             <div className="p-1 rounded bg-green-500/10 text-green-400"><Check className="w-3 h-3" /></div>
                             {isPro ? "5 GB por archivo" : "500 MB por archivo"}
                        </li>
                        <li className="flex items-center gap-2 text-sm text-zinc-200">
                             <div className="p-1 rounded bg-green-500/10 text-green-400"><Check className="w-3 h-3" /></div>
                             {isPro ? "Caducidad de 1 año" : "Caducidad de 30 días"}
                        </li>
                         <li className="flex items-center gap-2 text-sm text-zinc-200">
                             <div className="p-1 rounded bg-green-500/10 text-green-400"><Check className="w-3 h-3" /></div>
                             {isPro ? "QR con Logo y Colores" : "QR con Colores personalizados"}
                        </li>
                        {isPro && (
                             <li className="flex items-center gap-2 text-sm text-zinc-200">
                                 <div className="p-1 rounded bg-purple-500/10 text-purple-400"><Crown className="w-3 h-3" /></div>
                                 Branding Personalizado (Logo y Fondo)
                             </li>
                        )}
                        <li className="flex items-center gap-2 text-sm text-zinc-200">
                             <div className="p-1 rounded bg-green-500/10 text-green-400"><Check className="w-3 h-3" /></div>
                             Archivos protegidos con contraseña
                        </li>
                    </ul>
                    <div className="pt-4 text-center">
                         <p className="text-xs text-zinc-500">¡Disfruta de la experiencia completa!</p>
                    </div>
                </div>
             ),
             type: "success",
             confirmText: "¡Empezar a compartir!"
         })
         
         // Clean URL
         router.replace('/dashboard')
    }
  }, [searchParams, showModal, router])

  useEffect(() => {
    if (session?.user?.email) {
        fetch('/api/user')
            .then(res => res.json())
            .then(data => {
                if (data && data.image) {
                    setAvatar(data.image)
                }
            })
            .catch(err => console.error("Failed to load avatar", err))
    }
  }, [session?.user?.email])

  // Update avatar if session changes (e.g. initial load) and strict equality check to avoid overwrite if we have better data
  useEffect(() => {
     if (session?.user?.image && !avatar) {
         setAvatar(session.user.image)
     }
  }, [session?.user?.image, avatar])

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-zinc-900/50 px-6 backdrop-blur-xl">
      {/* Left side - Mobile Toggle & Title */}
      <div className="flex items-center gap-4">
          <button 
            onClick={toggleMobileSidebar}
            className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <span className="md:hidden text-lg font-bold text-white">BrosDrop</span>
      </div>

      {/* Right side - User Profile & Actions */}
      <div className="flex items-center gap-6">
        

        {/* User Info */}
        <div className="flex items-center gap-4">
           <div className="hidden text-right sm:block">
              <div className="flex items-center justify-end gap-2">
                  <p className="text-sm font-medium text-white">{session?.user?.name || "Usuario"}</p>
                  {plan === 'pro' && (
                      <span className="flex items-center gap-1 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          Pro <Crown className="w-3 h-3" />
                      </span>
                  )}
                  {plan === 'plus' && (
                      <span className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          Plus <Zap className="w-3 h-3" />
                      </span>
                  )}
                  {plan === 'free' && (
                      <span className="bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-white/5">
                          Free
                      </span>
                  )}
              </div>
              <p className="text-xs text-zinc-500">{session?.user?.email || ""}</p>
           </div>
           
           {avatar ? (
                <Image 
                    src={avatar} 
                    alt="Profile" 
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full border border-white/10 object-cover"
                    referrerPolicy="no-referrer"
                />
           ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                    <User className="h-5 w-5" />
                </div>
           )}

           <button 
                onClick={() => signOut()}
                className="ml-2 rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-red-400 transition-colors"
                title="Cerrar Sesión"
           >
               <LogOut className="h-5 w-5" />
           </button>
        </div>
      </div>
    </header>
  )
}
