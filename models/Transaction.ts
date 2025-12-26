
import mongoose, { Schema, model, models } from 'mongoose'

const TransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  paypalOrderId: { type: String, required: true },
  plan: { type: String, required: true }, // 'plus' | 'pro'
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, default: 'completed' }, // completed, refunded, etc.
  duration: { type: String }, // 'monthly', 'annual'
}, { timestamps: true })

// Force model recompilation in development
if (process.env.NODE_ENV === 'development') {
    delete models.Transaction
}

const Transaction = models.Transaction || model('Transaction', TransactionSchema)

export default Transaction
