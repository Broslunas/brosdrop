
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3Client } from "@/lib/s3"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    // Optional: Force login?
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, type, size } = await req.json()

    if (!process.env.R2_BUCKET_NAME) {
        return NextResponse.json({ error: "Server Configuration Error: R2 Bucket not set" }, { status: 500 })
    }

    const MAX_SIZE_GUEST = 10 * 1024 * 1024 // 10MB
    const MAX_SIZE_USER = 200 * 1024 * 1024 // 200MB

    const limit = session ? MAX_SIZE_USER : MAX_SIZE_GUEST
    
    if (size > limit) {
        return NextResponse.json({ 
            error: `File too large. Max size is ${session ? '200MB' : '10MB'}.` 
        }, { status: 400 })
    }

    await dbConnect()

    const fileKey = `${randomUUID()}-${name.replace(/\s+/g, '-')}`
    
    // Generate Pre-signed URL
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: type,
      ContentLength: size,
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    // Save metadata
    const transfer = await Transfer.create({
      fileKey,
      originalName: name,
      size,
      mimeType: type,
      senderId: session?.user?.id,
      senderEmail: session?.user?.email,
      expiresAt: session 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days for logged in users
        : new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes for guest users
    })

    return NextResponse.json({
      url: signedUrl,
      id: transfer._id,
      key: fileKey
    })

  } catch (error) {
    console.error("Upload setup failed:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
