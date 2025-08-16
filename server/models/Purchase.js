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
  withdrawableAmount: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 0.5 }, // 50% default commission rate
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

// Pre-save middleware to calculate withdrawable amount
PurchaseSchema.pre('save', function(next) {
  if (this.isModified('affiliateAmount') || this.isModified('commissionRate')) {
    // Withdrawable amount is the full affiliate amount (affiliate amount is already the commission)
    this.withdrawableAmount = this.affiliateAmount;
  }
  next();
});

// Static method to calculate total withdrawable earnings for a user
PurchaseSchema.statics.getUserWithdrawableEarnings = async function(userId) {
  const result = await this.aggregate([
    {
      $match: {
        referrerId: new mongoose.Types.ObjectId(userId),
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalWithdrawable: { $sum: '$withdrawableAmount' },
        totalAffiliate: { $sum: '$affiliateAmount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { totalWithdrawable: 0, totalAffiliate: 0 };
};

export const Purchase = mongoose.model('Purchase', PurchaseSchema);
