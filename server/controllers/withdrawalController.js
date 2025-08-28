import mongoose from "mongoose";
import Withdrawal from "../models/Withdrawal.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";
import { 
  notifyWithdrawalSubmitted, 
  notifyAdminNewWithdrawal,
  sendWithdrawalEmailNotification 
} from "../utils/withdrawalNotifications.js";
import {
  validateWithdrawalRequest,
  validateUserPermissions,
  createErrorResponse,
  createSuccessResponse,
  VALIDATION_ERRORS
} from "../utils/withdrawalValidation.js";
import { markSuspiciousActivity } from "../middleware/rateLimiter.js";

// Helper function to get appropriate HTTP status code for error
const getStatusCodeForError = (errorCode) => {
  const statusMap = {
    [VALIDATION_ERRORS.MISSING_REQUIRED_FIELDS]: 400,
    [VALIDATION_ERRORS.INVALID_METHOD]: 400,
    [VALIDATION_ERRORS.INVALID_AMOUNT]: 400,
    [VALIDATION_ERRORS.INSUFFICIENT_BALANCE]: 400,
    [VALIDATION_ERRORS.USER_NOT_FOUND]: 404,
    [VALIDATION_ERRORS.MISSING_MOBILE_BANKING_DETAILS]: 400,
    [VALIDATION_ERRORS.INVALID_MOBILE_NUMBER]: 400,
    [VALIDATION_ERRORS.INVALID_PROVIDER]: 400,
    [VALIDATION_ERRORS.INVALID_ACCOUNT_HOLDER_NAME]: 400,
    [VALIDATION_ERRORS.MISSING_BANK_TRANSFER_DETAILS]: 400,
    [VALIDATION_ERRORS.INVALID_ACCOUNT_NUMBER]: 400,
    [VALIDATION_ERRORS.INVALID_BANK_NAME]: 400,
    [VALIDATION_ERRORS.INVALID_ACCOUNT_NAME]: 400,
    [VALIDATION_ERRORS.DUPLICATE_REQUEST]: 409,
    [VALIDATION_ERRORS.UNAUTHORIZED_ACCESS]: 403,
    [VALIDATION_ERRORS.INVALID_USER_PERMISSIONS]: 403,
    [VALIDATION_ERRORS.ACCOUNT_SUSPENDED]: 403,
    [VALIDATION_ERRORS.TOO_MANY_REQUESTS]: 429,
    [VALIDATION_ERRORS.SUSPICIOUS_ACTIVITY]: 403,
    [VALIDATION_ERRORS.VALIDATION_ERROR]: 400,
    [VALIDATION_ERRORS.INTERNAL_SERVER_ERROR]: 500
  };
  
  return statusMap[errorCode] || 400;
};

