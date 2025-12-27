import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Transfer from "@/models/Transfer"
import { formatBytes } from "@/lib/plans"
import { Shield, Users, HardDrive, FileText, Activity } from "lucide-react"
import AdminDashboardClient from "@/components/admin/AdminDashboardClient"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const session = await getServerSession(authOptions)
    
    // Authorization Check
    if (!session || session.user.role !== 'admin') {
        redirect('/dashboard')
    }

    await dbConnect()

    // 1. Storage Stats
    const storageResult = await Transfer.aggregate([
        { $group: { _id: null, totalSize: { $sum: "$size" }, count: { $sum: 1 } } }
    ])
    const totalBytes = storageResult[0]?.totalSize || 0
    const totalFiles = storageResult[0]?.count || 0

    // 2. User Stats
    const totalUsers = await User.countDocuments()
    const proUsers = await User.countDocuments({ plan: 'pro' })
    const plusUsers = await User.countDocuments({ plan: 'plus' })

    // 3. Removed Recent Activity query in favor of full table component

    // 4. Render Client Component
    return (
        <AdminDashboardClient stats={{
            totalUsers,
            proUsers,
            plusUsers,
            totalBytes,
            totalFiles
        }} />
    )
}

