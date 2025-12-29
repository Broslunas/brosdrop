import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import dbConnect from '@/lib/db'
import Folder from '@/models/Folder'
import Transfer from '@/models/Transfer'
import User from '@/models/User'
import { PLAN_LIMITS } from '@/lib/plans'

// GET /api/folders - List all folders for authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const includeEmpty = searchParams.get('includeEmpty') === 'true'

    // Get all folders for user
    const folders = await Folder.find({ userId: user._id.toString() })
      .sort({ createdAt: -1 })
      .lean()

    // Get file counts for each folder
    const folderIds = folders.map((f: any) => f._id.toString())
    const fileCounts = await Transfer.aggregate([
      {
        $match: {
          senderId: user._id.toString(),
          folderId: { $in: folderIds }
        }
      },
      {
        $group: {
          _id: '$folderId',
          count: { $sum: 1 }
        }
      }
    ])

    const fileCountMap = new Map(fileCounts.map(fc => [fc._id, fc.count]))

    const foldersWithCounts = folders.map((folder: any) => ({
      ...folder,
      fileCount: fileCountMap.get(folder._id.toString()) || 0
    }))

    // Filter out empty folders if requested
    const result = includeEmpty 
      ? foldersWithCounts 
      : foldersWithCounts.filter(f => f.fileCount > 0)

    return NextResponse.json({ folders: result })
  } catch (error: any) {
    console.error('Error fetching folders:', error)
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 })
  }
}

// POST /api/folders - Create new folder
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { name, color, icon, description } = body

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
    }

    if (name.length > 50) {
      return NextResponse.json({ error: 'Folder name must be 50 characters or less' }, { status: 400 })
    }

    // Check plan limits
    const userPlan = user.plan || 'free'
    const limits = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS]
    
    const folderCount = await Folder.countDocuments({ userId: user._id.toString() })
    if (folderCount >= limits.maxFolders) {
      return NextResponse.json({ 
        error: `You've reached the maximum number of folders (${limits.maxFolders}) for your ${limits.name} plan`,
        limit: limits.maxFolders
      }, { status: 403 })
    }

    // Check for duplicate folder name
    const existingFolder = await Folder.findOne({ 
      userId: user._id.toString(), 
      name: name.trim() 
    })

    if (existingFolder) {
      return NextResponse.json({ error: 'A folder with this name already exists' }, { status: 409 })
    }

    // Create folder
    const folder = await Folder.create({
      name: name.trim(),
      userId: user._id.toString(),
      color: color || '#3B82F6',
      icon: icon || 'Folder',
      description: description?.trim() || ''
    })

    return NextResponse.json({ folder }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating folder:', error)
    
    // Handle duplicate key error (shouldn't happen due to check above, but just in case)
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A folder with this name already exists' }, { status: 409 })
    }
    
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 })
  }
}
