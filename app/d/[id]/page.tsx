
import { notFound } from "next/navigation"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3Client } from "@/lib/s3"
import DownloadClient from "./DownloadCard"

import ExpiredTransfer from "@/models/ExpiredTransfer"

interface Props {
  params: Promise<{ id: string }>
}

export default async function DownloadPage({ params }: Props) {
  const { id } = await params
  
  await dbConnect()

  try {
      const transfer = await Transfer.findById(id)

      if (!transfer) {
          // Check if it exists in the expired history
          const expiredRecord = await ExpiredTransfer.findOne({ transferId: id })
          
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
                <h1 className="text-2xl font-bold text-red-500">Transfer Expired</h1>
                <p className="text-zinc-400">This file is no longer available.</p>
            </div>
          )
      }

      const command = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: transfer.fileKey,
          ResponseContentDisposition: `attachment; filename="${transfer.originalName}"`,
      })

      const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

      return (
          <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-4">
              <DownloadClient 
                  fileName={transfer.originalName}
                  fileSize={transfer.size}
                  downloadUrl={downloadUrl}
              />
          </div>
      )
  } catch (error) {
      console.error(error)
      return notFound()
  }
}
