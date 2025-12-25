
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import dbConnect from "@/lib/db"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const user = await User.findOne({ email: session.user.email })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.emailVerified) {
        return NextResponse.json({ error: "Already verified" }, { status: 400 })
    }

    const crypto = require('crypto')
    const token = crypto.randomBytes(32).toString('hex')
    
    user.verificationToken = token
    await user.save()

    let referer = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    try {
        const reqReferer = req.headers.get('referer')
        if (reqReferer) {
            referer = new URL(reqReferer).origin
        } else {
             referer = new URL(referer).origin
        }
    } catch (e) {
        // Fallback if URL parsing fails
        referer = new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000').origin
    }

    await fetch('https://n8n.broslunas.com/webhook/brosdrop-welcome-email', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Referer': referer
        },
        body: JSON.stringify({
            userId: user._id,
            name: user.name,
            email: user.email,
            verificationToken: token
        })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
