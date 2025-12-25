
import { notFound, redirect } from "next/navigation"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Link from "next/link"
import { CheckCircle2, XCircle } from "lucide-react"

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token || typeof token !== "string") {
      return (
        <div className="flex h-screen flex-col items-center justify-center p-4">
           <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-zinc-900/50 p-8 backdrop-blur-xl text-center">
                <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
                <h1 className="text-2xl font-bold text-white mb-2">Token inválido</h1>
                <p className="text-zinc-400 mb-6">El enlace de verificación no es válido.</p>
                <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors">Volver al Dashboard</Link>
           </div>
        </div>
      )
  }

  await dbConnect()
  
  // Find user with this token
  const user = await User.findOne({ verificationToken: token })

  if (!user) {
      return (
        <div className="flex h-screen flex-col items-center justify-center p-4">
           <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-zinc-900/50 p-8 backdrop-blur-xl text-center">
                <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
                <h1 className="text-2xl font-bold text-white mb-2">Token expirado o inválido</h1>
                <p className="text-zinc-400 mb-6">No pudimos verificar tu correo electrónico.</p>
                <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors">Volver al Dashboard</Link>
           </div>
        </div>
      )
  }

  // Verify user
  user.emailVerified = new Date()
  user.verificationToken = undefined // Clear token
  await user.save()

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Confetti or background effect could go here */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[100px] -z-10 opacity-50 pointer-events-none" />

       <div className="w-full max-w-md rounded-3xl border border-green-500/20 bg-zinc-900/50 p-8 backdrop-blur-xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 ring-1 ring-green-500/20">
                <CheckCircle2 className="h-10 w-10" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">¡Correo Verificado!</h1>
            <p className="text-zinc-400 mb-6">Tu cuenta ha sido verificada correctamente. Ya puedes disfrutar de todas las funciones.</p>
            
            <Link 
                href="/dashboard" 
                className="inline-flex w-full items-center justify-center rounded-xl bg-green-600 py-3 font-bold text-white shadow-lg shadow-green-500/20 hover:bg-green-500 transition-all hover:scale-[1.02]"
            >
                Ir a mis archivos
            </Link>
       </div>
    </div>
  )
}
