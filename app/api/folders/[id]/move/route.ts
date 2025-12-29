import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import dbConnect from '@/lib/db'
import Transfer from '@/models/Transfer'
import User from '@/models/User'

// POST /api/folders/[id]/move - Move files to folder
export async function POST(
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

    const body = await req.json()
    const { fileIds } = body

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: 'fileIds must be a non-empty array' }, { status: 400 })
    }

    // Verify all files belong to user
    const files = await Transfer.find({
      _id: { $in: fileIds },
      senderId: user._id.toString()
    })

    if (files.length !== fileIds.length) {
      return NextResponse.json({ error: 'Some files not found or do not belong to you' }, { status: 404 })
    }

    // Move files to folder (or remove from folder if id is 'none')
    const updateData = id === 'none' 
      ? { $unset: { folderId: "" } }
      : { folderId: id }

    const result = await Transfer.updateMany(
      { _id: { $in: fileIds } },
      updateData
    )

    return NextResponse.json({ 
      message: `${result.modifiedCount} file(s) moved successfully`,
      movedCount: result.modifiedCount
    })
  } catch (error: any) {
    console.error('Error moving files:', error)
    return NextResponse.json({ error: 'Failed to move files' }, { status: 500 })
  }
}
