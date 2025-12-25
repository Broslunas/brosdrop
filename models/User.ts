
import mongoose, { Schema, model, models } from 'mongoose'

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, unique: true },
  image: { type: String },
  emailVerified: { type: Date },
  newsletterSubscribed: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true },
}, { timestamps: true })

const User = models.User || model('User', UserSchema)

export default User
