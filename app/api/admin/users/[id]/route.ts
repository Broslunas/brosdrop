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

    const wasBlocked = user.blocked
    
    if (role) user.role = role
    if (plan) user.plan = plan
    if (blocked !== undefined) user.blocked = blocked
    if (blockedMessage !== undefined) user.blockedMessage = blockedMessage
    
    if (planExpiresAt !== undefined) {
        user.planExpiresAt = planExpiresAt ? new Date(planExpiresAt) : null
    }

    await user.save()

    // Trigger Webhook if blocked status changed
    if (blocked !== undefined && wasBlocked !== blocked) {
        try {
            const webhookUrl = "https://n8n.broslunas.com/webhook/brosdrop-users-blocked"
            const payload = {
                action: blocked ? "blocked" : "unblocked",
                admin: {
                    name: session.user.name,
                    email: session.user.email
                },
                user: {
                    name: user.name,
                    email: user.email,
                    id: user._id
                },
                reason: blockedMessage || user.blockedMessage || "No reason provided",
                timestamp: new Date().toISOString()
            }

            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(err => console.error("User webhook triggers error:", err))

        } catch (webhookError) {
             console.error("User webhook preparation failed:", webhookError)
        }
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Admin user update failed:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
