
"use client"

import Link from "next/link"
import { UploadCloud, Github, Twitter } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()

  if (pathname?.startsWith("/dashboard")) return null

  return (
    <footer className="border-t border-white/10 bg-black/40 backdrop-blur-xl mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="https://github.com/broslunas" className="text-gray-400 hover:text-gray-300">
            <span className="sr-only">GitHub</span>
            <Github className="h-6 w-6" aria-hidden="true" />
          </Link>
          <Link href="#" className="text-gray-400 hover:text-gray-300">
            <span className="sr-only">Twitter</span>
            <Twitter className="h-6 w-6" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-400">
            &copy; {new Date().getFullYear()} BrosDrop por <Link href="https://broslunas.com" className="hover:text-primary transition-colors">Broslunas</Link>. Todos los derechos reservados.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Producto</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/features" className="text-sm leading-6 text-gray-400 hover:text-white">
                        Características
                    </Link>
                  </li>
                  <li>
                    <Link href="/help" className="text-sm leading-6 text-gray-400 hover:text-white">
                        Centro de Ayuda
                    </Link>
                  </li>
                </ul>
            </div>
            <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/privacy" className="text-sm leading-6 text-gray-400 hover:text-white">
                        Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm leading-6 text-gray-400 hover:text-white">
                        Términos
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-sm leading-6 text-gray-400 hover:text-white">
                        Política de Cookies
                    </Link>
                  </li>
                  <li>
                    <Link href="/gdpr" className="text-sm leading-6 text-gray-400 hover:text-white">
                        GDPR
                    </Link>
                  </li>
                </ul>
            </div>
            <div>
                 <Link href="/" className="flex items-center gap-2 group mb-4">
                    <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <UploadCloud className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        BrosDrop
                    </span>
                </Link>
                <p className="text-sm text-gray-400">
                    Servicio premium de intercambio de archivos diseñado para velocidad, seguridad y simplicidad.
                </p>
            </div>
        </div>
      </div>
    </footer>
  )
}
