import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import User from "@/models/User"
import { PLAN_LIMITS } from "@/lib/plans"
import { s3Client } from "@/lib/s3"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import bcrypt from "bcryptjs"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { name, password, removePassword, expiresAt } = await req.json()

    await dbConnect()

    const transfer = await Transfer.findById(id)
    if (!transfer) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    if (transfer.senderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check Plan Limits
    const user = await User.findById(session.user.id).lean() as any
    const plan = user?.plan || 'free'
    
    // Limits imported from @/lib/plans
    const currentLimits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free

    if (name) {
        transfer.originalName = name
    }

    if (expiresAt) {
        const newDate = new Date(expiresAt)
        const oldDate = new Date(transfer.expiresAt)
        
        // Ensure valid date
        if (!isNaN(newDate.getTime())) {
            // Cannot extend life beyond original (or maybe we allow it? User said "siempre antes de la fecha de expiración original")
            // So we strictly enforce correct logic: newDate <= oldDate
            if (newDate < oldDate && newDate > new Date()) {
                transfer.expiresAt = newDate.toISOString()
            }
        }
    }

    if (removePassword) {
        transfer.passwordHash = undefined
    } else if (password) {
        // If file doesn't already have password, we are adding one (increasing count)
        if (!transfer.passwordHash) {
             const activePwdCount = await Transfer.countDocuments({ 
                senderId: session.user.id, 
                passwordHash: { $exists: true } 
             })
             
             if (activePwdCount >= currentLimits.maxPwd) {
                 return NextResponse.json({ 
                     error: `Tu plan ${plan.toUpperCase()} solo permite ${currentLimits.maxPwd} archivo protegido.` 
                 }, { status: 403 })
             }
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        transfer.passwordHash = hashedPassword
    }

    await transfer.save()

    return NextResponse.json({ success: true, transfer })
  } catch (error) {
    console.error("Update failed:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await dbConnect()

    const transfer = await Transfer.findById(id)
    if (!transfer) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    if (transfer.senderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete from R2
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: transfer.fileKey,
        })
        await s3Client.send(command)
    } catch (err) {
        console.error("R2 Delete Error:", err)
    }

    await Transfer.findByIdAndDelete(id)

    return NextResponse.json({ message: "File deleted successfully" })
  } catch (error) {
    console.error("Delete failed:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
