import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import dbConnect from "@/lib/db"
import ExpiredTransfer from "@/models/ExpiredTransfer"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await dbConnect()

    const transfer = await ExpiredTransfer.findById(id)
    if (!transfer) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    if (transfer.senderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Soft delete: Mark as hidden
    transfer.hidden = true
    await transfer.save()

    return NextResponse.json({ message: "Record hidden successfully" })
  } catch (error) {
    console.error("History delete failed:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
