import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Transfer from "@/models/Transfer"
import { PLAN_LIMITS } from "@/lib/plans"
import CleanupClient from "@/components/CleanupClient"

export default async function CleanupPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await dbConnect()
  const user = await User.findById(session.user.id).lean() as any
  const planName = (user?.plan || 'free') as keyof typeof PLAN_LIMITS
  const plan = PLAN_LIMITS[planName] || PLAN_LIMITS.free

  const activeFilesCount = await Transfer.countDocuments({ senderId: session.user.id })
  const activeProtectedCount = await Transfer.countDocuments({ senderId: session.user.id, passwordHash: { $exists: true } })
  const storageResult = await Transfer.aggregate([
      { $match: { senderId: session.user.id } },
      { $group: { _id: null, total: { $sum: "$size" } } }
  ])
  const totalStorageBytes = storageResult[0]?.total || 0

  let overLimit = false

  if (plan.maxFiles !== Infinity && activeFilesCount > plan.maxFiles) overLimit = true
  else if (plan.maxPwd !== Infinity && activeProtectedCount > plan.maxPwd) overLimit = true
  else if (plan.maxTotalStorage && totalStorageBytes > plan.maxTotalStorage) overLimit = true

  // If NOT over limit, redirect back to dashboard
  if (!overLimit) {
      redirect("/dashboard")
  }

  // Fetch files for management
  const files = await Transfer.find({ senderId: session.user.id }).sort({ createdAt: -1 }).lean()
  const serializedFiles = files.map((file: any) => ({
    ...file,
    _id: file._id.toString(),
    createdAt: new Date(file.createdAt).toISOString(),
    expiresAt: file.expiresAt ? new Date(file.expiresAt).toISOString() : undefined,
    senderId: file.senderId.toString(),
  }))

  return (
    <CleanupClient initialFiles={serializedFiles} plan={plan} />
  )
}
