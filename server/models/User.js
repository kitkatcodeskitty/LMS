import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import { safeNumber, safeRound, ensurePositive } from '../utils/numberUtils.js';

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
    kycStatus: { type: String, enum: ["unsubmitted", "pending", "verified", "rejected"], default: "unsubmitted" },
    phone: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 500 },
    // Profile edit restriction
    hasEditedProfile: { type: Boolean, default: false },
    profileEditDate: { type: Date, default: null },
    highestPackage: { type: String, enum: ["elite", "creator", "prime", "master"], default: null },
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
userSchema.methods.getAvailableBalance = function () {
  // Ensure all values are numbers and handle edge cases
  const withdrawable = safeNumber(this.withdrawableBalance);
  const pending = safeNumber(this.pendingWithdrawals);
  return ensurePositive(withdrawable - pending);
};

// Instance method to update withdrawable balance (100% of affiliate earnings for 50% commission)
userSchema.methods.updateWithdrawableBalance = function (affiliateAmount) {
  // Ensure affiliateAmount is a valid number
  const amount = safeNumber(affiliateAmount);
  if (amount <= 0) {
    throw new Error('Affiliate amount must be a positive number');
  }

  const withdrawableAmount = safeRound(amount); // Full affiliate amount is withdrawable (already the commission)
  this.withdrawableBalance = safeRound(safeNumber(this.withdrawableBalance) + withdrawableAmount);
  this.affiliateEarnings = safeRound(safeNumber(this.affiliateEarnings) + amount);

  // Ensure values are never negative
  this.withdrawableBalance = ensurePositive(this.withdrawableBalance);
  this.affiliateEarnings = ensurePositive(this.affiliateEarnings);

  // Update currentBalance to match withdrawableBalance if not recently set by admin
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  if (!this.lastAdminUpdate || this.lastAdminUpdate < tenMinutesAgo) {
    this.currentBalance = this.withdrawableBalance;
  }

  return withdrawableAmount;
};

// Instance method to process withdrawal approval
userSchema.methods.processWithdrawalApproval = function (withdrawalAmount) {
  try {
    const amount = safeRound(safeNumber(withdrawalAmount));
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be a positive number');
    }

    // Ensure all values are numbers and handle edge cases
    const currentWithdrawable = safeNumber(this.withdrawableBalance);
    const currentTotalWithdrawn = safeNumber(this.totalWithdrawn);
    const currentPending = safeNumber(this.pendingWithdrawals);

    // Validate that user has sufficient balance
    if (amount > currentWithdrawable) {
      throw new Error(`Insufficient withdrawable balance. Required: ${amount}, Available: ${currentWithdrawable}`);
    }

    // Update balances with proper rounding
    this.withdrawableBalance = ensurePositive(safeRound(currentWithdrawable - amount));
    this.totalWithdrawn = safeRound(currentTotalWithdrawn + amount);
    this.pendingWithdrawals = ensurePositive(safeRound(currentPending - amount));

    // Update currentBalance to match withdrawableBalance if not recently set by admin
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    if (!this.lastAdminUpdate || this.lastAdminUpdate < tenMinutesAgo) {
      this.currentBalance = this.withdrawableBalance;
    }

  } catch (error) {
    throw error;
  }
};

// Instance method to process withdrawal rejection
userSchema.methods.processWithdrawalRejection = function (withdrawalAmount) {
  const amount = Math.round(Number(withdrawalAmount)) || 0;
  if (amount <= 0) {
    throw new Error('Withdrawal amount must be positive');
  }

  this.pendingWithdrawals = Math.max(0, (Number(this.pendingWithdrawals) || 0) - amount);
};

// Instance method to add pending withdrawal
userSchema.methods.addPendingWithdrawal = function (withdrawalAmount) {
  const amount = Math.round(Number(withdrawalAmount)) || 0;
  if (amount <= 0) {
    throw new Error('Withdrawal amount must be positive');
  }

  this.pendingWithdrawals = (Number(this.pendingWithdrawals) || 0) + amount;
};

// Instance method to get package hierarchy value for comparison
userSchema.methods.getPackageHierarchyValue = function() {
  const packageHierarchy = {
    'elite': 1,
    'creator': 2,
    'prime': 3,
    'master': 4
  };
  return this.highestPackage ? packageHierarchy[this.highestPackage] || 0 : 0;
};

// Instance method to update highest package if new package is higher
userSchema.methods.updateHighestPackage = function(newPackageType) {
  if (!newPackageType) return false;
  
  const packageHierarchy = {
    'elite': 1,
    'creator': 2,
    'prime': 3,
    'master': 4
  };
  
  const currentValue = this.getPackageHierarchyValue();
  const newValue = packageHierarchy[newPackageType] || 0;
  
  if (newValue > currentValue) {
    this.highestPackage = newPackageType;
    return true;
  }
  
  return false;
};

// Static method to update user balance after purchase
userSchema.statics.updateBalanceAfterPurchase = async function (userId, affiliateAmount) {
  const user = await this.findById(userId);
  if (!user) throw new Error('User not found');

  const withdrawableAmount = user.updateWithdrawableBalance(affiliateAmount);
  await user.save();

  return withdrawableAmount;
};

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
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
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Pre-save middleware to generate affiliate code
userSchema.pre('save', async function (next) {
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
