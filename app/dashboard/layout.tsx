import DashboardHeader from "@/components/DashboardHeader"
import VerificationBanner from "@/components/VerificationBanner"
import BlockedFileBanner from "@/components/BlockedFileBanner"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Transfer from "@/models/Transfer"
import { PLAN_LIMITS } from "@/lib/plans"
import LimitEnforcer from "@/components/LimitEnforcer"
import SidebarWrapper from "@/components/SidebarWrapper"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
  
  const activeLinksCount = await Transfer.countDocuments({ senderId: session.user.id, customLink: { $exists: true, $ne: null } })
  
  // Calculate total storage
  const storageResult = await Transfer.aggregate([
      { $match: { senderId: session.user.id } },
      { $group: { _id: null, total: { $sum: "$size" } } }
  ])
  const totalStorageBytes = storageResult[0]?.total || 0

  const blockedCount = await Transfer.countDocuments({ senderId: session.user.id, blocked: true })

  let overLimit = false
  let limitMsg = ""

  if (plan.maxFiles !== Infinity && activeFilesCount > plan.maxFiles) {
     overLimit = true
     limitMsg = `Has excedido tu límite de archivos activos (${activeFilesCount}/${plan.maxFiles}).`
  } else if (plan.maxPwd !== Infinity && activeProtectedCount > plan.maxPwd) {
     overLimit = true
     limitMsg = `Has excedido tu límite de archivos protegidos con contraseña (${activeProtectedCount}/${plan.maxPwd}).`
  } else if (plan.maxCustomLinks !== undefined && activeLinksCount > plan.maxCustomLinks) {
     overLimit = true
     limitMsg = `Has excedido tu límite de enlaces personalizados (${activeLinksCount}/${plan.maxCustomLinks}).`
  } else if (plan.maxTotalStorage && totalStorageBytes > plan.maxTotalStorage) {
     overLimit = true
     limitMsg = `Has excedido tu límite de almacenamiento total.`
  }

  return (
    <div className="flex h-screen w-full override-main-layout bg-background overflow-hidden">
      <LimitEnforcer isOverLimit={overLimit} message={limitMsg} />
      <SidebarWrapper />
         <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
            <DashboardHeader />
            <VerificationBanner />
            <BlockedFileBanner count={blockedCount} />
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
                {children}
            </div>
         </main>
      </div>
    </div>
  )
}
