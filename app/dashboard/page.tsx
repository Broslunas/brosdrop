import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import ExpiredTransfer from "@/models/ExpiredTransfer"
import User from "@/models/User"
import DashboardFiles from "@/components/DashboardFiles"

// Force dynamic rendering ensure validation on every request
export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await dbConnect()

  const user = await User.findById(session.user.id).select('defaultView').lean()
  const defaultView = (user as any)?.defaultView || 'grid'

  // Find files for this user
  const transfers = await Transfer.find({ senderId: session.user.id })
    .sort({ createdAt: -1 })
    .lean()

  // Serialize Mongoose docs to plain objects
  const serializedTransfers = transfers.map((t: any) => ({
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
    blocked: t.blocked,
    blockedMessage: t.blockedMessage,
    isPublic: t.isPublic
  }))

  const activeIds = new Set(serializedTransfers.map(t => t._id))

  // Find history (expired/deleted) files
  const expiredTransfers = await ExpiredTransfer.find({ 
      senderId: session.user.id, 
      hidden: { $ne: true } 
  }).sort({ createdAt: -1 }).lean()

  const historyFiles = expiredTransfers
      .filter((t: any) => !activeIds.has(t.transferId))
      .map((t: any) => ({
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
    <div className="w-full h-full">
      <DashboardFiles 
        initialFiles={serializedTransfers} 
        historyFiles={historyFiles} 
        defaultView={defaultView}
        userPlan={(session.user as any)?.plan || 'free'}
      />
    </div>
  )
}
