import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

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
    // Profile edit restriction
    hasEditedProfile: { type: Boolean, default: false },
    profileEditDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Create indexes after schema definition
// Note: email and affiliateCode indexes are automatically created by unique: true in schema
userSchema.index({ isAdmin: 1 });
userSchema.index({ isSubAdmin: 1 });
userSchema.index({ role: 1 });
userSchema.index({ referredBy: 1 });
userSchema.index({ kycStatus: 1 });
userSchema.index({ isAdmin: 1, isSubAdmin: 1 });
userSchema.index({ kycStatus: 1, createdAt: -1 });
userSchema.index({ affiliateCode: 1, isAdmin: 1 });
userSchema.index({ createdAt: -1 });

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
  try {
    const amount = Number(withdrawalAmount) || 0;
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    
    // Ensure all values are numbers and handle edge cases
    const currentWithdrawable = Number(this.withdrawableBalance) || 0;
    const currentTotalWithdrawn = Number(this.totalWithdrawn) || 0;
    const currentPending = Number(this.pendingWithdrawals) || 0;
    
    // Validate that user has sufficient balance
    if (amount > currentWithdrawable) {
      throw new Error(`Insufficient withdrawable balance. Required: ${amount}, Available: ${currentWithdrawable}`);
    }
    
    // Update balances
    this.withdrawableBalance = Math.max(0, currentWithdrawable - amount);
    this.totalWithdrawn = currentTotalWithdrawn + amount;
    this.pendingWithdrawals = Math.max(0, currentPending - amount);
    
    // Ensure values are never negative
    this.withdrawableBalance = Math.max(0, this.withdrawableBalance);
    this.totalWithdrawn = Math.max(0, this.totalWithdrawn);
    this.pendingWithdrawals = Math.max(0, this.pendingWithdrawals);
    

    
  } catch (error) {
    throw error;
  }
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

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Pre-save middleware to generate affiliate code
userSchema.pre('save', async function(next) {
  if (!this.affiliateCode) {
    try {
      let affiliateCode;
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 10) {
        affiliateCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const existingUser = await this.constructor.findOne({ affiliateCode });
        if (!existingUser) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (isUnique) {
        this.affiliateCode = affiliateCode;
      }
    } catch (error) {
      // Continue without affiliate code if generation fails
    }
  }
  next();
});

export default mongoose.model("User", userSchema);
