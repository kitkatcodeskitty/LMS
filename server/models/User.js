import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageUrl: { type: String },
    isAdmin: { type: Boolean, default: true },
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
  return Math.max(0, this.withdrawableBalance - this.pendingWithdrawals);
};

// Instance method to update withdrawable balance (100% of affiliate earnings for 50% commission)
userSchema.methods.updateWithdrawableBalance = function(affiliateAmount) {
  const withdrawableAmount = affiliateAmount; // Full affiliate amount is withdrawable (already 50% of course price)
  this.withdrawableBalance += withdrawableAmount;
  this.affiliateEarnings += affiliateAmount;
  return withdrawableAmount;
};

// Instance method to process withdrawal approval
userSchema.methods.processWithdrawalApproval = function(withdrawalAmount) {
  this.withdrawableBalance -= withdrawalAmount;
  this.totalWithdrawn += withdrawalAmount;
  this.pendingWithdrawals -= withdrawalAmount;
};

// Instance method to process withdrawal rejection
userSchema.methods.processWithdrawalRejection = function(withdrawalAmount) {
  this.pendingWithdrawals -= withdrawalAmount;
};

// Instance method to add pending withdrawal
userSchema.methods.addPendingWithdrawal = function(withdrawalAmount) {
  this.pendingWithdrawals += withdrawalAmount;
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
