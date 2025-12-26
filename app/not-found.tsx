
import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="grid h-screen place-content-center bg-background px-4">
        <div className="text-center">
            <h1 className="text-9xl font-black text-zinc-800">404</h1>

            <p className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            ¡Oh, oh!
            </p>

            <p className="mt-4 text-gray-400">
            No podemos encontrar esa página.
            </p>

            <Link
            href="/"
            className="mt-6 inline-block rounded bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring transition-colors"
            >
            Volver al Inicio
            </Link>
        </div>
    </div>
  )
}
