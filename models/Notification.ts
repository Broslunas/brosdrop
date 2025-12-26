
import mongoose, { Schema, model, models } from 'mongoose'

export interface INotification {
  transferId: string
  type: 'sevenDays' | 'oneDay' | 'fourHours'
  sentAt: Date
  recipientEmail?: string
}

const NotificationSchema = new Schema<INotification>({
  transferId: { type: String, required: true, index: true },
  type: { type: String, enum: ['sevenDays', 'oneDay', 'fourHours'], required: true },
  sentAt: { type: Date, default: Date.now },
  recipientEmail: { type: String }
}, { timestamps: true })

// Ensure we don't send the same type of notification twice for the same transfer
NotificationSchema.index({ transferId: 1, type: 1 }, { unique: true })

// Force model recompilation in development
if (process.env.NODE_ENV === 'development') {
  delete models.Notification
}

const Notification = models.Notification || model<INotification>('Notification', NotificationSchema)

export default Notification
