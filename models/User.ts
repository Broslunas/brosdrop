
import mongoose, { Schema, model, models } from 'mongoose'

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, unique: true },
  image: { type: String },
  emailVerified: { type: Date },
  newsletterSubscribed: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true },
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
  apiKey: { type: String, unique: true, sparse: true }
}, { timestamps: true })

// Force model recompilation in development to handle schema changes
if (process.env.NODE_ENV === 'development') {
  delete models.User
}

const User = models.User || model('User', UserSchema)

export default User
