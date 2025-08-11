import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  amount: { type: Number, required: true },
  affiliateAmount: { type: Number, default: 0 },
  referralCode: { type: String, default: null },
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  transactionId: { type: String },
  paymentScreenshot: { type: String },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

export const Purchase = mongoose.model('Purchase', PurchaseSchema);
