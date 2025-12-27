import mongoose from 'mongoose';

const cloudTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  provider: {
    type: String,
    required: true,
    enum: ['google-drive', 'dropbox', 'onedrive'],
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  expiresAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for userId and provider
cloudTokenSchema.index({ userId: 1, provider: 1 }, { unique: true });

const CloudToken = mongoose.models.CloudToken || mongoose.model('CloudToken', cloudTokenSchema);

export default CloudToken;
