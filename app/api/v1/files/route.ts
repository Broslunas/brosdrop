
import { NextResponse } from "next/server"
import { validateApiKey } from "@/lib/apiAuth"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"

export async function GET(req: Request) {
    try {
        await dbConnect()
        const { error, user, status } = await validateApiKey(req)

        if (error) {
            return NextResponse.json({ error }, { status })
        }

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const skip = (page - 1) * limit

        const transfers = await Transfer.find({ senderId: user!._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('originalName size views downloads expiresAt customLink createdAt')

        const total = await Transfer.countDocuments({ senderId: user!._id })

        return NextResponse.json({
            data: transfers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error("API List Files Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
