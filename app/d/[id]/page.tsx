import { notFound } from "next/navigation"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3Client } from "@/lib/s3"
import DownloadManager from "@/components/layout/DownloadManager"
import { isValidObjectId } from "mongoose"

import ExpiredTransfer from "@/models/ExpiredTransfer"
import User from "@/models/User"
import { PLAN_LIMITS } from "@/lib/plans"
import Link from "next/link"
import { AlertCircle, Clock, ShieldAlert, AlertTriangle, ArrowLeft } from "lucide-react"

import { Metadata } from "next"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  await dbConnect()

  // Read-only fetch for metadata
  let transfer: any = null
  if (isValidObjectId(id)) {
    transfer = await Transfer.findById(id).select('originalName mimeType size').lean()
  }
  if (!transfer) {
    transfer = await Transfer.findOne({ customLink: id }).select('originalName mimeType size').lean()
  }

  // Check expired if not found
  if (!transfer) {
    if (isValidObjectId(id)) {
        transfer = await ExpiredTransfer.findOne({ transferId: id }).select('originalName').lean()
    }
    if (!transfer) {
         transfer = await ExpiredTransfer.findOne({ customLink: id }).select('originalName').lean()
    }
  }

  if (!transfer) {
    return {
      title: "Archivo no encontrado | BrosDrop",
      description: "El archivo que buscas no existe o ha sido eliminado."
    }
  }

  return {
    title: `${transfer.originalName} | BrosDrop`,
    description: `Descarga ${transfer.originalName} de forma segura con BrosDrop.`,
    openGraph: {
      title: `${transfer.originalName} - Descargar Archivo`,
      description: "Archivo listo para descarga en BrosDrop.",
    }
  }
}

