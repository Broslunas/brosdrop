
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import User from "@/models/User"
import { PLAN_LIMITS, formatBytes } from "@/lib/plans"
import { Check, Crown, HardDrive, File, Lock, Clock, Zap, AlertTriangle, Link as LinkIcon } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function LimitsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await dbConnect()

  const user = await User.findById(session.user.id).lean() as any
  const planName = (user?.plan || 'free') as keyof typeof PLAN_LIMITS
  const plan = PLAN_LIMITS[planName] || PLAN_LIMITS.free

  // Fetch Usage Data
  const activeFilesCount = await Transfer.countDocuments({ senderId: session.user.id })
  const activeProtectedCount = await Transfer.countDocuments({ senderId: session.user.id, passwordHash: { $exists: true } })
  const activeLinksCount = await Transfer.countDocuments({ senderId: session.user.id, customLink: { $exists: true, $ne: null } })
  
  // Calculate Total Storage Used
  const transfers = await Transfer.find({ senderId: session.user.id }).select('size').lean()
  const totalStorageBytes = transfers.reduce((acc, curr: any) => acc + (curr.size || 0), 0)

  // Helpers for percentages
  // Use a sensible max for progress bars if Infinity (e.g. 100 for visual)
  const calcPercent = (used: number, max: number) => {
      if (max === Infinity) return 0 // Don't show progress bar for infinity or show "Unlim"
      if (max === 0) return 100
      return Math.min(100, Math.round((used / max) * 100))
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Límites y Consumo</h1>
        <p className="text-zinc-400">Consulta el estado de tu cuenta y el uso de tus recursos.</p>
      </div>

      {/* Plan Summary Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 mb-8 relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                 <div className="flex items-center gap-3 mb-2">
                     <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Plan Actual</span>
                     {planName !== 'free' && <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-bold border border-primary/20">ACTIVO</span>}
                 </div>
                 <h2 className="text-4xl font-black text-white capitalize flex items-center gap-2">
                     {plan.name} {planName === 'plus' || planName === 'pro' ? <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500/20" /> : null}
                 </h2>
                 <p className="text-zinc-400 mt-2 max-w-xl">
                    {planName === 'free' 
                        ? "Estás en el plan básico. Actualiza para desbloquear más poder." 
                        : "Tienes acceso a características premium. ¡Gracias por tu apoyo!"}
                 </p>
             </div>
             
             {planName === 'free' && (
                 <Link href="/pricing" className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                     <Zap className="w-4 h-4 fill-black" />
                     Mejorar Plan
                 </Link>
             )}
         </div>

         {/* Decoration */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Active Files */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                      <File className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white">Archivos Activos</h3>
              </div>
              
              <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="text-zinc-400 font-medium">Usados</span>
                      <span className="text-white font-bold">{activeFilesCount} <span className="text-zinc-500">/ {plan.maxFiles === Infinity ? '∞' : plan.maxFiles}</span></span>
                  </div>
                  {plan.maxFiles !== Infinity && (
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                              className={`h-full rounded-full transition-all duration-500 ${activeFilesCount >= plan.maxFiles ? 'bg-red-500' : 'bg-blue-500'}`} 
                              style={{ width: `${calcPercent(activeFilesCount, plan.maxFiles)}%` }}
                          />
                      </div>
                  )}
                  {activeFilesCount >= (plan.maxFiles as number) && plan.maxFiles !== Infinity && (
                      <p className="text-xs text-red-400 flex items-center gap-1 mt-2">
                          <AlertTriangle className="w-3 h-3" /> Límite alcanzado. Elimina archivos.
                      </p>
                  )}
              </div>
          </div>

          {/* Protected Files */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                      <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white">Archivos Protegidos</h3>
              </div>
              
              <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="text-zinc-400 font-medium">Usados</span>
                      <span className="text-white font-bold">{activeProtectedCount} <span className="text-zinc-500">/ {plan.maxPwd === Infinity ? '∞' : plan.maxPwd}</span></span>
                  </div>
                  {plan.maxPwd !== Infinity && (
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                              className={`h-full rounded-full transition-all duration-500 ${activeProtectedCount >= plan.maxPwd ? 'bg-red-500' : 'bg-yellow-500'}`} 
                              style={{ width: `${calcPercent(activeProtectedCount, plan.maxPwd)}%` }}
                          />
                      </div>
                  )}
                  {activeProtectedCount >= (plan.maxPwd as number) && plan.maxPwd !== Infinity && (
                      <p className="text-xs text-orange-400 flex items-center gap-1 mt-2">
                          <AlertTriangle className="w-3 h-3" /> Máximo de seguridad alcanzado.
                      </p>
                  )}
              </div>
          </div>

          {/* Custom Links */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                      <LinkIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white">Enlaces Personalizados</h3>
              </div>
              
              <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="text-zinc-400 font-medium">Usados</span>
                      <span className="text-white font-bold">{activeLinksCount} <span className="text-zinc-500">/ {plan.maxCustomLinks || 0}</span></span>
                  </div>
                  {(plan.maxCustomLinks || 0) > 0 && (
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                              className={`h-full rounded-full transition-all duration-500 ${activeLinksCount >= (plan.maxCustomLinks || 0) ? 'bg-red-500' : 'bg-pink-500'}`} 
                              style={{ width: `${calcPercent(activeLinksCount, plan.maxCustomLinks || 1)}%` }}
                          />
                      </div>
                  )}
                  {activeLinksCount >= (plan.maxCustomLinks || 0) && (
                      <p className="text-xs text-pink-400 flex items-center gap-1 mt-2">
                          <AlertTriangle className="w-3 h-3" /> Límite de enlaces alcanzado.
                      </p>
                  )}
              </div>
          </div>

          {/* Total Storage */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                      <HardDrive className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white">Almacenamiento Total</h3>
              </div>
              
              <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="text-zinc-400 font-medium">Usados</span>
                      <span className="text-white font-bold">{formatBytes(totalStorageBytes)} <span className="text-zinc-500">/ {plan.maxTotalStorage ? formatBytes(plan.maxTotalStorage) : '∞'}</span></span>
                  </div>
                   {plan.maxTotalStorage && (
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                              className={`h-full rounded-full transition-all duration-500 ${totalStorageBytes >= plan.maxTotalStorage ? 'bg-red-500' : 'bg-purple-500'}`} 
                              style={{ width: `${calcPercent(totalStorageBytes, plan.maxTotalStorage)}%` }}
                          />
                      </div>
                  )}
                  <p className="text-xs text-zinc-500 mt-1">
                      Espacio total ocupado por tus archivos activos.
                  </p>
                  {plan.maxTotalStorage && totalStorageBytes >= plan.maxTotalStorage && (
                      <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3" /> Almacenamiento lleno.
                      </p>
                  )}
              </div>
          </div>

          {/* Max File Size */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                      <div className="relative">
                        <File className="w-5 h-5" />
                        <span className="absolute -bottom-1 -right-1 bg-green-900 rounded-full w-3 h-3 flex items-center justify-center text-[8px] font-bold">+</span>
                      </div>
                  </div>
                  <h3 className="font-semibold text-white">Tamaño por Archivo</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                 {formatBytes(plan.maxBytes)}
              </div>
              <p className="text-xs text-zinc-500">Tamaño máximo para una sola subida.</p>
          </div>

           {/* Expiration */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
                      <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white">Tiempo de Vida</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                 {plan.maxDays} Días
              </div>
              <p className="text-xs text-zinc-500">Tiempo antes de que un archivo expire automáticamente.</p>
          </div>

      </div>

      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-between">
          <div>
              <h4 className="font-bold text-white text-lg">¿Necesitas más espacio?</h4>
              <p className="text-zinc-400 text-sm mt-1">Nuestros planes Pro ofrecen almacenamiento ilimitado y características avanzadas.</p>
          </div>
          <Link href="/pricing" className="text-sm font-bold text-white underline hover:text-primary transition-colors">
              Ver Planes &rarr;
          </Link>
      </div>

    </div>
  )
}
