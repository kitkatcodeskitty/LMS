import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    method: {
      type: String,
      enum: ["mobile_banking", "bank_transfer"],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Withdrawal amount must be greater than 0"],
      validate: {
        validator: function(value) {
          return value > 0 && Number.isFinite(value);
        },
        message: "Invalid withdrawal amount"
      }
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    },
    
    // Mobile Banking specific fields
    mobileBankingDetails: {
      accountHolderName: {
        type: String,
        required: function() {
          return this.method === "mobile_banking";
        },
        trim: true,
        maxlength: [100, "Account holder name too long"]
      },
      mobileNumber: {
        type: String,
        required: function() {
          return this.method === "mobile_banking";
        },
        validate: {
          validator: function(value) {
            if (this.method !== "mobile_banking") return true;
            // Enhanced mobile number validation
            const cleanNumber = value.replace(/\D/g, '');
            return /^(98|97)\d{8}$/.test(cleanNumber) || /^\+?[1-9]\d{1,14}$/.test(cleanNumber);
          },
          message: "Invalid mobile number format"
        }
      },
      provider: {
        type: String,
        enum: ["eSewa", "Khalti", "IME Pay", "ConnectIPS", "Other"],
        required: function() {
          return this.method === "mobile_banking";
        }
      }
    },
    
    // Bank Transfer specific fields
    bankTransferDetails: {
      accountName: {
        type: String,
        required: function() {
          return this.method === "bank_transfer";
        },
        trim: true,
        maxlength: [100, "Account name too long"]
      },
      accountNumber: {
        type: String,
        required: function() {
          return this.method === "bank_transfer";
        },
        trim: true,
        maxlength: [50, "Account number too long"]
      },
      bankName: {
        type: String,
        required: function() {
          return this.method === "bank_transfer";
        },
        trim: true,
        maxlength: [100, "Bank name too long"]
      },
      // International transfer support
      iban: {
        type: String,
        trim: true,
        maxlength: [34, "IBAN too long"]
      },
      swiftCode: {
        type: String,
        trim: true,
        maxlength: [11, "SWIFT code too long"]
      },
      country: {
        type: String,
        trim: true,
        maxlength: [50, "Country name too long"]
      }
    },
    
    // Transaction tracking
    transactionReference: {
      type: String,
      unique: true,
      sparse: true
    },
    
    // Admin processing details
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    processedAt: {
      type: Date,
      default: null
    },
    
    // Rejection details
    rejectionReason: {
      type: String,
      maxlength: [500, "Rejection reason too long"]
    },
    
    // Audit trail
    auditLog: [{
      action: {
        type: String,
        enum: ["created", "updated", "approved", "rejected", "edited"],
        required: true
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      performedAt: {
        type: Date,
        default: Date.now
      },
      details: {
        type: String,
        maxlength: [500, "Audit details too long"]
      },
      previousValues: {
        type: mongoose.Schema.Types.Mixed
      }
    }],
    
    // Rate limiting and security
    clientIP: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true
    }
  },
  { 
    timestamps: true,
    // Add compound indexes for efficient queries
    indexes: [
      { userId: 1, status: 1 },
      { status: 1, createdAt: -1 },
      { userId: 1, createdAt: -1 },
      { method: 1, status: 1 },
      { processedBy: 1, processedAt: -1 }
    ]
  }
);

// Pre-save middleware to generate transaction reference for approved withdrawals
withdrawalSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'approved' && !this.transactionReference) {
    // Generate unique transaction reference
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.transactionReference = `WD${timestamp}${random}`.toUpperCase();
  }
  
  // Add audit log entry for status changes
  if (this.isModified('status') && this.auditLog && this.auditLog.length > 0) {
    const lastAudit = this.auditLog[this.auditLog.length - 1];
    if (lastAudit.action !== this.status) {
      this.auditLog.push({
        action: this.status,
        performedBy: this.processedBy || this.userId,
        performedAt: new Date(),
        details: `Status changed to ${this.status}`,
        previousValues: { status: this._original?.status }
      });
    }
  }
  
  next();
});

// Instance method to check if withdrawal can be edited
withdrawalSchema.methods.canBeEdited = function() {
  return this.status === 'pending';
};

// Instance method to add audit log entry
withdrawalSchema.methods.addAuditLog = function(action, performedBy, details, previousValues = null) {
  this.auditLog.push({
    action,
    performedBy,
    performedAt: new Date(),
    details,
    previousValues
  });
};

// Static method to get withdrawal statistics
withdrawalSchema.statics.getStatistics = async function(userId = null) {
  const matchStage = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" }
      }
    }
  ]);
  
  const result = {
    pending: { count: 0, totalAmount: 0 },
    approved: { count: 0, totalAmount: 0 },
    rejected: { count: 0, totalAmount: 0 }
  };
  
  stats.forEach(stat => {
    if (result[stat._id]) {
      result[stat._id].count = stat.count;
      result[stat._id].totalAmount = stat.totalAmount;
    }
  });
  
  return result;
};

export default mongoose.model("Withdrawal", withdrawalSchema);