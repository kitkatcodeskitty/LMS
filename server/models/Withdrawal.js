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
            // Validate Nepali mobile number format
            return /^(98|97)\d{8}$/.test(value);
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
        validate: {
          validator: function(value) {
            if (this.method !== "bank_transfer") return true;
            // Basic account number validation (alphanumeric, 8-20 characters)
            return /^[A-Za-z0-9]{8,20}$/.test(value);
          },
          message: "Invalid account number format"
        }
      },
      bankName: {
        type: String,
        required: function() {
          return this.method === "bank_transfer";
        },
        trim: true,
        maxlength: [100, "Bank name too long"]
      }
    },
    
    // Admin processing fields
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    processedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason too long"]
    },
    transactionReference: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    
    // Audit trail for edits
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
        type: mongoose.Schema.Types.Mixed,
        required: true
      }
    }]
  },
  { 
    timestamps: true,
    // Add compound indexes for efficient queries
    indexes: [
      { userId: 1, status: 1 },
      { status: 1, createdAt: -1 },
      { userId: 1, createdAt: -1 }
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
  next();
});

// Instance method to check if withdrawal can be edited
withdrawalSchema.methods.canBeEdited = function() {
  return this.status === 'pending';
};

// Instance method to add edit history
withdrawalSchema.methods.addEditHistory = function(editedBy, changes, previousValues) {
  this.editHistory.push({
    editedBy,
    changes,
    previousValues
  });
};

// Static method to get user's pending withdrawal amount
withdrawalSchema.statics.getUserPendingAmount = async function(userId) {
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: 'pending'
      }
    },
    {
      $group: {
        _id: null,
        totalPending: { $sum: '$amount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].totalPending : 0;
};

export default mongoose.model("Withdrawal", withdrawalSchema);