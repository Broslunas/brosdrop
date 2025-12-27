
import { NextResponse } from "next/server"
import { validateApiKey } from "@/lib/apiAuth"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { s3Client } from "@/lib/s3"

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        await dbConnect()
        const { error, user, status } = await validateApiKey(req)
        if (error) return NextResponse.json({ error }, { status })

        const { id } = params
        
        // Validate Mongo ID
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
             return NextResponse.json({ error: "Invalid File ID" }, { status: 400 })
        }

        const transfer = await Transfer.findOne({ 
            _id: id, 
            senderId: user!._id.toString() 
        })

        if (!transfer) {
            return NextResponse.json({ error: "File not found" }, { status: 404 })
        }

        return NextResponse.json(transfer)

    } catch (error) {
        console.error("API GET File Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        await dbConnect()
        const { error, user, status } = await validateApiKey(req)
        if (error) return NextResponse.json({ error }, { status })

        const { id } = params
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
             return NextResponse.json({ error: "Invalid File ID" }, { status: 400 })
        }

        const transfer = await Transfer.findOne({ 
            _id: id, 
            senderId: user!._id.toString() 
        })

        if (!transfer) {
            return NextResponse.json({ error: "File not found" }, { status: 404 })
        }

        // Delete from R2
        try {
            await s3Client.send(new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: transfer.fileKey,
            }))
        } catch (e) {
            console.error("R2 Delete Error:", e)
        }

        await Transfer.deleteOne({ _id: transfer._id })

        return NextResponse.json({ message: "File deleted successfully" })

    } catch (error) {
        console.error("API DELETE File Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
