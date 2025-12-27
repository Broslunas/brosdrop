
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import User from "@/models/User"
import dbConnect from "@/lib/db"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()
        const user = await User.findById(session.user.id)

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Generate a new secure random API key
        // Format: bdp_ (prefix) + 32 bytes hex
        const apiKey = `bdp_${randomBytes(24).toString('hex')}`

        user.apiKey = apiKey
        await user.save()

        return NextResponse.json({ apiKey })

    } catch (error) {
        console.error("Failed to generate API key:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()
        const user = await User.findById(session.user.id).select('apiKey')

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ apiKey: user.apiKey })

    } catch (error) {
        console.error("Failed to fetch API key:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
