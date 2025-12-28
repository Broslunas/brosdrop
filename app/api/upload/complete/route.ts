
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import ExpiredTransfer from "@/models/ExpiredTransfer"
import { createHmac } from "crypto"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Validate request body
    const { token } = await req.json()

    if (!token) {
        return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    // 1. Verify Token and Integrity
    const [payloadBase64, signature] = token.split('.')
    if (!payloadBase64 || !signature) {
        return NextResponse.json({ error: "Invalid token format" }, { status: 400 })
    }

    const payloadStr = Buffer.from(payloadBase64, 'base64').toString('utf-8')
    const secret = process.env.NEXTAUTH_SECRET || 'fallback_secret_not_secure'
    
    // Re-calculate signature
    const expectedSignature = createHmac('sha256', secret)
        .update(payloadStr)
        .digest('hex')

    if (signature !== expectedSignature) {
         return NextResponse.json({ error: "Invalid token signature" }, { status: 403 })
    }

    const data = JSON.parse(payloadStr)
    
    const {
        fileKey,
        originalName,
        size,
        mimeType,
        senderId,
        senderEmail,
        expiresAt,
        passwordHash,
        customLink, 
        maxDownloads
    } = data

    // Verify Session Match (Security: prevent user A from using user B's signed token if they stole it?)
    // While the token is signed, it's safer to ensure the current session matches the token's senderId
    if (senderId) {
        if (!session || session.user.id !== senderId) {
             return NextResponse.json({ error: "Session mismatch" }, { status: 403 })
        }
    } else {
        // If guest upload, ensure current user is not logged in? Or doesn't matter.
    }

    await dbConnect()

    // 2. Race Condition Check for Custom Link
    if (customLink) {
         const existing = await Transfer.findOne({ customLink })
         if (existing) {
             // Edge case: User uploaded file but link got taken in the meantime. 
             // We can fail, or save without custom link. Failing is safer for consistency.
             return NextResponse.json({ error: "El enlace personalizado ya está en uso (fue tomado durante la subida)." }, { status: 409 })
         }
    }

    // 3. Create Database Records
    const transfer = await Transfer.create({
      fileKey,
      originalName,
      size,
      mimeType,
      senderId,
      senderEmail,
      expiresAt,
      passwordHash,
      customLink: customLink || undefined,
      maxDownloads: maxDownloads ? parseInt(maxDownloads) : undefined
    })

    await ExpiredTransfer.create({
        transferId: transfer._id,
        fileKey,
        originalName,
        size,
        mimeType,
        senderId,
        senderEmail,
        expiresAt,
        passwordHash,
        customLink
    })

    const identifier = customLink || transfer._id
    const finalLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/d/${identifier}`

    return NextResponse.json({
        success: true,
        id: transfer._id,
        link: finalLink
    })

  } catch (error) {
    console.error("Upload completion failed:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
