"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { LogIn, LogOut, UploadCloud, User, LayoutDashboard } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()

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

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400 hidden sm:flex">
                {session?.user?.image ? (
                   <Image 
                     src={session.user.image} 
                     alt={session.user.name || "User"} 
                     width={32}
                     height={32}
                     className="h-8 w-8 rounded-full ring-2 ring-white/10"
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
                 <span className="hidden sm:inline">Panel</span>
              </Link>
            </div>
          ) : (
             <>
                 <Link href="/login" className="hidden sm:block text-sm font-medium text-white hover:text-zinc-300 transition-colors" prefetch={true}>
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
      </div>
    </header>
  )
}
