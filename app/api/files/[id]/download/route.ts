
import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import ExpiredTransfer from "@/models/ExpiredTransfer"

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { id } = params
    await dbConnect()

    const transfer = await Transfer.findByIdAndUpdate(id, { $inc: { downloads: 1 } })
    
    if (!transfer) {
        // Try expired
        await ExpiredTransfer.findOneAndUpdate({ transferId: id }, { $inc: { downloads: 1 } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error distinct download:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
