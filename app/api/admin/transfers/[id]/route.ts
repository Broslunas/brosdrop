import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import { s3Client } from "@/lib/s3"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import bcrypt from "bcryptjs"

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
    const { name, password, removePassword, expiresAt, customLink, maxDownloads } = await req.json()

    await dbConnect()

    const transfer = await Transfer.findById(id)
    if (!transfer) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    if (name) transfer.originalName = name

    if (customLink !== undefined) {
         if (!customLink) {
             transfer.customLink = undefined
         } else {
             // Basic slug validation
             const slugRegex = /^[a-z0-9-]+$/
             if (!slugRegex.test(customLink)) {
                 return NextResponse.json({ error: "Slug inválido. Solo letras minúsculas, números y guiones." }, { status: 400 })
             }

             // Check collision
             const existing = await Transfer.findOne({ customLink })
             if (existing && existing._id.toString() !== id) {
                 return NextResponse.json({ error: "Este enlace ya está en uso." }, { status: 409 })
             }

             const forbidden = ['dashboard', 'api', 'login', 'register', 'admin', 'privacy', 'terms', 'features']
             if (forbidden.includes(customLink)) {
                  return NextResponse.json({ error: "Este enlace está reservado." }, { status: 400 })
             }

             transfer.customLink = customLink
         }
    }

    if (expiresAt) {
        const newDate = new Date(expiresAt)
        if (!isNaN(newDate.getTime())) {
             transfer.expiresAt = newDate.toISOString()
        }
    }

    if (removePassword) {
        transfer.passwordHash = undefined
    } else if (password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        transfer.passwordHash = hashedPassword
    }

    if (maxDownloads !== undefined) {
        transfer.maxDownloads = maxDownloads ? Math.max(0, parseInt(maxDownloads)) : null
    }

    await transfer.save()

    return NextResponse.json({ success: true, transfer })
  } catch (error) {
    console.error("Admin Update failed:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    await dbConnect()

    const transfer = await Transfer.findById(id)
    if (!transfer) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
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
