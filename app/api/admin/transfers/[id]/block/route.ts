import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params
    const { blocked, blockedMessage } = await req.json()

    await dbConnect()

    const transfer = await Transfer.findById(id)
    if (!transfer) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    transfer.blocked = blocked
    if (blockedMessage) {
        transfer.blockedMessage = blockedMessage
    } else {
        transfer.blockedMessage = undefined
    }

    await transfer.save()

    // Notify via Webhook
    try {
        const User = (await import("@/models/User")).default
        const fileOwner = await User.findById(transfer.senderId)
        
        const webhookUrl = "https://n8n.broslunas.com/webhook-test/brosdrop-files-blocked"
        
        const payload = {
            action: blocked ? "blocked" : "unblocked",
            admin: {
                name: session.user.name,
                email: session.user.email
            },
            user: {
                name: fileOwner?.name || "Unknown",
                email: fileOwner?.email || "Unknown"
            },
            file: {
                name: transfer.originalName,
                sizeMB: (transfer.size / (1024 * 1024)).toFixed(2),
                expiresAt: transfer.expiresAt || "Never"
            },
            reason: blockedMessage || "No specified reason"
        }

        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error("Webhook triggers error:", err))

    } catch (webhookError) {
        console.error("Webhook preparation failed:", webhookError)
    }

    return NextResponse.json({ success: true, transfer })
  } catch (error) {
    console.error("Block failed:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
