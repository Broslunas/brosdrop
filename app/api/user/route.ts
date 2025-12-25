
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import dbConnect from "@/lib/db"
import User from "@/models/User"

export async function GET(req: Request) {
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

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    
    // Validate/Sanitize data if needed
    // Assuming data contains: { name, image, newsletterSubscribed, emailNotifications }

    await dbConnect()
    const user = await User.findOneAndUpdate(
        { email: session.user.email }, 
        { ...data },
        { new: true }
    )

    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
  
      await dbConnect()
      await User.findOneAndDelete({ email: session.user.email })
      
      // Ideally here we would also delete all files associated with the user
      // But for this request we focus on deleting the account record as asked.
  
      return NextResponse.json({ message: "Account deleted" })
    } catch (error) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
  }