// Create withdrawal request
export const createWithdrawalRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestData = req.body;

    // Get user with session for transaction
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(
        createErrorResponse(VALIDATION_ERRORS.USER_NOT_FOUND, "User not found")
      );
    }

    // Get client IP address for rate limiting and audit
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                    (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // Comprehensive validation with enhanced security
    const validation = await validateWithdrawalRequest(requestData, user, clientIP);
    if (!validation.valid) {
      const statusCode = getStatusCodeForError(validation.error.code);
      
      // Mark suspicious activity for certain error types
      if ([
        VALIDATION_ERRORS.SUSPICIOUS_ACTIVITY,
        VALIDATION_ERRORS.TOO_MANY_REQUESTS,
        VALIDATION_ERRORS.DUPLICATE_REQUEST
      ].includes(validation.error.code)) {
        markSuspiciousActivity(userId, `Validation failed: ${validation.error.code}`);
      }
      
      return res.status(statusCode).json(createErrorResponse(
        validation.error.code,
        validation.error.message,
        validation.error.details
      ));
    }

    // Use sanitized data from validation
    const { method, amount, mobileBankingDetails, bankTransferDetails } = validation.sanitizedData;

    // Start database transaction for data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create withdrawal request with sanitized data and audit info
      const withdrawalData = {
        userId,
        method,
        amount: Math.round(Number(amount)), // Ensure amount is a whole number
        status: 'pending',
        clientIP,
        userAgent: req.get('User-Agent') || 'Unknown'
      };

      if (method === 'mobile_banking') {
        withdrawalData.mobileBankingDetails = mobileBankingDetails;
      } else {
        withdrawalData.bankTransferDetails = bankTransferDetails;
      }

      const withdrawal = new Withdrawal(withdrawalData);
      
      // Add initial audit log entry
      withdrawal.addAuditLog('created', userId, 'Withdrawal request created');
      
      await withdrawal.save({ session });

      // Update user's pending withdrawals
      user.addPendingWithdrawal(amount);
      await user.save({ session });

      // Commit transaction
      await session.commitTransaction();

      // Send notifications (outside transaction to avoid blocking)
      try {
        await notifyWithdrawalSubmitted(userId, amount, method);
        
        // Notify admin users about new withdrawal request
        const adminUsers = await User.find({ 
          $or: [{ isAdmin: true }, { isSubAdmin: true }, { role: { $in: ['admin', 'subadmin'] } }] 
        });
        
        if (adminUsers.length > 0) {
          await notifyAdminNewWithdrawal(adminUsers, user, amount, method);
        }

        // Send email notification if email service is available
        await sendWithdrawalEmailNotification(user.email, 'submitted', {
          amount,
          method,
          withdrawalId: withdrawal._id
        });

        // Create in-app notification for user
        await createNotification(
          userId,
          "Withdrawal Request Submitted 💰",
          `Your withdrawal request of ₹${amount} via ${method === 'mobile_banking' ? 'Mobile Banking' : 'Bank Transfer'} has been submitted successfully. We'll process it within 1-3 business days.`,
          "info",
          null,
          "withdrawal_submitted"
        );

        // Create notifications for admin users
        for (const admin of adminUsers) {
          await createNotification(
            admin._id,
            "New Withdrawal Request 🔔",
            `A new withdrawal request of ₹${amount} has been submitted by ${user.firstName} ${user.lastName} via ${method === 'mobile_banking' ? 'Mobile Banking' : 'Bank Transfer'}.`,
            "info",
            null,
            "admin_new_withdrawal"
          );
        }
      } catch (notificationError) {
        // Don't fail the request if notifications fail
      }

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Withdrawal request submitted successfully',
        data: {
          withdrawal: {
            _id: withdrawal._id,
            amount: withdrawal.amount,
            method: withdrawal.method,
            status: withdrawal.status,
            createdAt: withdrawal.createdAt
          },
          availableBalance: user.getAvailableBalance(),
          pendingWithdrawals: user.pendingWithdrawals
        }
      });

    } catch (transactionError) {
      // Rollback transaction on error
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }

  } catch (error) {
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json(
        createErrorResponse(VALIDATION_ERRORS.VALIDATION_FAILED, 'Validation failed', error.message)
      );
    }
    
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(409).json(
        createErrorResponse(VALIDATION_ERRORS.DUPLICATE_REQUEST, 'Duplicate withdrawal request detected')
      );
    }
    
    res.status(500).json(
      createErrorResponse(VALIDATION_ERRORS.INTERNAL_SERVER_ERROR, 'Internal server error')
    );
  }
};

