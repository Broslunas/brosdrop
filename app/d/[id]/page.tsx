
import { notFound } from "next/navigation"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3Client } from "@/lib/s3"
import DownloadClient from "./client" // I'll create a client component for the button interactions

interface Props {
  params: Promise<{ id: string }>
}

export default async function DownloadPage({ params }: Props) {
  const { id } = await params
  
  await dbConnect()

  try {
      const transfer = await Transfer.findById(id)

      if (!transfer) {
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
