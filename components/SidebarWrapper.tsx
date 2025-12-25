"use client"
import { usePathname } from "next/navigation"
import Sidebar from "./Sidebar"

export default function SidebarWrapper() {
    const pathname = usePathname()
    
    // Hide sidebar on cleanup page
    if (pathname === '/dashboard/cleanup') {
        return null
    }

    return <Sidebar />
}
