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
  commissionRate: { type: Number, default: 0.6 }, // 60% default commission rate
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

// Pre-save middleware to calculate withdrawable amount and validate data
PurchaseSchema.pre('save', function(next) {
  // Ensure all numeric fields are valid numbers
  if (this.amount !== undefined) {
    this.amount = Number(this.amount) || 0;
  }
  
  if (this.affiliateAmount !== undefined) {
    this.affiliateAmount = Number(this.affiliateAmount) || 0;
  }
  
  if (this.commissionRate !== undefined) {
    this.commissionRate = Number(this.commissionRate) || 0.6;
  }
  
  // Calculate withdrawable amount when affiliate amount changes
  if (this.isModified('affiliateAmount') || this.isModified('commissionRate')) {
    // Withdrawable amount is the full affiliate amount (affiliate amount is already the commission)
    this.withdrawableAmount = Math.max(0, this.affiliateAmount);
  }
  
  // Validate that amounts are never negative
  if (this.amount < 0) {
    return next(new Error('Purchase amount cannot be negative'));
  }
  
  if (this.affiliateAmount < 0) {
    return next(new Error('Affiliate amount cannot be negative'));
  }
  
  if (this.commissionRate < 0 || this.commissionRate > 1) {
    return next(new Error('Commission rate must be between 0 and 1'));
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
