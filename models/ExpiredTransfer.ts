
import mongoose, { Schema, model, models } from 'mongoose'

export interface IExpiredTransfer {
  _id: string
  transferId: string // The original Transfer _id
  fileKey: string
  originalName: string
  size: number
  mimeType: string
  senderEmail?: string
  senderId?: string
  downloads: number
  views: number
  passwordHash?: string
  hidden: boolean
  expiresAt: string
  createdAt: string
}

const ExpiredTransferSchema = new Schema<IExpiredTransfer>({
  transferId: { type: String, required: true, index: true },
  fileKey: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  senderEmail: { type: String },
  senderId: { type: String },
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  passwordHash: { type: String },
  hidden: { type: Boolean, default: false },
  expiresAt: { type: String, required: true },
}, { timestamps: true })

// Force model recompilation in development
if (process.env.NODE_ENV === 'development') {
    delete models.ExpiredTransfer
}

const ExpiredTransfer = models.ExpiredTransfer || model<IExpiredTransfer>('ExpiredTransfer', ExpiredTransferSchema)

export default ExpiredTransfer
