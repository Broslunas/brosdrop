import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import dbConnect from '@/lib/db'
import Transfer from '@/models/Transfer'
import User from '@/models/User'

// GET /api/files/search - Advanced search and filtering
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
    
    // Build query
    const query: any = { senderId: user._id.toString() }

    // Search term (filename)
    const searchTerm = searchParams.get('q')
    if (searchTerm) {
      query.originalName = { $regex: searchTerm, $options: 'i' }
    }

    // Folder filter
    const folderId = searchParams.get('folderId')
    if (folderId) {
      if (folderId === 'none') {
        query.folderId = { $exists: false }
      } else {
        query.folderId = folderId
      }
    }

    // Tags filter
    const tagsParam = searchParams.get('tags')
    if (tagsParam) {
      const tags = tagsParam.split(',').map(t => t.trim()).filter(Boolean)
      if (tags.length > 0) {
        query.tags = { $in: tags }
      }
    }

    // MIME type filter
    const mimeType = searchParams.get('mimeType')
    if (mimeType) {
      query.mimeType = { $regex: `^${mimeType}`, $options: 'i' }
    }

    // Size range filter
    const minSize = searchParams.get('minSize')
    const maxSize = searchParams.get('maxSize')
    if (minSize || maxSize) {
      query.size = {}
      if (minSize) query.size.$gte = parseInt(minSize)
      if (maxSize) query.size.$lte = parseInt(maxSize)
    }

    // Date range filter
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = startDate
      if (endDate) query.createdAt.$lte = endDate
    }

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    let sortQuery: any = {}
    switch (sortBy) {
      case 'size':
        sortQuery = { size: sortOrder === 'asc' ? 1 : -1 }
        break
      case 'downloads':
        sortQuery = { downloads: sortOrder === 'asc' ? 1 : -1 }
        break
      case 'name':
        sortQuery = { originalName: sortOrder === 'asc' ? 1 : -1 }
        break
      case 'date':
      default:
        sortQuery = { createdAt: sortOrder === 'asc' ? 1 : -1 }
        break
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Execute query
    const files = await Transfer.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Transfer.countDocuments(query)

    // Build filter summary
    const appliedFilters: any = {}
    if (searchTerm) appliedFilters.search = searchTerm
    if (folderId) appliedFilters.folder = folderId
    if (tagsParam) appliedFilters.tags = tagsParam.split(',')
    if (mimeType) appliedFilters.mimeType = mimeType
    if (minSize || maxSize) appliedFilters.sizeRange = { min: minSize, max: maxSize }
    if (startDate || endDate) appliedFilters.dateRange = { start: startDate, end: endDate }

    return NextResponse.json({
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      appliedFilters,
      sort: { by: sortBy, order: sortOrder }
    })
  } catch (error: any) {
    console.error('Error searching files:', error)
    return NextResponse.json({ error: 'Failed to search files' }, { status: 500 })
  }
}
