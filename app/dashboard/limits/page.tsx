
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import User from "@/models/User"
import { PLAN_LIMITS, formatBytes } from "@/lib/plans"
import { Check, Crown, HardDrive, File, Lock, Clock, Zap, AlertTriangle, Link as LinkIcon, Server, UploadCloud } from "lucide-react"
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
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Límites y Consumo</h1>
        <p className="text-muted-foreground">Consulta el estado de tu cuenta y el uso de tus recursos.</p>
      </div>

      {/* Plan Summary Card */}
      <div className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden border border-border">
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                 <div className="flex items-center gap-3 mb-2">
                     <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Plan Actual</span>
                     {planName !== 'free' && <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-bold border border-primary/20">ACTIVO</span>}
                 </div>
                 <h2 className="text-4xl font-black text-foreground capitalize flex items-center gap-2">
                     {plan.name} {planName === 'plus' || planName === 'pro' ? <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500/20" /> : null}
                 </h2>
                 <p className="text-muted-foreground mt-2 max-w-xl">
                    {planName === 'free' 
                        ? "Estás en el plan básico. Actualiza para desbloquear más poder." 
                        : "Tienes acceso a características premium. ¡Gracias por tu apoyo!"}
                 </p>
             </div>
             
             {planName === 'free' && (
                 <Link href="/pricing" className="gradient-primary text-white hover:opacity-90 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover-lift flex items-center gap-2">
                     <Zap className="w-4 h-4 fill-white" />
                     Mejorar Plan
                 </Link>
             )}
         </div>

         {/* Decoration */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 dark:bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Active Files */}
          <div className="bg-card border border-border rounded-2xl p-6 hover-lift transition-all">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                      <File className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">Archivos Activos</h3>
              </div>
              
              <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Usados</span>
                      <span className="text-card-foreground font-bold">{activeFilesCount} <span className="text-muted-foreground">/ {plan.maxFiles === Infinity ? '∞' : plan.maxFiles}</span></span>
                  </div>
                  {plan.maxFiles !== Infinity && (
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                              className={`h-full rounded-full transition-all duration-500 ${activeFilesCount >= plan.maxFiles ? 'bg-destructive' : 'bg-blue-500'}`} 
                              style={{ width: `${calcPercent(activeFilesCount, plan.maxFiles)}%` }}
                          />
                      </div>
                  )}
                  {activeFilesCount >= (plan.maxFiles as number) && plan.maxFiles !== Infinity && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-2">
                          <AlertTriangle className="w-3 h-3" /> Límite alcanzado. Elimina archivos.
                      </p>
                  )}
              </div>
          </div>

          {/* Protected Files */}
          <div className="bg-card border border-border rounded-2xl p-6 hover-lift transition-all">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-600 dark:text-yellow-400">
                      <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">Archivos Protegidos</h3>
              </div>
              
              <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Usados</span>
                      <span className="text-card-foreground font-bold">{activeProtectedCount} <span className="text-muted-foreground">/ {plan.maxPwd === Infinity ? '∞' : plan.maxPwd}</span></span>
                  </div>
                  {plan.maxPwd !== Infinity && (
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                              className={`h-full rounded-full transition-all duration-500 ${activeProtectedCount >= plan.maxPwd ? 'bg-destructive' : 'bg-yellow-500'}`} 
                              style={{ width: `${calcPercent(activeProtectedCount, plan.maxPwd)}%` }}
                          />
                      </div>
                  )}
                  {activeProtectedCount >= (plan.maxPwd as number) && plan.maxPwd !== Infinity && (
                      <p className="text-xs text-warning flex items-center gap-1 mt-2">
                          <AlertTriangle className="w-3 h-3" /> Máximo de seguridad alcanzado.
                      </p>
                  )}
              </div>
          </div>

          {/* Custom Links */}
          <div className="bg-card border border-border rounded-2xl p-6 hover-lift transition-all">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-600 dark:text-pink-400">
                      <LinkIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">Enlaces Personalizados</h3>
              </div>
              
              <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Usados</span>
                      <span className="text-card-foreground font-bold">{activeLinksCount} <span className="text-muted-foreground">/ {plan.maxCustomLinks || 0}</span></span>
                  </div>
                  {(plan.maxCustomLinks || 0) > 0 && (
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                              className={`h-full rounded-full transition-all duration-500 ${activeLinksCount >= (plan.maxCustomLinks || 0) ? 'bg-destructive' : 'bg-pink-500'}`} 
                              style={{ width: `${calcPercent(activeLinksCount, plan.maxCustomLinks || 1)}%` }}
                          />
                      </div>
                  )}
                  {activeLinksCount >= (plan.maxCustomLinks || 0) && (
                      <p className="text-xs text-pink-600 dark:text-pink-400 flex items-center gap-1 mt-2">
                          <AlertTriangle className="w-3 h-3" /> Límite de enlaces alcanzado.
                      </p>
                  )}
              </div>
          </div>

          {/* Total Storage */}
          <div className="bg-card border border-border rounded-2xl p-6 hover-lift transition-all">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                      <HardDrive className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">Almacenamiento Total</h3>
              </div>
              
              <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Usados</span>
                      <span className="text-card-foreground font-bold">{formatBytes(totalStorageBytes)} <span className="text-muted-foreground">/ {plan.maxTotalStorage ? formatBytes(plan.maxTotalStorage) : '∞'}</span></span>
                  </div>
                   {plan.maxTotalStorage && (
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                              className={`h-full rounded-full transition-all duration-500 ${totalStorageBytes >= plan.maxTotalStorage ? 'bg-destructive' : 'bg-purple-500'}`} 
                              style={{ width: `${calcPercent(totalStorageBytes, plan.maxTotalStorage)}%` }}
                          />
                      </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                      Espacio total ocupado por tus archivos activos.
                  </p>
                  {plan.maxTotalStorage && totalStorageBytes >= plan.maxTotalStorage && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3" /> Almacenamiento lleno.
                      </p>
                  )}
              </div>
          </div>
          
          {/* API Usage */}
          <div className="bg-card border border-border rounded-2xl p-6 hover-lift transition-all">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                      <Server className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">Uso de API (1h)</h3>
              </div>
              
              <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Peticiones</span>
                      <span className="text-card-foreground font-bold">
                        {(() => {
                            const now = Date.now()
                            const windowStart = user.apiUsage?.windowStart ? new Date(user.apiUsage.windowStart).getTime() : now
                            const isExpired = now - windowStart > 3600 * 1000
                            const count = isExpired ? 0 : (user.apiUsage?.requestsCount || 0)
                            return count
                        })()} <span className="text-muted-foreground">/ {plan.apiRequestsPerHour || 0}</span>
                      </span>
                  </div>
                  {(plan.apiRequestsPerHour || 0) > 0 ? (
                    <>
                       <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                              className={`h-full rounded-full transition-all duration-500 bg-indigo-500`} 
                              style={{ 
                                  width: `${(() => {
                                      const now = Date.now()
                                      const windowStart = user.apiUsage?.windowStart ? new Date(user.apiUsage.windowStart).getTime() : now
                                      const isExpired = now - windowStart > 3600 * 1000
                                      const count = isExpired ? 0 : (user.apiUsage?.requestsCount || 0)
                                      return calcPercent(count, plan.apiRequestsPerHour || 1)
                                  })()}%` 
                              }}
                          />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                          Límite de peticiones por hora.
                      </p>
                    </>
                  ) : (
                      <p className="text-xs text-warning mt-1">
                          Tu plan no tiene acceso a la API.
                      </p>
                  )}
              </div>
          </div>



          {/* API Uploads */}
          <div className="bg-card border border-border rounded-2xl p-6 hover-lift transition-all">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-600 dark:text-cyan-400">
                      <UploadCloud className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">Subidas API (24h)</h3>
              </div>
              
              <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Subidas</span>
                      <span className="text-card-foreground font-bold">
                        {(() => {
                            const now = Date.now()
                            const windowStart = user.apiUsage?.uploadsWindowStart ? new Date(user.apiUsage.uploadsWindowStart).getTime() : now
                            const isExpired = now - windowStart > 24 * 3600 * 1000
                            const count = isExpired ? 0 : (user.apiUsage?.uploadsCount || 0)
                            return count
                        })()} <span className="text-muted-foreground">/ {plan.apiUploadsPerDay || 0}</span>
                      </span>
                  </div>
                  {(plan.apiUploadsPerDay || 0) > 0 ? (
                    <>
                       <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                              className={`h-full rounded-full transition-all duration-500 bg-cyan-500`} 
                              style={{ 
                                  width: `${(() => {
                                      const now = Date.now()
                                      const windowStart = user.apiUsage?.uploadsWindowStart ? new Date(user.apiUsage.uploadsWindowStart).getTime() : now
                                      const isExpired = now - windowStart > 24 * 3600 * 1000
                                      const count = isExpired ? 0 : (user.apiUsage?.uploadsCount || 0)
                                      return calcPercent(count, plan.apiUploadsPerDay || 1)
                                  })()}%` 
                              }}
                          />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                          Límite de subidas diarias por API.
                      </p>
                    </>
                  ) : (
                      <p className="text-xs text-warning mt-1">
                          Tu plan no tiene acceso a subir por API.
                      </p>
                  )}
              </div>
          </div>
          
          {/* Max File Size */}
          <div className="bg-card border border-border rounded-2xl p-6 hover-lift transition-all">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-green-500/10 rounded-xl text-green-600 dark:text-green-400">
                      <div className="relative">
                        <File className="w-5 h-5" />
                        <span className="absolute -bottom-1 -right-1 bg-green-600 dark:bg-green-900 rounded-full w-3 h-3 flex items-center justify-center text-[8px] font-bold text-white">+</span>
                      </div>
                  </div>
                  <h3 className="font-semibold text-card-foreground">Tamaño por Archivo</h3>
              </div>
              <div className="text-2xl font-bold text-card-foreground mb-1">
                 {formatBytes(plan.maxBytes)}
              </div>
              <p className="text-xs text-muted-foreground">Tamaño máximo para una sola subida.</p>
          </div>

           {/* Expiration */}
           <div className="bg-card border border-border rounded-2xl p-6 hover-lift transition-all">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400">
                      <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">Tiempo de Vida</h3>
              </div>
              <div className="text-2xl font-bold text-card-foreground mb-1">
                 {plan.maxDays} Días
              </div>
              <p className="text-xs text-muted-foreground">Tiempo antes de que un archivo expire automáticamente.</p>
          </div>

      </div>

      <div className="mt-8 p-6 rounded-2xl glass-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
              <h4 className="font-bold text-foreground text-lg">¿Necesitas más espacio?</h4>
              <p className="text-muted-foreground text-sm mt-1">Nuestros planes Pro ofrecen almacenamiento ilimitado y características avanzadas.</p>
          </div>
          <Link href="/pricing" className="gradient-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all hover-lift whitespace-nowrap">
              Ver Planes →
          </Link>
      </div>

    </div>
  )
}