export default async function DownloadPage({ params }: Props) {
  const { id } = await params
  
  await dbConnect()

  try {
      let transfer;
      
      // 1. Try by ID (if valid)
      if (isValidObjectId(id)) {
          transfer = await Transfer.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      } 
      
      // 2. If not found or invalid ID, try by Custom Link
      if (!transfer) {
          transfer = await Transfer.findOneAndUpdate(
              { customLink: id }, 
              { $inc: { views: 1 } }, 
              { new: true }
          )
      }

      if (!transfer) {
          // Check if it exists in the expired history
          let expiredRecord = null
          
          if (isValidObjectId(id)) {
              expiredRecord = await ExpiredTransfer.findOneAndUpdate(
                  { transferId: id }, 
                  { $inc: { views: 1 } },
                  { new: true }
              )
          }
          
          if (!expiredRecord) {
               expiredRecord = await ExpiredTransfer.findOneAndUpdate(
                  { customLink: id }, 
                  { $inc: { views: 1 } },
                  { new: true }
               )
          }
          
          if (expiredRecord) {
              return (
                <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0a0a0c] relative overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none" />
                    
                    <div className="w-full max-w-md relative z-10">
                         <div className="rounded-3xl border border-white/5 bg-zinc-900/50 p-8 backdrop-blur-xl text-center shadow-2xl">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
                                <Clock className="w-10 h-10" />
                            </div>
                            <h1 className="mb-2 text-2xl font-bold text-white">Enlace Expirado</h1>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Este archivo ya no está disponible porque ha superado su tiempo de vida o ha sido eliminado.
                            </p>
                            
                            <div className="rounded-2xl bg-white/5 p-4 border border-white/5 mb-8 text-left">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold">Archivo Original</p>
                                <p className="text-zinc-300 font-medium truncate">{expiredRecord.originalName}</p>
                            </div>
                            
                            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-zinc-300 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Ir al inicio
                            </Link>
                        </div>
                    </div>
                </div>
              )
          }
          
          return notFound()
      }

      if (new Date().toISOString() > transfer.expiresAt) {
          return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0a0a0c] relative overflow-hidden">
                 <div className="w-full max-w-md rounded-3xl border border-white/5 bg-zinc-900/50 p-12 backdrop-blur-xl text-center shadow-2xl">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                         <Clock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Transferencia Caducada</h1>
                    <p className="text-zinc-400">Este archivo ha expirado recientemente y ya no se puede descargar.</p>
                 </div>
            </div>
          )
      }

      // Check Blocked Status (Admin Action)
      if (transfer.blocked) {
           return (
             <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0a0a0c]">
                 <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-zinc-900/50 p-8 backdrop-blur-xl text-center">
                     <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
                         <ShieldAlert className="w-10 h-10" />
                     </div>
                     <h1 className="mb-2 text-2xl font-bold text-white">Archivo Bloqueado</h1>
                     <p className="text-zinc-400 mb-6">
                         Este archivo ha sido bloqueado temporalmente por los administradores por violar nuestros términos de servicio.
                     </p>
                     {transfer.blockedMessage && (
                       <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 text-sm text-red-200">
                           {transfer.blockedMessage}
                       </div>
                     )}
                 </div>
             </div>
           )
      }

      // Check Plan Limits (Enforcement)
      if (transfer.senderId) {
          const sender = await User.findById(transfer.senderId).lean() as any
          if (sender) {
              const planName = (sender.plan || 'free') as keyof typeof PLAN_LIMITS
              const plan = PLAN_LIMITS[planName] || PLAN_LIMITS.free
              
              const activeFilesCount = await Transfer.countDocuments({ senderId: transfer.senderId })
              const activeProtectedCount = await Transfer.countDocuments({ senderId: transfer.senderId, passwordHash: { $exists: true } })
              const activeLinksCount = await Transfer.countDocuments({ senderId: transfer.senderId, customLink: { $exists: true, $ne: null } })
              
              const storageResult = await Transfer.aggregate([
                { $match: { senderId: transfer.senderId } },
                { $group: { _id: null, total: { $sum: "$size" } } }
              ])
              const totalBytes = storageResult[0]?.total || 0

              let isOver = false
              if (plan.maxFiles !== Infinity && activeFilesCount > plan.maxFiles) isOver = true
              else if (plan.maxPwd !== Infinity && activeProtectedCount > plan.maxPwd) isOver = true
              else if (plan.maxCustomLinks !== undefined && activeLinksCount > plan.maxCustomLinks) isOver = true
              else if (plan.maxTotalStorage && totalBytes > plan.maxTotalStorage) isOver = true

              if (isOver) {
                   return (
                       <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0a0a0c]">
                           <div className="w-full max-w-md rounded-3xl border border-yellow-500/20 bg-zinc-900/50 p-8 backdrop-blur-xl text-center">
                               <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20">
                                   <AlertTriangle className="w-10 h-10" />
                               </div>
                               <h1 className="mb-2 text-2xl font-bold text-white">Acceso Limitado</h1>
                               <p className="text-zinc-400 mb-6 font-light">
                                   El propietario de este archivo ha excedido los límites de su plan. El acceso se restaurará pronto.
                               </p>
                           </div>
                       </div>
                   )
              }
          }
      }

      // Check Max Downloads (Feature 5)
      if (transfer.maxDownloads !== null && transfer.maxDownloads !== undefined && transfer.downloads >= transfer.maxDownloads) {
          return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0a0a0c]">
                 <div className="w-full max-w-md rounded-3xl border border-white/5 bg-zinc-900/50 p-12 backdrop-blur-xl text-center shadow-2xl">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                         <AlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Límite Alcanzado</h1>
                    <p className="text-zinc-400">Este archivo ha alcanzado su límite máximo de descargas permitido por el emisor.</p>
                 </div>
            </div>
          )
      }

      const isProtected = !!transfer.passwordHash
      let downloadUrl: string | undefined = undefined

      if (!isProtected) {
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: transfer.fileKey,
            ResponseContentDisposition: `attachment; filename="${transfer.originalName}"`,
        })
        downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
      }

      let branding = null
      if (transfer.senderId) {
          const sender = await User.findById(transfer.senderId).lean() as any
          if (sender?.plan === 'pro' && sender?.branding?.enabled) {
              branding = sender.branding
          }
      }

      return (
          <div 
             className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0c]"
             style={branding?.background ? { backgroundImage: `url(${branding.background})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
             {/* Dynamic Background (only if no custom branding) */}
             {!branding?.background && (
                 <>
                    <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[128px] opacity-10 pointer-events-none animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-500/10 rounded-full blur-[128px] opacity-10 pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03] pointer-events-none" />
                 </>
             )}

             {branding?.background && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none" />}
              
              <div className="relative z-10 w-full flex justify-center py-12">
                  <div className="w-full max-w-lg">
                      <DownloadManager 
                          id={transfer._id.toString()}
                          fileName={transfer.originalName}
                          fileSize={transfer.size}
                          isProtected={isProtected}
                          initialDownloadUrl={downloadUrl}
                          branding={branding}
                      />
                      
                      {/* Quiet branding if not custom */}
                      {!branding && (
                           <p className="mt-8 text-center text-xs text-zinc-600">
                               Impulsado por <span className="text-zinc-500 font-semibold">BrosDrop</span>
                           </p>
                      )}
                  </div>
              </div>
          </div>
      )
  } catch (error) {
      console.error(error)
      return notFound()
  }
}
