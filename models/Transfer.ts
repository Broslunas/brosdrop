
import mongoose, { Schema, model, models } from 'mongoose'


export interface ITransfer {
  _id: string
  fileKey: string
  originalName: string
  size: number
  mimeType: string
  senderEmail?: string
  senderId?: string
  downloads: number
  expiresAt: string
  createdAt: string
  updatedAt: string
}

const TransferSchema = new Schema<ITransfer>({
  fileKey: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  senderEmail: { type: String }, // Optional if logged in
  senderId: { type: String }, // Link to NextAuth user ID
  downloads: { type: Number, default: 0 },
  expiresAt: { type: String, required: true, index: true },
}, { timestamps: true })

const Transfer = models.Transfer || model<ITransfer>('Transfer', TransferSchema)

export default Transfer

