
import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import bcrypt from "bcryptjs"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3Client } from "@/lib/s3"

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { id } = params
    const { password } = await req.json()
    
    await dbConnect()

    const transfer = await Transfer.findById(id).select('+passwordHash')
    
    if (!transfer || !transfer.passwordHash) {
        return NextResponse.json({ error: "Not found or not protected" }, { status: 404 })
    }

    const isValid = await bcrypt.compare(password, transfer.passwordHash)

    if (isValid) {
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: transfer.fileKey,
            ResponseContentDisposition: `attachment; filename="${transfer.originalName}"`,
        })
  
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
        
        return NextResponse.json({ success: true, url: signedUrl })
    } else {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

  } catch (error) {
    console.error("Unlock error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
