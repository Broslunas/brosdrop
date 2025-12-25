"use client"

import { useSession, signOut } from "next-auth/react"
import { LogOut, User, Bell, ChevronLeft, Moon } from "lucide-react"

export default function DashboardHeader() {
  const { data: session } = useSession()

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-zinc-900/50 px-6 backdrop-blur-xl">
      {/* Left side - Breadcrumbs or Back (Optional, keeping it simple or matching image) */}
      <div className="flex items-center gap-4">
          <button className="text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft className="h-5 w-5" />
          </button>
      </div>

      {/* Right side - User Profile & Actions */}
      <div className="flex items-center gap-6">
        {/* Icons */}
        <div className="flex items-center gap-4 border-r border-white/5 pr-6">
             <button className="text-zinc-400 hover:text-white transition-colors">
                <Moon className="h-5 w-5" />
             </button>
             <button className="text-zinc-400 hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
             </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4">
           <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">{session?.user?.name || "Usuario"}</p>
              <p className="text-xs text-zinc-500">{session?.user?.email || ""}</p>
           </div>
           
           {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                    src={session.user.image} 
                    alt="Profile" 
                    className="h-10 w-10 rounded-full border border-white/10" 
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