// Get user's withdrawal history
export const getUserWithdrawalHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validate and sanitize query parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10)); // Limit max to 50
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Validate status parameter
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json(createErrorResponse(
        VALIDATION_ERRORS.INVALID_METHOD,
        "Invalid status filter. Must be one of: pending, approved, rejected"
      ));
    }

    // Validate sortBy parameter
    const allowedSortFields = ['createdAt', 'amount', 'status', 'processedAt'];
    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json(createErrorResponse(
        VALIDATION_ERRORS.VALIDATION_ERROR,
        `Invalid sort field. Must be one of: ${allowedSortFields.join(', ')}`
      ));
    }

    // Build query
    const query = { userId };
    if (status) {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get withdrawals with pagination
    const withdrawals = await Withdrawal.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('processedBy', 'firstName lastName')
      .lean();

    // Get total count for pagination
    const totalCount = await Withdrawal.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Format response data with proper sanitization
    const formattedWithdrawals = withdrawals.map(withdrawal => ({
      _id: withdrawal._id,
      method: withdrawal.method,
      amount: withdrawal.amount,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt,
      processedAt: withdrawal.processedAt,
      transactionReference: withdrawal.transactionReference,
      rejectionReason: withdrawal.rejectionReason,
      processedBy: withdrawal.processedBy ? {
        name: `${withdrawal.processedBy.firstName} ${withdrawal.processedBy.lastName}`
      } : null,
      paymentDetails: withdrawal.method === 'mobile_banking' 
        ? withdrawal.mobileBankingDetails 
        : withdrawal.bankTransferDetails
    }));

    res.status(200).json(createSuccessResponse(
      "Withdrawal history retrieved successfully",
      {
        withdrawals: formattedWithdrawals,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    ));

  } catch (error) {
    res.status(500).json(createErrorResponse(
      VALIDATION_ERRORS.INTERNAL_SERVER_ERROR,
      "An error occurred while fetching withdrawal history"
    ));
  }
};

// Get user's available balance
export const getAvailableBalance = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(createErrorResponse(
        VALIDATION_ERRORS.USER_NOT_FOUND,
        "User not authenticated"
      ));
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(createErrorResponse(
        VALIDATION_ERRORS.USER_NOT_FOUND,
        "User not found"
      ));
    }

    let pendingAmount = 0;
    try {
      pendingAmount = await Withdrawal.getUserPendingAmount(userId);
    } catch (err) {
      pendingAmount = user.pendingWithdrawals || 0;
    }

    // Update user's pending withdrawals if they're out of sync
    if (user.pendingWithdrawals !== pendingAmount) {
      user.pendingWithdrawals = pendingAmount;
      try {
        await user.save();
      } catch (err) {
        // Silent error handling for pending withdrawals sync
      }
    }

    let availableBalance = 0;
    try {
      availableBalance = user.getAvailableBalance();
    } catch (err) {
      availableBalance = user.withdrawableBalance - user.pendingWithdrawals;
    }

    // Validate that all balance values are valid numbers
    const balanceData = {
      withdrawableBalance: Number(user.withdrawableBalance) || 0,
      pendingWithdrawals: Number(user.pendingWithdrawals) || 0,
      availableBalance: Number(availableBalance) || 0,
      totalWithdrawn: Number(user.totalWithdrawn) || 0,
      affiliateEarnings: Number(user.affiliateEarnings) || 0
    };

    // Ensure no negative values
    Object.keys(balanceData).forEach(key => {
      if (balanceData[key] < 0 || isNaN(balanceData[key])) {
        balanceData[key] = 0;
      }
    });

    res.status(200).json(createSuccessResponse(
      "Balance information retrieved successfully",
      balanceData
    ));

  } catch (error) {
    res.status(500).json(createErrorResponse(
      VALIDATION_ERRORS.INTERNAL_SERVER_ERROR,
      error?.message || "An error occurred while fetching available balance"
    ));
  }
};

// Helper function to validate withdrawal amount against available balance
export const validateWithdrawalAmount = async (userId, amount) => {
  try {
    // Input validation
    if (!userId) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.USER_NOT_FOUND,
          message: "User ID is required"
        }
      };
    }

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.INVALID_AMOUNT,
          message: "Amount must be a positive number"
        }
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.USER_NOT_FOUND,
          message: "User not found"
        }
      };
    }

    // Validate user permissions
    const userPermissionCheck = validateUserPermissions(user);
    if (!userPermissionCheck.valid) {
      return userPermissionCheck;
    }

    const availableBalance = user.getAvailableBalance();
    
    if (amount > availableBalance) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.INSUFFICIENT_BALANCE,
          message: "Withdrawal amount exceeds available balance",
          details: {
            requestedAmount: amount,
            availableBalance: availableBalance
          }
        }
      };
    }

    return {
      valid: true,
      availableBalance: availableBalance,
      user: {
        withdrawableBalance: user.withdrawableBalance,
        pendingWithdrawals: user.pendingWithdrawals
      }
    };

  } catch (error) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.INTERNAL_SERVER_ERROR,
        message: "An error occurred during validation"
      }
    };
  }
};