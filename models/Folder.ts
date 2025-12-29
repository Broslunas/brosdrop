
import mongoose, { Schema, model, models } from 'mongoose'

export interface IFolder {
  _id: string
  name: string
  userId: string
  parentId?: string
  color?: string
  icon?: string
  description?: string
  createdAt: string
  updatedAt: string
}

const FolderSchema = new Schema<IFolder>({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  userId: { type: String, required: true, ref: 'User', index: true },
  parentId: { type: String, ref: 'Folder' }, // For future nested folders support
  color: { type: String, default: '#3B82F6' }, // Default blue
  icon: { type: String, default: 'Folder' }, // Default folder icon
  description: { type: String, maxlength: 200 }
}, { timestamps: true })

// Compound index to prevent duplicate folder names per user
FolderSchema.index({ userId: 1, name: 1 }, { unique: true })

// Force model recompilation in development to handle schema changes
if (process.env.NODE_ENV === 'development') {
  delete models.Folder
}

const Folder = models.Folder || model<IFolder>('Folder', FolderSchema)

export default Folder
