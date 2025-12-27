import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import dbConnect from "@/lib/db"
import Transfer from "@/models/Transfer"
import User from "@/models/User" // Ensure model is loaded

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        await dbConnect()

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || 'all'

        const skip = (page - 1) * limit

        // Filter logic is moved inside pipeline construction below
        const searchUserIds = search ? await User.find({ email: { $regex: search, $options: 'i' } }).distinct('_id') : []

        // Use aggregation to properly lookup senderId (which is String) against Users (which have ObjectId _id)
        const pipeline: any[] = []

        if (search) {
             pipeline.push({
                 $match: {
                     $or: [
                         { originalName: { $regex: search, $options: 'i' } },
                         { fileKey: { $regex: search, $options: 'i' } },
                         { senderId: { $in: searchUserIds.map((id: any) => id.toString()) } }
                     ]
                 }
             })
        }
        
        if (status !== 'all') {
            pipeline.push({
                $match: {
                    blocked: status === 'blocked' ? true : { $ne: true }
                }
            })
        }

        pipeline.push({ $sort: { createdAt: -1 } })
        
        // Count total matching before pagination
        // This is expensive but necessary for correct pagination in aggregation
        // Or we can do a separate count query if we replicate the match logic. 
        // For simplicity in this context, use facet.
        
        pipeline.push({
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "users",
                            let: { sId: { $toObjectId: "$senderId" } }, 
                            pipeline: [
                                { $match: { $expr: { $eq: ["$_id", "$$sId"] } } },
                                { $project: { name: 1, email: 1 } }
                            ],
                            as: "senderDetails"
                        }
                    },
                    { $unwind: { path: "$senderDetails", preserveNullAndEmptyArrays: true } },
                    { $addFields: { senderId: "$senderDetails" } } // Remap to match expectation
                ]
            }
        })

        const result = await Transfer.aggregate(pipeline)
        
        const transfers = result[0].data
        const total = result[0].metadata[0]?.total || 0

        return NextResponse.json({
            transfers,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error("Admin fetch error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
