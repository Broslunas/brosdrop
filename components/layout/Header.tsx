"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { LogIn, LogOut, UploadCloud, User, LayoutDashboard, Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (pathname?.startsWith("/dashboard")) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/5 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group" prefetch={true}>
           <Image 
             src="https://cdn.broslunas.com/favicon.png" 
             alt="Broslunas" 
             width={32}
             height={32}
             className="h-8 w-8"
             priority
           />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            BrosDrop
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" prefetch={true}>Características</Link>
            <Link href="/pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" prefetch={true}>Precios</Link>
            <Link href="/docs/api" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" prefetch={true}>API</Link>
            <Link href="/help" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" prefetch={true}>Ayuda</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                {session?.user?.image ? (
                   <Image 
                     src={session.user.image} 
                     alt={session.user.name || "User"} 
                     width={32}
                     height={32}
                     className="h-8 w-8 rounded-full ring-2 ring-white/10"
                     referrerPolicy="no-referrer"
                   />
                ) : (
                   <User className="h-5 w-5" />
                )}
                <span className="hidden lg:inline">{session?.user?.name}</span>
              </div>
              
              <Link
                href="/dashboard"
                className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 flex items-center gap-2 border border-white/5"
                prefetch={true}
              >
                 <LayoutDashboard className="h-4 w-4" />
                 <span>Panel</span>
              </Link>
            </div>
          ) : (
             <>
                 <Link href="/login" className="text-sm font-medium text-white hover:text-zinc-300 transition-colors" prefetch={true}>
                    Iniciar Sesión
                 </Link>
                <button
                onClick={() => signIn()}
                className="rounded-lg bg-white text-zinc-950 px-4 py-2 text-sm font-bold transition-all hover:bg-zinc-200 flex items-center gap-2"
                >
                Comenzar Gratis
                </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-zinc-400 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-zinc-950/95 backdrop-blur-xl border-t border-white/5 p-4 flex flex-col gap-4 md:hidden overflow-y-auto">
            <nav className="flex flex-col gap-2">
                <Link href="/features" className="p-4 rounded-xl bg-white/5 text-lg font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>Características</Link>
                <Link href="/pricing" className="p-4 rounded-xl bg-white/5 text-lg font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>Precios</Link>
                <Link href="/docs/api" className="p-4 rounded-xl bg-white/5 text-lg font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>API</Link>
                <Link href="/help" className="p-4 rounded-xl bg-white/5 text-lg font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>Ayuda</Link>
            </nav>
            
            <div className="mt-auto pb-8 space-y-4">
               {session ? (
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                      {session?.user?.image ? (
                        <Image src={session.user.image} alt={session.user.name || "User"} width={40} height={40} className="rounded-full ring-2 ring-white/10" />
                      ) : <User className="h-10 w-10 text-zinc-400" />}
                      <div>
                        <div className="font-bold text-white">{session.user.name}</div>
                        <div className="text-sm text-zinc-500">{session.user.email}</div>
                      </div>
                    </div>
                    <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-indigo-600 text-white font-bold" onClick={() => setIsMobileMenuOpen(false)}>
                       <LayoutDashboard className="h-5 w-5" /> Ir al Panel
                    </Link>
                 </div>
               ) : (
                 <div className="flex flex-col gap-3">
                    <Link href="/login" className="w-full p-4 rounded-xl bg-white/5 text-center font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>Iniciar Sesión</Link>
                    <button onClick={() => { signIn(); setIsMobileMenuOpen(false); }} className="w-full p-4 rounded-xl bg-white text-center font-bold text-zinc-950">Comenzar Gratis</button>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
