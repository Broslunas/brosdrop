import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import dbConnect from "@/lib/db"
import User from "@/models/User"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params
    const { role, plan, planExpiresAt, blocked, blockedMessage } = await req.json()

    await dbConnect()

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (role) user.role = role
    if (plan) user.plan = plan
    if (blocked !== undefined) user.blocked = blocked
    if (blockedMessage !== undefined) user.blockedMessage = blockedMessage
    
    if (planExpiresAt !== undefined) {
        user.planExpiresAt = planExpiresAt ? new Date(planExpiresAt) : null
    } else if (plan && !planExpiresAt) {
        // If plan changes but no expiration provided, maybe logic? 
        // No, let front-end handle that explicitly.
    }
    
    await user.save()

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Admin user update failed:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
