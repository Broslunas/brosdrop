import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Transfer from "@/models/Transfer"

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
        const role = searchParams.get('role') || 'all'
        const status = searchParams.get('status') || 'all'

        const skip = (page - 1) * limit

        let query: any = {}
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }
        
        if (role !== 'all') {
            query.role = role
        }
        
        if (status !== 'all') {
             if (status === 'blocked') {
                 query.blocked = true
             } else if (status === 'active') {
                 query.blocked = { $ne: true }
             }
        }

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            
        const total = await User.countDocuments(query)

        // Enhance with file stats (optional but nice)
        // This is N+1 queries effectively if not careful, but let's do simple version for now
        // Or aggregation. Aggregation is better.
        
        // Let's do a second pass aggregation for these users IDs to get their file counts
        const userIds = users.map((u: any) => u._id.toString())
        
        const fileStats = await Transfer.aggregate([
            { $match: { senderId: { $in: userIds } } },
            { $group: { 
                _id: "$senderId", 
                count: { $sum: 1 }, 
                size: { $sum: "$size" } 
            }}
        ])

        const statsMap = new Map()
        fileStats.forEach(stat => {
            statsMap.set(stat._id.toString(), { count: stat.count, size: stat.size })
        })

        const usersWithStats = users.map((u: any) => ({
            ...u,
            filesCount: statsMap.get(u._id.toString())?.count || 0,
            storageUsed: statsMap.get(u._id.toString())?.size || 0
        }))

        return NextResponse.json({
            users: usersWithStats,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error("Admin user fetch error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
