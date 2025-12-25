
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import ExpiredTransfer from "@/models/ExpiredTransfer"
import { s3Client } from "@/lib/s3"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    // Optional: Force login?
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, type, size, expiresInHours } = await req.json()

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

    // Determine expiration
    let expirationTime = new Date(Date.now() + 30 * 60 * 1000) // Default guest: 30 mins

    if (session) {
        // User default: 7 days
        let hours = 24 * 7 

        if (expiresInHours && typeof expiresInHours === 'number') {
            hours = Math.min(Math.max(1, expiresInHours), 168) // Clamp between 1 and 168 hours (7 days)
        }
        
        expirationTime = new Date(Date.now() + hours * 60 * 60 * 1000)
    }

    const fileKey = `${randomUUID()}-${name.replace(/\s+/g, '-')}`
    
    // Generate Pre-signed URL
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: type,
      ContentLength: size,
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    console.log("Create Transfer Data:", {
      fileKey,
      originalName: name,
      size,
      mimeType: type,
      senderId: session?.user?.id,
      senderEmail: session?.user?.email,
      expiresAt: expirationTime.toISOString(),
    })

    // Save metadata
    const transfer = await Transfer.create({
      fileKey,
      originalName: name,
      size,
      mimeType: type,
      senderId: session?.user?.id,
      senderEmail: session?.user?.email,
      expiresAt: expirationTime.toISOString(),
    })

    await ExpiredTransfer.create({
        transferId: transfer._id,
        fileKey,
        originalName: name,
        size,
        mimeType: type,
        senderId: session?.user?.id,
        senderEmail: session?.user?.email,
        expiresAt: expirationTime.toISOString(),
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
