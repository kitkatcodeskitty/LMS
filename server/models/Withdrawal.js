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
          return value > 0 && Number.isFinite(value) && Number.isInteger(value);
        },
        message: "Invalid withdrawal amount - must be a whole number"
      },
      set: function(value) {
        const roundedValue = Math.round(Number(value)); // Ensure amount is always a whole number
        return roundedValue;
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
        enum: ["created", "updated", "approved", "rejected", "edited", "pending"],
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
    
    // Edit history for admin modifications
    editHistory: [{
      editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      editedAt: {
        type: Date,
        default: Date.now
      },
      changes: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      previousValues: {
        type: mongoose.Schema.Types.Mixed
      },
      details: {
        type: String,
        maxlength: [500, "Edit details too long"]
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
    timestamps: true
  }
);

// Create indexes after schema definition
withdrawalSchema.index({ userId: 1, status: 1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });
withdrawalSchema.index({ userId: 1, createdAt: -1 });
withdrawalSchema.index({ method: 1, status: 1 });
withdrawalSchema.index({ processedBy: 1, processedAt: -1 });

// Pre-save middleware to generate transaction reference for approved withdrawals
withdrawalSchema.pre('save', function(next) {
  try {
    if (this.isModified('status') && this.status === 'approved' && !this.transactionReference) {
      // Generate unique transaction reference with better uniqueness
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 8);
      const userId = this.userId ? this.userId.toString().substr(-4) : '0000';
      this.transactionReference = `WD${timestamp}${random}${userId}`.toUpperCase();
    }
    
    // Add audit log entry for status changes
    if (this.isModified('status') && this.auditLog && Array.isArray(this.auditLog)) {
      const lastAudit = this.auditLog[this.auditLog.length - 1];
      if (lastAudit && lastAudit.action !== this.status) {
        // Get the previous status safely
        let previousStatus = 'unknown';
        if (this._original && this._original.status) {
          previousStatus = this._original.status;
        } else if (this.auditLog.length > 0) {
          // Try to get from the last audit entry
          const lastEntry = this.auditLog[this.auditLog.length - 1];
          if (lastEntry && lastEntry.action !== this.status) {
            previousStatus = lastEntry.action;
          }
        }
        
        this.auditLog.push({
          action: this.status,
          performedBy: this.processedBy || this.userId,
          performedAt: new Date(),
          details: `Status changed to ${this.status}`,
          previousValues: { status: previousStatus }
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in withdrawal pre-save middleware:', error);
    next(error);
  }
});

// Post-save middleware to handle potential duplicate key errors
withdrawalSchema.post('save', function(error, doc, next) {
  if (error && error.code === 11000 && error.keyPattern && error.keyPattern.transactionReference) {
    // Duplicate transaction reference error - generate a new one and retry
    
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 10);
    const userId = doc.userId ? doc.userId.toString().substr(-4) : '0000';
    doc.transactionReference = `WD${timestamp}${random}${userId}`.toUpperCase();
    
    // Retry saving without the middleware to avoid infinite loop
    doc.save({ validateBeforeSave: false })
      .then(() => {
        next();
      })
      .catch((retryError) => {
        console.error('❌ Error in retry save:', retryError);
        next(retryError);
      });
  } else {
    next(error);
  }
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

// Instance method to add edit history
withdrawalSchema.methods.addEditHistory = function(adminId, changes, previousValues) {
  // Initialize editHistory array if it doesn't exist
  if (!this.editHistory) {
    this.editHistory = [];
  }
  
  this.editHistory.push({
    editedBy: adminId,
    editedAt: new Date(),
    changes: changes,
    previousValues: previousValues,
    details: `Edited by admin: ${Object.keys(changes).join(', ')}`
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