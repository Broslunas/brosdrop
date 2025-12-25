
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
  verificationToken: { type: String },
}, { timestamps: true })

// Force model recompilation in development to handle schema changes
if (process.env.NODE_ENV === 'development') {
  delete models.User
}

const User = models.User || model('User', UserSchema)

export default User
