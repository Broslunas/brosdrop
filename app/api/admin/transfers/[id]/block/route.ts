import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params
    const { blocked, blockedMessage } = await req.json()

    await dbConnect()

    const transfer = await Transfer.findById(id)
    if (!transfer) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    transfer.blocked = blocked
    if (blockedMessage) {
        transfer.blockedMessage = blockedMessage
    } else {
        transfer.blockedMessage = undefined
    }

    await transfer.save()

    return NextResponse.json({ success: true, transfer })
  } catch (error) {
    console.error("Block failed:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
