
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import ExpiredTransfer from "@/models/ExpiredTransfer"
import { s3Client } from "@/lib/s3"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import User from "@/models/User"
import { PLAN_LIMITS, formatBytes } from "@/lib/plans"
import { randomUUID } from "crypto"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    // Optional: Force login?
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, type, size, expiresInHours, customExpiresAt, password } = await req.json()

    if (!process.env.R2_BUCKET_NAME) {
        return NextResponse.json({ error: "Server Configuration Error: R2 Bucket not set" }, { status: 500 })
    }

    await dbConnect()

    // Fetch user plan details
    let plan = 'free'
    if (session?.user?.id) {
        const user = await User.findById(session.user.id).lean() as any
        if (user) plan = user.plan || 'free'
    }

    // Limits are imported from @/lib/plans

    const isVerified = session?.user && (session.user as any).emailVerified
    const currentLimits = isVerified ? PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] : PLAN_LIMITS.guest

    // 1. Check Size
    if (size > currentLimits.maxBytes) {
         return NextResponse.json({ error: `Tu plan ${plan.toUpperCase()} limita archivos a ${formatBytes(currentLimits.maxBytes)}. Mejora tu plan.` }, { status: 400 })
    }

    // 2. Check Active Files (Simultaneous)
    if (session?.user?.id) {
        const activeCount = await Transfer.countDocuments({ senderId: session.user.id })
        if (activeCount >= currentLimits.maxFiles) {
             return NextResponse.json({ error: `Límite de archivos activos (${currentLimits.maxFiles}) alcanzado. Elimina archivos o mejora tu plan.` }, { status: 403 })
        }

        // Check Total Storage
        if (currentLimits.maxTotalStorage) {
             const transfers = await Transfer.find({ senderId: session.user.id }).select('size').lean()
             const usedBytes = transfers.reduce((acc, curr: any) => acc + (curr.size || 0), 0)
             
             if (usedBytes + size > currentLimits.maxTotalStorage) {
                 return NextResponse.json({ error: `Has superado tu límite de almacenamiento de ${formatBytes(currentLimits.maxTotalStorage)}. Uso actual: ${formatBytes(usedBytes)}.` }, { status: 403 })
             }
        }
    }

    // 3. Password Check
    let passwordHash = undefined
    if (password) {
         if (!isVerified) {
             return NextResponse.json({ error: "Regístrate para usar contraseñas." }, { status: 403 })
         }
         
         const activePwdCount = await Transfer.countDocuments({ senderId: session.user.id, passwordHash: { $exists: true } })
         if (activePwdCount >= currentLimits.maxPwd) {
             return NextResponse.json({ error: `Tu plan ${plan.toUpperCase()} solo permite ${currentLimits.maxPwd} archivo protegido. Mejora a Plus.` }, { status: 403 })
         }
         passwordHash = await bcrypt.hash(password, 10)
    }

    // 4. Calculate Expiration
    let expirationTime: Date;
    
    if (isVerified) {
        if (customExpiresAt) {
             const customDate = new Date(customExpiresAt)
             const maxDate = new Date(Date.now() + currentLimits.maxDays * 24 * 60 * 60 * 1000)
             
             if (!isNaN(customDate.getTime()) && customDate > new Date() && customDate <= maxDate) {
                 expirationTime = customDate
             } else {
                 return NextResponse.json({ error: `La fecha de expiración excede el máximo de ${currentLimits.maxDays} días de tu plan.` }, { status: 400 })
             }
        } else {
            expirationTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        }
    } else {
        expirationTime = new Date(Date.now() + 30 * 60 * 1000)
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
      hashedPassword: passwordHash ? 'Yes' : 'No'
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
      passwordHash
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
        passwordHash
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
