import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import ExpiredTransfer from "@/models/ExpiredTransfer"
import DashboardFiles from "@/components/DashboardFiles"

// Force dynamic rendering ensure validation on every request
export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await dbConnect()

  // Find files for this user
  const transfers = await Transfer.find({ senderId: session.user.id })
    .sort({ createdAt: -1 })
    .lean()

  // Serialize Mongoose docs to plain objects
  // Serialize Mongoose docs to plain objects
  const serializedTransfers = transfers.map(t => ({
    ...t,
    _id: t._id.toString(),
    createdAt: t.createdAt?.toISOString(),
    updatedAt: t.updatedAt?.toISOString(),
    fileKey: t.fileKey,
    originalName: t.originalName,
    size: t.size,
    mimeType: t.mimeType,
    senderEmail: t.senderEmail,
    senderId: t.senderId,
    downloads: t.downloads,
    expiresAt: t.expiresAt,
  }))

  const activeIds = new Set(serializedTransfers.map(t => t._id))

  // Find history (expired/deleted) files
  const expiredTransfers = await ExpiredTransfer.find({ 
      senderId: session.user.id, 
      hidden: { $ne: true } 
  }).sort({ createdAt: -1 }).lean()

  const historyFiles = expiredTransfers
      .filter(t => !activeIds.has(t.transferId))
      .map(t => ({
        ...t,
        _id: t._id.toString(),
        createdAt: t.createdAt?.toISOString(),
        updatedAt: t.updatedAt?.toISOString(),
        fileKey: t.fileKey,
        originalName: t.originalName,
        size: t.size,
        mimeType: t.mimeType,
        senderEmail: t.senderEmail,
        senderId: t.senderId,
        downloads: t.downloads,
        expiresAt: t.expiresAt,
        isHistory: true
      }))

  return (
    <div className="w-full space-y-8 py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Transferencias</h1>
          <p className="text-zinc-400 mt-1">Gestiona tus archivos activos y ve las estadísticas de descarga.</p>
        </div>
      </header>

      <div className="w-full">
         <DashboardFiles initialFiles={serializedTransfers} historyFiles={historyFiles} />
      </div>
    </div>
  )
}
