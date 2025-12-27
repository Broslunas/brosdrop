
import { NextResponse } from "next/server"
import { validateApiKey } from "@/lib/apiAuth"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import ExpiredTransfer from "@/models/ExpiredTransfer"
import { s3Client } from "@/lib/s3"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { randomUUID } from "crypto"
import { formatBytes } from "@/lib/plans"

export async function POST(req: Request) {
    try {
        await dbConnect()
        const { error, user, plan: limits, status } = await validateApiKey(req)

        if (error) {
            return NextResponse.json({ error }, { status })
        }

        const { name, type, size, expiresInHours, customLink, password } = await req.json()

        if (!name || !size) {
             return NextResponse.json({ error: "Missing name or size" }, { status: 400 })
        }

        // 1. Check Size
        if (size > (limits!.maxBytes)) {
             return NextResponse.json({ error: `File too large. Limit is ${formatBytes(limits!.maxBytes)}` }, { status: 400 })
        }

        // 2. Check Active Files
        const activeCount = await Transfer.countDocuments({ senderId: user!._id })
        if (activeCount >= (limits!.maxFiles)) {
             return NextResponse.json({ error: `Active files limit reached (${limits!.maxFiles})` }, { status: 403 })
        }

        // 3. Check Total Storage
        if (limits!.maxTotalStorage) {
             const transfers = await Transfer.find({ senderId: user!._id }).select('size').lean()
             const usedBytes = transfers.reduce((acc, curr: any) => acc + (curr.size || 0), 0)
             
             if (usedBytes + size > limits!.maxTotalStorage) {
                 return NextResponse.json({ error: `Storage limit exceeded.` }, { status: 403 })
             }
        }

        // Expiration Logic for API
        // Default to plan max days if not specified, or 7 days
        const maxHours = limits!.maxDays * 24
        let hours = 24 * 7 // default 7 days
        if (expiresInHours) {
            hours = Math.min(expiresInHours, maxHours)
        }
        const expirationTime = new Date(Date.now() + hours * 60 * 60 * 1000)


        const fileKey = `${randomUUID()}-${name.replace(/\s+/g, '-')}`
        
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey,
            ContentType: type || 'application/octet-stream',
            ContentLength: size,
        })

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

        // Save metadata
        const transfer = await Transfer.create({
            fileKey,
            originalName: name,
            size,
            mimeType: type || 'application/octet-stream',
            senderId: user!._id,
            senderEmail: user!.email,
            expiresAt: expirationTime.toISOString(),
            customLink: customLink || undefined,
            // Password logic requires hashing, skipping for simplicity in API v1 for now unless requested
        })

        await ExpiredTransfer.create({
            transferId: transfer._id,
            fileKey,
            originalName: name,
            size,
            mimeType: type || 'application/octet-stream',
            senderId: user!._id,
            senderEmail: user!.email,
            expiresAt: expirationTime.toISOString(),
            customLink
        })

        return NextResponse.json({
            id: transfer._id,
            uploadUrl: signedUrl,
            fileUrl: `${process.env.NEXT_PUBLIC_APP_URL}/d/${customLink || transfer._id}`,
            key: fileKey,
            expiresAt: expirationTime.toISOString()
        })

    } catch (error) {
        console.error("API Upload Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
