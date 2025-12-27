"use client"

import Link from "next/link"
import Image from "next/image"
import { Github, Twitter } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()

  if (pathname?.startsWith("/dashboard")) return null

  return (
    <footer className="border-t border-white/5 bg-[#0a0a0c] text-zinc-400">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            {/* Branding Column */}
            <div className="col-span-2 lg:col-span-2 pr-8">
                <Link href="/" className="flex items-center gap-2 mb-6" prefetch={true}>
                    <Image src="https://cdn.broslunas.com/favicon.png" alt="Broslunas" width={32} height={32} className="h-8 w-8" />
                    <span className="text-xl font-bold text-white">BrosDrop</span>
                </Link>
                <p className="text-sm leading-6 mb-6 max-w-sm">
                    BrosDrop es un servicio de almacenamiento de archivos en la nube con enlaces de descarga instantáneos y encriptados.
                </p>
                <div className="flex gap-4">
                     <Link href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5"/></Link>
                     <Link href="https://github.com/broslunas" className="hover:text-white transition-colors"><Github className="w-5 h-5"/></Link>
                </div>
            </div>

            {/* Product Column */}
            <div>
                <h3 className="text-sm font-semibold text-white mb-6">Producto</h3>
                <ul className="space-y-4 text-sm">
                    <li><Link href="/features" className="hover:text-white transition-colors" prefetch={true}>Características</Link></li>
                    <li><Link href="/docs/api" className="hover:text-white transition-colors" prefetch={true}>API</Link></li>
                </ul>
            </div>

            {/* Support Column */}
            <div>
                <h3 className="text-sm font-semibold text-white mb-6">Soporte</h3>
                <ul className="space-y-4 text-sm">
                    <li><Link href="/help" className="hover:text-white transition-colors" prefetch={true}>Ayuda</Link></li>
                    <li><Link href="https://broslunas.com/contact" className="hover:text-white transition-colors">Contacto</Link></li>
                    <li><Link href="/status" className="hover:text-white transition-colors" prefetch={true}>Estado del Servicio</Link></li>
                </ul>
            </div>

            {/* Legal Column */}
            <div>
                 <h3 className="text-sm font-semibold text-white mb-6">Legal</h3>
                <ul className="space-y-4 text-sm">
                    <li><Link href="/terms" className="hover:text-white transition-colors" prefetch={true}>Términos de Servicio</Link></li>
                    <li><Link href="/privacy" className="hover:text-white transition-colors" prefetch={true}>Política de Privacidad</Link></li>
                    <li><Link href="/cookies" className="hover:text-white transition-colors" prefetch={true}>Política de Cookies</Link></li>
                    <li><Link href="/gdpr" className="hover:text-white transition-colors" prefetch={true}>GDPR</Link></li>
                </ul>
            </div>
        </div>
        
        <div className="mt-16 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs leading-5">
                &copy; {new Date().getFullYear()} BrosDrop. Todos los derechos reservados.
            </p>
            
            <p className="text-xs leading-5 text-zinc-500">
                Creado por <a href="https://broslunas.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-medium">Broslunas</a>
            </p>

            <div className="flex gap-6 text-xs">
                <Link href="/terms" className="hover:text-white transition-colors" prefetch={true}>Términos</Link>
                <Link href="/privacy" className="hover:text-white transition-colors" prefetch={true}>Privacidad</Link>
                <Link href="/cookies" className="hover:text-white transition-colors" prefetch={true}>Cookies</Link>
            </div>
        </div>
      </div>
    </footer>
  )
}
