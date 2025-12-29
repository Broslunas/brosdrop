
import mongoose, { Schema, model, models } from 'mongoose'


export interface ITransfer {
  _id: string
  fileKey: string
  originalName: string
  size: number
  mimeType: string
  senderEmail?: string
  senderId?: any // string | ObjectId | User object when populated
  downloads: number
  maxDownloads?: number | null
  views: number
  passwordHash?: string // Optional password protection
  customLink?: string // Optional custom link slug
  expiresAt: string
  qrOptions?: {
      fgColor?: string
      bgColor?: string
      logoUrl?: string
  }
  createdAt: string
  updatedAt: string
  blocked?: boolean
  blockedMessage?: string // Optional admin message
  isPublic?: boolean
  folderId?: string // Folder organization
  tags?: string[] // File tags for categorization
}

const TransferSchema = new Schema<ITransfer>({
  fileKey: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  senderEmail: { type: String }, // Optional if logged in
  senderId: { type: String, ref: 'User' }, // String ID but we keep ref hint locally
  downloads: { type: Number, default: 0 },
  maxDownloads: { type: Number, default: null },
  views: { type: Number, default: 0 },
  passwordHash: { type: String },
  customLink: { type: String, unique: true, sparse: true, trim: true },
  expiresAt: { type: String, required: true, index: true },
  qrOptions: {
    fgColor: { type: String, default: '#000000' },
    bgColor: { type: String, default: '#ffffff' },
    logoUrl: { type: String }
  },
  blocked: { type: Boolean, default: false },
  blockedMessage: { type: String },
  isPublic: { type: Boolean, default: true },
  folderId: { type: String, ref: 'Folder', index: true },
  tags: { type: [String], default: [], index: true }
}, { timestamps: true })

// Compound index for efficient user folder queries
TransferSchema.index({ senderId: 1, folderId: 1 })

// Force model recompilation in development to handle schema changes
if (process.env.NODE_ENV === 'development') {
  delete models.Transfer
}

const Transfer = models.Transfer || model<ITransfer>('Transfer', TransferSchema)

export default Transfer

