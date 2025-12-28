
import mongoose, { Schema, model, models } from 'mongoose'

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, unique: true },
  image: { type: String },
  emailVerified: { type: Date },
  newsletterSubscribed: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true },
  defaultPublicFiles: { type: Boolean, default: true },
  plan: { type: String, default: 'free', enum: ['free', 'plus', 'pro'] },
  defaultView: { type: String, default: 'grid', enum: ['grid', 'list'] },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  verificationToken: { type: String },
  branding: {
    logo: { type: String },
    background: { type: String },
    enabled: { type: Boolean, default: true }
  },
  planExpiresAt: { type: Date },
  blocked: { type: Boolean, default: false },
  blockedMessage: { type: String },
  userNameID: { type: String, unique: true, sparse: true, trim: true },
  isPublicProfile: { type: Boolean, default: false },
  apiKey: { type: String, unique: true, sparse: true },
  apiUsage: {
    requestsCount: { type: Number, default: 0 },
    windowStart: { type: Date, default: Date.now },
    uploadsCount: { type: Number, default: 0 },
    uploadsWindowStart: { type: Date, default: Date.now }
  }
}, { timestamps: true })

// Force model recompilation in development to handle schema changes
if (process.env.NODE_ENV === 'development') {
  delete models.User
}

const User = models.User || model('User', UserSchema)

export default User
