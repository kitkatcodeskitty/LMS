import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageUrl: { type: String },
    isAdmin: { type: Boolean, default: false },
    isSubAdmin: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "subadmin", "admin"], default: "user" },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    affiliateCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null },
    affiliateEarnings: { type: Number, default: 0 },
    withdrawableBalance: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    pendingWithdrawals: { type: Number, default: 0 }, 
    // New earnings and balance fields
    lifetimeEarnings: { type: Number, default: 0 },
    dailyEarnings: { type: Number, default: 0 },
    weeklyEarnings: { type: Number, default: 0 },
    monthlyEarnings: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    // Track admin updates
    lastAdminUpdate: { type: Date, default: null },
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
    kycStatus: { type: String, enum: ["unsubmitted", "pending", "verified", "rejected"], default: "unsubmitted" },
    phone: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

// Instance method to calculate available withdrawal balance
userSchema.methods.getAvailableBalance = function() {
  // Ensure all values are numbers and handle edge cases
  const withdrawable = Number(this.withdrawableBalance) || 0;
  const pending = Number(this.pendingWithdrawals) || 0;
  return Math.max(0, withdrawable - pending);
};

// Instance method to update withdrawable balance (100% of affiliate earnings for 50% commission)
userSchema.methods.updateWithdrawableBalance = function(affiliateAmount) {
  // Ensure affiliateAmount is a valid number
  const amount = Number(affiliateAmount) || 0;
  if (amount <= 0) {
    throw new Error('Affiliate amount must be positive');
  }
  
  const withdrawableAmount = amount; // Full affiliate amount is withdrawable (already the commission)
  this.withdrawableBalance = (Number(this.withdrawableBalance) || 0) + withdrawableAmount;
  this.affiliateEarnings = (Number(this.affiliateEarnings) || 0) + amount;
  
  // Ensure values are never negative
  this.withdrawableBalance = Math.max(0, this.withdrawableBalance);
  this.affiliateEarnings = Math.max(0, this.affiliateEarnings);
  
  return withdrawableAmount;
};

// Instance method to process withdrawal approval
userSchema.methods.processWithdrawalApproval = function(withdrawalAmount) {
  const amount = Number(withdrawalAmount) || 0;
  if (amount <= 0) {
    throw new Error('Withdrawal amount must be positive');
  }
  
  this.withdrawableBalance = Math.max(0, (Number(this.withdrawableBalance) || 0) - amount);
  this.totalWithdrawn = (Number(this.totalWithdrawn) || 0) + amount;
  this.pendingWithdrawals = Math.max(0, (Number(this.pendingWithdrawals) || 0) - amount);
};

// Instance method to process withdrawal rejection
userSchema.methods.processWithdrawalRejection = function(withdrawalAmount) {
  const amount = Number(withdrawalAmount) || 0;
  if (amount <= 0) {
    throw new Error('Withdrawal amount must be positive');
  }
  
  this.pendingWithdrawals = Math.max(0, (Number(this.pendingWithdrawals) || 0) - amount);
};

// Instance method to add pending withdrawal
userSchema.methods.addPendingWithdrawal = function(withdrawalAmount) {
  const amount = Number(withdrawalAmount) || 0;
  if (amount <= 0) {
    throw new Error('Withdrawal amount must be positive');
  }
  
  this.pendingWithdrawals = (Number(this.pendingWithdrawals) || 0) + amount;
};

// Static method to update user balance after purchase
userSchema.statics.updateBalanceAfterPurchase = async function(userId, affiliateAmount) {
  const user = await this.findById(userId);
  if (!user) throw new Error('User not found');
  
  const withdrawableAmount = user.updateWithdrawableBalance(affiliateAmount);
  await user.save();
  
  return withdrawableAmount;
};

export default mongoose.model("User", userSchema);
