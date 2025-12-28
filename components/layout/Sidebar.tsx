"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useSidebar } from "./SidebarContext"
import { 
  LayoutDashboard, 
  UploadCloud, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  PieChart,
  ShieldAlert
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { isMobileOpen, closeMobileSidebar } = useSidebar()

  const navItems = [
    { name: "Mis Archivos", href: "/dashboard", icon: LayoutDashboard },
    { name: "Subir Archivo", href: "/dashboard/upload", icon: UploadCloud },
    { name: "Límites", href: "/dashboard/limits", icon: PieChart },
    { name: "Configuración", href: "/dashboard/settings", icon: Settings },
  ]

  const { data: session } = useSession()
  if (session?.user?.role === 'admin') {
      navItems.push({ name: "Admin", href: "/dashboard/admin", icon: ShieldAlert })
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSidebar}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        className={`
            fixed md:relative z-50 h-screen flex-col border-r border-white/5 bg-zinc-900/95 md:bg-zinc-900/50 backdrop-blur-xl transition-all duration-300
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ width: isCollapsed ? 80 : 240 }}
        initial={false}
      >
       <div className="flex h-16 items-center justify-between px-4 mt-2">
         <AnimatePresence>
            {!isCollapsed && (
                <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 whitespace-nowrap"
                >
                    BrosDrop
                </motion.span>
            )}
         </AnimatePresence>
         
         {/* Desktop Collapse Trigger */}
         <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
         >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
         </button>

         {/* Mobile Close Trigger */}
         <button 
            onClick={closeMobileSidebar}
            className="md:hidden rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
         >
            <ChevronLeft className="h-5 w-5" />
         </button>
       </div>

       <nav className="flex-1 space-y-2 p-2 mt-4">
          {navItems.map((item) => {
             const isActive = pathname === item.href
             return (
                <Link 
                    key={item.href} 
                    href={item.href}
                    prefetch={true}
                    onClick={() => closeMobileSidebar()}
                    className={`
                        flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                        ${isActive 
                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                            : "text-zinc-400 hover:bg-white/5 hover:text-white"
                        }
                    `}
                >
                    <item.icon className="h-5 w-5 min-h-[20px] min-w-[20px]" />
                    {!isCollapsed && (
                        <motion.span 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="whitespace-nowrap"
                        >
                            {item.name}
                        </motion.span>
                    )}
                </Link>
             )
          })}
       </nav>

    </motion.aside>
    </>
  )
}
