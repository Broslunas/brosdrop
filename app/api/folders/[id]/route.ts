import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import dbConnect from '@/lib/db'
import Folder from '@/models/Folder'
import Transfer from '@/models/Transfer'
import User from '@/models/User'

// GET /api/folders/[id] - Get folder details with files
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const folder = await Folder.findById(id)
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    // Verify ownership
    if (folder.userId !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get pagination params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Get files in folder
    const files = await Transfer.find({ 
      senderId: user._id.toString(),
      folderId: id
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalFiles = await Transfer.countDocuments({
      senderId: user._id.toString(),
      folderId: id
    })

    return NextResponse.json({
      folder,
      files,
      pagination: {
        page,
        limit,
        total: totalFiles,
        pages: Math.ceil(totalFiles / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching folder:', error)
    return NextResponse.json({ error: 'Failed to fetch folder' }, { status: 500 })
  }
}

// PUT /api/folders/[id] - Update folder
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const folder = await Folder.findById(id)
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    // Verify ownership
    if (folder.userId !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, color, icon, description } = body

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Folder name cannot be empty' }, { status: 400 })
      }

      if (name.length > 50) {
        return NextResponse.json({ error: 'Folder name must be 50 characters or less' }, { status: 400 })
      }

      // Check for duplicate name (excluding current folder)
      const existingFolder = await Folder.findOne({
        userId: user._id.toString(),
        name: name.trim(),
        _id: { $ne: id }
      })

      if (existingFolder) {
        return NextResponse.json({ error: 'A folder with this name already exists' }, { status: 409 })
      }

      folder.name = name.trim()
    }

    if (color !== undefined) folder.color = color
    if (icon !== undefined) folder.icon = icon
    if (description !== undefined) folder.description = description.trim()

    await folder.save()

    return NextResponse.json({ folder })
  } catch (error: any) {
    console.error('Error updating folder:', error)
    return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 })
  }
}

// DELETE /api/folders/[id] - Delete folder
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const folder = await Folder.findById(id)
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    // Verify ownership
    if (folder.userId !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Move files to root (Option A from implementation plan)
    await Transfer.updateMany(
      { folderId: id },
      { $unset: { folderId: "" } }
    )

    // Delete folder
    await Folder.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Folder deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting folder:', error)
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 })
  }
}
