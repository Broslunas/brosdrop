
"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { LogIn, LogOut, UploadCloud, User, LayoutDashboard } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (pathname?.startsWith("/dashboard")) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/50 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
             <UploadCloud className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Brosdrop
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                {session?.user?.image ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img src={session.user.image} alt={session.user.name || "User"} className="h-8 w-8 rounded-full ring-2 ring-white/10" />
                ) : (
                   <User className="h-5 w-5" />
                )}
                <span className="hidden sm:inline">{session?.user?.name}</span>
              </div>
              
              <Link
                href="/dashboard"
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 flex items-center gap-2 border border-zinc-700"
              >
                 <LayoutDashboard className="h-4 w-4" />
                 <span className="hidden sm:inline">Panel</span>
              </Link>

              <button
                onClick={() => signOut()}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 flex items-center gap-2 border border-zinc-700"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_-5px_var(--primary)] flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Iniciar Sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
