
import { notFound } from "next/navigation"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3Client } from "@/lib/s3"
import DownloadManager from "@/components/DownloadManager"
import { isValidObjectId } from "mongoose"

import ExpiredTransfer from "@/models/ExpiredTransfer"
import User from "@/models/User"
import { PLAN_LIMITS } from "@/lib/plans"

interface Props {
  params: Promise<{ id: string }>
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

      const transferId = transfer ? transfer._id.toString() : null

      if (!transfer) {
          // Check if it exists in the expired history
          // Try by ID or Custom Link
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
                <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-zinc-900/50 p-8 backdrop-blur-xl text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="m9.5 17 5-5"/><path d="m9.5 12 5 5"/></svg>
                        </div>
                        <h1 className="mb-2 text-2xl font-bold text-white">Archivo no disponible</h1>
                        <p className="text-zinc-400 mb-6">
                            Este archivo ha caducado o ha sido eliminado por el propietario.
                        </p>
                        
                        <div className="rounded-2xl bg-black/20 p-4 border border-white/5 mb-6">
                            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Nombre del archivo original</p>
                            <p className="text-zinc-300 font-medium truncate">{expiredRecord.originalName}</p>
                        </div>
                    </div>
                </div>
              )
          }
          
          return notFound()
      }

      if (new Date().toISOString() > transfer.expiresAt) {
          return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold text-red-500">Transferencia Expirada</h1>
                <p className="text-zinc-400">Este archivo ya no está disponible.</p>
            </div>
          )
      }

      // Check Plan Limits (Enforcement)
      if (transfer.senderId) {
          const sender = await User.findById(transfer.senderId).lean() as any
          if (sender) {
              const planName = (sender.plan || 'free') as keyof typeof PLAN_LIMITS
              const plan = PLAN_LIMITS[planName] || PLAN_LIMITS.free
              
              // Only check limits if NOT Admin? No, users are users.
              
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
                       <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-4">
                           <div className="w-full max-w-md rounded-3xl border border-yellow-500/20 bg-zinc-900/50 p-8 backdrop-blur-xl text-center">
                               <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                               </div>
                               <h1 className="mb-2 text-2xl font-bold text-white">Acceso Temporalmente Restringido</h1>
                               <p className="text-zinc-400 mb-6">
                                   El propietario de este archivo ha excedido los límites de su plan. El acceso se restaurará cuando regularice su cuenta.
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
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold text-orange-500">Límite de Descargas Alcanzado</h1>
                <p className="text-zinc-400">Este archivo ha alcanzado su límite máximo de descargas.</p>
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
             className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-4 bg-cover bg-center relative"
             style={branding?.background ? { backgroundImage: `url(${branding.background})` } : undefined}
          >
             {branding?.background && <div className="absolute inset-0 bg-black/60 pointer-events-none" />}
              
              <div className="relative z-10 w-full flex justify-center">
                  <DownloadManager 
                      id={transfer._id.toString()}
                      fileName={transfer.originalName}
                      fileSize={transfer.size}
                      isProtected={isProtected}
                      initialDownloadUrl={downloadUrl}
                      branding={branding}
                  />
              </div>
          </div>
      )
  } catch (error) {
      console.error(error)
      return notFound()
  }
}
