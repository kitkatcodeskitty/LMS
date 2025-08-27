
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { Purchase } from '../models/Purchase.js';
import Withdrawal from '../models/Withdrawal.js';
import mongoose from 'mongoose';
import { createNotification } from './notificationController.js';
import { 
  notifyWithdrawalApproved, 
  notifyWithdrawalRejected, 
  notifyWithdrawalEdited,
  sendWithdrawalEmailNotification 
} from '../utils/withdrawalNotifications.js';


// naya course admin leh halni 
export const addCourse = async (req, res) => {
  try {
    const imageFile = req.file;
    const userId = req.user.id;
    const body = req.body;

    if (!imageFile) {
      return res.json({ success: false, message: 'Thumbnail not Attached' });
    }

    let parsedCourseData;
    if (typeof body.courseData === 'string') {
      parsedCourseData = JSON.parse(body.courseData);
    } else {
      parsedCourseData = body.courseData || body;
    }
    parsedCourseData.admin = userId;

    if (parsedCourseData.isPublished === undefined) {
      parsedCourseData.isPublished = false;
    }

    const newCourse = await Course.create(parsedCourseData);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      folder: "course_thumbnails",
      quality: "auto",
      fetch_format: "auto",
      flags: "preserve_transparency"
    });
    newCourse.courseThumbnail = imageUpload.secure_url;
    await newCourse.save();

    res.json({ success: true, message: 'Course Added' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



// admin ko dashboard
export const adminDashboardData = async (req, res) => {
  try {
    const adminId = req.user.id;
    const completedPurchases = await Purchase.find({ status: "completed" })
      .populate('courseId', 'courseTitle coursePrice packageType')
      .populate('userId', 'firstName lastName email')
      .populate('referrerId', 'firstName lastName email highestPackage');

    const courses = await Course.find({}).select('courseTitle coursePrice packageType');
    const totalRevenue = 0;
    const totalAffiliateOutflow = 0;
    const enrolledStudentsData = [];

    completedPurchases.forEach(purchase => {
      const course = courses.find(c => c._id.toString() === purchase.courseId.toString());
      
      if (course) {
        const courseRevenue = purchase.amount || course.coursePrice;
        totalRevenue += courseRevenue;
        
        // Calculate affiliate outflow if referral code was used
        if (purchase.referralCode || purchase.referrerId) {
          // Use the actual affiliate amount from the purchase record
          // This will already be calculated using the new package hierarchy system
          const affiliateAmount = purchase.affiliateAmount || 0;
          totalAffiliateOutflow += affiliateAmount;
        }

        // Add to enrolled students if not already added
        const existingStudent = enrolledStudentsData.find(
          student => student.student._id.toString() === purchase.userId.toString()
        );
        
        if (!existingStudent) {
          enrolledStudentsData.push({
            courseTitle: course.courseTitle,
            student: { _id: purchase.userId },
            referralCode: purchase.referralCode || null,
            transactionId: purchase.transactionId,
            paymentScreenshot: purchase.paymentScreenshot,
            revenue: courseRevenue,
            affiliateOutflow: (purchase.referralCode || purchase.referrerId) ? (purchase.affiliateAmount || 0) : 0
          });
        }
      }
    });

    // Calculate profit (revenue - affiliate outflow)
    const totalProfit = totalRevenue - totalAffiliateOutflow;
    
    // Calculate percentages
    const profitPercentage = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;
    const affiliatePercentage = totalRevenue > 0 ? ((totalAffiliateOutflow / totalRevenue) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      dashboardData: {
        totalRevenue,
        totalProfit,
        totalAffiliateOutflow,
        profitPercentage,
        affiliatePercentage,
        enrolledStudentsData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};







// get all purchase and user details sabai dinxa yesle 
export const getAllPurchasesWithUserAndCourse = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('userId', 'firstName lastName email')
      .populate('courseId', 'courseTitle coursePrice')
      .populate('referrerId', 'firstName lastName email affiliateCode');

    res.status(200).json({
      success: true,
      totalPurchases: purchases.length,
      purchases,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// get all enrolled students (unique users who have made purchases)
export const getAllEnrolledStudents = async (req, res) => {
  try {
    // Get all purchases with user and course details
    const purchases = await Purchase.find()
      .populate('userId', 'firstName lastName email affiliateCode affiliateEarnings isAdmin imageUrl referredBy dailyEarnings weeklyEarnings monthlyEarnings lifetimeEarnings withdrawableBalance totalWithdrawn pendingWithdrawals currentBalance')
      .populate('courseId', 'courseTitle coursePrice')
      .populate('referrerId', 'firstName lastName email affiliateCode');

    // Group purchases by user to get unique students
    const userPurchaseMap = new Map();

    purchases.forEach(purchase => {
      if (purchase.userId) {
        const userId = purchase.userId._id.toString();
        if (!userPurchaseMap.has(userId)) {
          userPurchaseMap.set(userId, {
            userDetails: purchase.userId,
            purchases: [],
            totalSpent: 0,
            totalCourses: 0,
            totalAffiliateEarned: 0,
            referralCount: 0,
            firstPurchase: purchase.createdAt,
            lastPurchase: purchase.createdAt,
            hasReferralCode: false,
            referredByCount: 0
          });
        }

        const userData = userPurchaseMap.get(userId);
        userData.purchases.push(purchase);
        userData.totalSpent += purchase.amount || 0;
        userData.totalCourses += 1;

        // Track affiliate earnings from this purchase
        if (purchase.affiliateAmount) {
          userData.totalAffiliateEarned += purchase.affiliateAmount;
        }

        // Track if user has referral code
        if (purchase.referralCode) {
          userData.hasReferralCode = true;
        }

        // Update first and last purchase dates
        if (new Date(purchase.createdAt) < new Date(userData.firstPurchase)) {
          userData.firstPurchase = purchase.createdAt;
        }
        if (new Date(purchase.createdAt) > new Date(userData.lastPurchase)) {
          userData.lastPurchase = purchase.createdAt;
        }
      }
    });

    // Count referrals made by each user
    purchases.forEach(purchase => {
      if (purchase.referrerId && userPurchaseMap.has(purchase.referrerId._id.toString())) {
        userPurchaseMap.get(purchase.referrerId._id.toString()).referralCount += 1;
      }
    });

    const enrolledStudents = Array.from(userPurchaseMap.values());

    res.status(200).json({
      success: true,
      totalStudents: enrolledStudents.length,
      totalPurchases: purchases.length,
      purchases: enrolledStudents, // Keep the same structure for frontend compatibility
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// make user admin by email
export const makeUserAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Check if user is already an admin
    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'User is already an admin'
      });
    }

    // Update user to admin
    user.isAdmin = true;
    user.role = 'admin';
    await user.save();

    res.json({
      success: true,
      message: `${user.firstName} ${user.lastName} has been made an admin successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin can update affiliateAmount on a purchase
export const setAffiliateAmount = async (req, res) => {
  try {
    const { purchaseId, affiliateAmount, commissionRate } = req.body;
    if (!purchaseId || typeof affiliateAmount === 'undefined') {
      return res.status(400).json({ success: false, message: 'purchaseId and affiliateAmount are required' });
    }
    const amountNum = Number(affiliateAmount);
    if (Number.isNaN(amountNum) || amountNum < 0) {
      return res.status(400).json({ success: false, message: 'affiliateAmount must be a non-negative number' });
    }

    // Get the current purchase to calculate balance changes
    const currentPurchase = await Purchase.findById(purchaseId).populate('referrerId');
    if (!currentPurchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Calculate the difference in withdrawable amounts
      const oldWithdrawableAmount = currentPurchase.withdrawableAmount || 0;
      const newCommissionRate = commissionRate !== undefined ? Number(commissionRate) : (currentPurchase.commissionRate || 0.6);
      const newWithdrawableAmount = amountNum; // Full affiliate amount is withdrawable
      const withdrawableAmountDifference = newWithdrawableAmount - oldWithdrawableAmount;

      // Update the purchase
      const updateData = { 
        affiliateAmount: amountNum,
        withdrawableAmount: newWithdrawableAmount
      };
      if (commissionRate !== undefined) {
        updateData.commissionRate = newCommissionRate;
      }

      const purchase = await Purchase.findByIdAndUpdate(
        purchaseId,
        updateData,
        { new: true, session }
      ).populate('userId', 'firstName lastName email')
       .populate('courseId', 'courseTitle coursePrice')
       .populate('referrerId', 'firstName lastName email affiliateCode');

      // Update referrer's withdrawable balance if there's a referrer and amount changed
      if (purchase.referrerId && withdrawableAmountDifference !== 0) {
        const referrer = await User.findById(purchase.referrerId._id).session(session);
        if (referrer) {
          // Update affiliate earnings difference
          const affiliateAmountDifference = amountNum - currentPurchase.affiliateAmount;
          referrer.affiliateEarnings += affiliateAmountDifference;
          referrer.withdrawableBalance += withdrawableAmountDifference;
          await referrer.save({ session });

          // Update earnings fields for the referrer
          try {
            const { updateUserEarningsFields } = await import('../utils/balanceHelpers.js');
            await updateUserEarningsFields(referrer._id, 0); // 0 means just recalculate existing data
          } catch (error) {
            console.error('Error updating earnings fields:', error);
          }
        }
      }

      await session.commitTransaction();
      return res.status(200).json({ 
        success: true, 
        purchase,
        balanceChange: {
          withdrawableAmountDifference,
          newWithdrawableAmount
        }
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all pending withdrawal requests
export const getPendingWithdrawals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder;

    // Get pending withdrawals with user details
    const withdrawals = await Withdrawal.find({ status: 'pending' })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email kycStatus')
      .lean();

    const totalCount = await Withdrawal.countDocuments({ status: 'pending' });
    const totalPages = Math.ceil(totalCount / limit);

    // Format response data
    const formattedWithdrawals = withdrawals.map(withdrawal => ({
      _id: withdrawal._id,
      user: {
        _id: withdrawal.userId._id,
        name: `${withdrawal.userId.firstName} ${withdrawal.userId.lastName}`,
        email: withdrawal.userId.email,
        kycStatus: withdrawal.userId.kycStatus
      },
      method: withdrawal.method,
      amount: withdrawal.amount,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt,
      paymentDetails: withdrawal.method === 'mobile_banking' 
        ? withdrawal.mobileBankingDetails 
        : withdrawal.bankTransferDetails
    }));

    res.status(200).json({
      success: true,
      data: {
        withdrawals: formattedWithdrawals,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching pending withdrawals:', error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An error occurred while fetching pending withdrawals"
      }
    });
  }
};

// Get all withdrawals with filtering
export const getAllWithdrawals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const method = req.query.method;
    const userId = req.query.userId;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }
    if (method && ['mobile_banking', 'bank_transfer'].includes(method)) {
      query.method = method;
    }
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder;

    // Get withdrawals with user and processor details
    const withdrawals = await Withdrawal.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email kycStatus')
      .populate('processedBy', 'firstName lastName')
      .lean();

    const totalCount = await Withdrawal.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Format response data
    const formattedWithdrawals = withdrawals.map(withdrawal => ({
      _id: withdrawal._id,
      user: {
        _id: withdrawal.userId._id,
        name: `${withdrawal.userId.firstName} ${withdrawal.userId.lastName}`,
        email: withdrawal.userId.email,
        kycStatus: withdrawal.userId.kycStatus
      },
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
        : withdrawal.bankTransferDetails,
      editHistory: withdrawal.editHistory
    }));

    res.status(200).json({
      success: true,
      data: {
        withdrawals: formattedWithdrawals,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An error occurred while fetching withdrawals"
      }
    });
  }
};

// Approve withdrawal request
export const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { transactionReference } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_WITHDRAWAL_ID",
          message: "Invalid withdrawal ID"
        }
      });
    }

    // Find withdrawal and populate user
    const withdrawal = await Withdrawal.findById(id).populate('userId');
    
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        error: {
          code: "WITHDRAWAL_NOT_FOUND",
          message: "Withdrawal request not found"
        }
      });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: {
          code: "WITHDRAWAL_ALREADY_PROCESSED",
          message: "Withdrawal request has already been processed"
        }
      });
    }

    // Check if user has sufficient balance
    const user = withdrawal.userId;
    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found for this withdrawal"
        }
      });
    }

    if (withdrawal.amount > user.withdrawableBalance) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INSUFFICIENT_USER_BALANCE",
          message: "User does not have sufficient withdrawable balance"
        }
      });
    }

    // Validate withdrawal amount
    if (!withdrawal.amount || withdrawal.amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_WITHDRAWAL_AMOUNT",
          message: "Invalid withdrawal amount"
        }
      });
    }

    // Validate user balance fields
    if (typeof user.withdrawableBalance !== 'number' || typeof user.pendingWithdrawals !== 'number' || typeof user.totalWithdrawn !== 'number') {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_USER_BALANCE_FIELDS",
          message: "User balance fields are invalid"
        }
      });
    }

    // Start transaction
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (sessionError) {
      return res.status(500).json({
        success: false,
        error: {
          code: "SESSION_ERROR",
          message: "Failed to start database transaction",
          details: sessionError.message
        }
      });
    }

    try {
      // Update withdrawal status
      withdrawal.status = 'approved';
      withdrawal.processedBy = adminId;
      withdrawal.processedAt = new Date();
      if (transactionReference) {
        withdrawal.transactionReference = transactionReference;
      }
      
      // Ensure auditLog is initialized if it doesn't exist
      if (!withdrawal.auditLog) {
        withdrawal.auditLog = [];
      }
      
      // Save withdrawal with session
      const savedWithdrawal = await withdrawal.save({ session });

      // Update user balance
      try {
        user.processWithdrawalApproval(withdrawal.amount);
      } catch (balanceError) {
        throw new Error(`Failed to update user balance: ${balanceError.message}`);
      }
      
      const savedUser = await user.save({ session });

      await session.commitTransaction();

      // Send approval notifications (outside transaction to avoid blocking)
      try {
        await notifyWithdrawalApproved(withdrawal.userId._id, withdrawal.amount, withdrawal.transactionReference);
      } catch (notifError) {
        // Don't fail the whole operation for notification errors
      }
      
      // Send email notification
      try {
        await sendWithdrawalEmailNotification(withdrawal.userId.email, 'approved', {
          amount: withdrawal.amount,
          transactionReference: withdrawal.transactionReference,
          withdrawalId: withdrawal._id
        });
      } catch (emailError) {
        // Don't fail the whole operation for email errors
      }

      // Populate admin details for response
      try {
        await withdrawal.populate('processedBy', 'firstName lastName');
      } catch (populateError) {
        // Continue without populated admin details
      }
      
      // Prepare response data with fallbacks
      const responseData = {
        withdrawal: {
          _id: withdrawal._id,
          status: withdrawal.status,
          processedAt: withdrawal.processedAt,
          transactionReference: withdrawal.transactionReference || 'Generated',
          processedBy: withdrawal.processedBy ? {
            name: `${withdrawal.processedBy.firstName || 'Admin'} ${withdrawal.processedBy.lastName || 'User'}`
          } : {
            name: 'Admin User'
          }
        },
        userBalance: {
          withdrawableBalance: user.withdrawableBalance || 0,
          totalWithdrawn: user.totalWithdrawn || 0,
          pendingWithdrawals: user.pendingWithdrawals || 0
        }
      };
      
      res.status(200).json({
        success: true,
        message: "Withdrawal approved successfully",
        data: responseData
      });

    } catch (error) {
      if (session) {
        try {
          await session.abortTransaction();
        } catch (abortError) {
          // Ignore abort errors
        }
      }
      
      throw error;
    } finally {
      if (session) {
        try {
          session.endSession();
        } catch (endError) {
          // Ignore end session errors
        }
      }
    }

  } catch (error) {
    // Handle specific database errors
    let errorMessage = "An error occurred while approving withdrawal";
    let errorCode = "INTERNAL_SERVER_ERROR";
    
    if (error.code === 11000) {
      // Duplicate key error
      errorCode = "DUPLICATE_KEY_ERROR";
      errorMessage = "A duplicate key error occurred. Please try again.";
    } else if (error.name === 'ValidationError') {
      // Mongoose validation error
      errorCode = "VALIDATION_ERROR";
      errorMessage = "Validation error: " + Object.values(error.errors).map(e => e.message).join(', ');
    } else if (error.name === 'CastError') {
      // Mongoose cast error (invalid ObjectId, etc.)
      errorCode = "CAST_ERROR";
      errorMessage = "Invalid data format provided";
    } else if (error.name === 'MongoError') {
      // MongoDB specific errors
      errorCode = "MONGO_ERROR";
      errorMessage = "Database error: " + error.message;
    }
    
    // Send more detailed error response
    res.status(500).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
};

// Reject withdrawal request
export const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { rejectionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_WITHDRAWAL_ID",
          message: "Invalid withdrawal ID"
        }
      });
    }

    // Find withdrawal and populate user
    const withdrawal = await Withdrawal.findById(id).populate('userId');
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        error: {
          code: "WITHDRAWAL_NOT_FOUND",
          message: "Withdrawal request not found"
        }
      });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: {
          code: "WITHDRAWAL_ALREADY_PROCESSED",
          message: "Withdrawal request has already been processed"
        }
      });
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update withdrawal status
      withdrawal.status = 'rejected';
      withdrawal.processedBy = adminId;
      withdrawal.processedAt = new Date();
      if (rejectionReason) {
        withdrawal.rejectionReason = rejectionReason;
      }
      await withdrawal.save({ session });

      // Update user pending withdrawals
      const user = withdrawal.userId;
      user.processWithdrawalRejection(withdrawal.amount);
      await user.save({ session });

      await session.commitTransaction();

      // Send rejection notifications
      await notifyWithdrawalRejected(withdrawal.userId._id, withdrawal.amount, withdrawal.rejectionReason);
      
      // Send email notification
      await sendWithdrawalEmailNotification(withdrawal.userId.email, 'rejected', {
        amount: withdrawal.amount,
        rejectionReason: withdrawal.rejectionReason,
        withdrawalId: withdrawal._id
      });

      // Populate admin details for response
      await withdrawal.populate('processedBy', 'firstName lastName');

      res.status(200).json({
        success: true,
        message: "Withdrawal rejected successfully",
        data: {
          withdrawal: {
            _id: withdrawal._id,
            status: withdrawal.status,
            processedAt: withdrawal.processedAt,
            rejectionReason: withdrawal.rejectionReason,
            processedBy: {
              name: `${withdrawal.processedBy.firstName} ${withdrawal.processedBy.lastName}`
            }
          },
          userBalance: {
            withdrawableBalance: user.withdrawableBalance,
            totalWithdrawn: user.totalWithdrawn,
            pendingWithdrawals: user.pendingWithdrawals
          }
        }
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An error occurred while rejecting withdrawal"
      }
    });
  }
};

// Edit withdrawal request
export const editWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { amount, mobileBankingDetails, bankTransferDetails } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_WITHDRAWAL_ID",
          message: "Invalid withdrawal ID"
        }
      });
    }

    // Find withdrawal and populate user
    const withdrawal = await Withdrawal.findById(id).populate('userId');
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        error: {
          code: "WITHDRAWAL_NOT_FOUND",
          message: "Withdrawal request not found"
        }
      });
    }

    if (!withdrawal.canBeEdited()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "WITHDRAWAL_CANNOT_BE_EDITED",
          message: "Only pending withdrawals can be edited"
        }
      });
    }

    // Store previous values for audit trail
    const previousValues = {
      amount: withdrawal.amount,
      mobileBankingDetails: withdrawal.mobileBankingDetails,
      bankTransferDetails: withdrawal.bankTransferDetails
    };

    const changes = {};

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = withdrawal.userId;

      // Handle amount change
      if (amount !== undefined && amount !== withdrawal.amount) {
        const roundedAmount = Math.round(Number(amount));
        if (typeof roundedAmount !== 'number' || roundedAmount <= 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: "INVALID_AMOUNT",
              message: "Amount must be a positive number"
            }
          });
        }

        // Calculate balance impact
        const balanceChange = roundedAmount - withdrawal.amount;
        const newAvailableBalance = user.getAvailableBalance() - balanceChange;

        if (newAvailableBalance < 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: "INSUFFICIENT_BALANCE",
              message: "Edited amount would exceed user's available balance",
              details: {
                requestedAmount: roundedAmount,
                currentAmount: withdrawal.amount,
                availableBalance: user.getAvailableBalance()
              }
            }
          });
        }

        // Update user's pending withdrawals
        user.pendingWithdrawals += balanceChange;
        changes.amount = roundedAmount;
        withdrawal.amount = roundedAmount;
      }

      // Handle payment details changes
      if (withdrawal.method === 'mobile_banking' && mobileBankingDetails) {
        if (mobileBankingDetails.accountHolderName !== undefined) {
          changes.mobileBankingDetails = changes.mobileBankingDetails || {};
          changes.mobileBankingDetails.accountHolderName = mobileBankingDetails.accountHolderName;
          withdrawal.mobileBankingDetails.accountHolderName = mobileBankingDetails.accountHolderName;
        }
        if (mobileBankingDetails.mobileNumber !== undefined) {
          changes.mobileBankingDetails = changes.mobileBankingDetails || {};
          changes.mobileBankingDetails.mobileNumber = mobileBankingDetails.mobileNumber;
          withdrawal.mobileBankingDetails.mobileNumber = mobileBankingDetails.mobileNumber;
        }
        if (mobileBankingDetails.provider !== undefined) {
          changes.mobileBankingDetails = changes.mobileBankingDetails || {};
          changes.mobileBankingDetails.provider = mobileBankingDetails.provider;
          withdrawal.mobileBankingDetails.provider = mobileBankingDetails.provider;
        }
      }

      if (withdrawal.method === 'bank_transfer' && bankTransferDetails) {
        if (bankTransferDetails.accountName !== undefined) {
          changes.bankTransferDetails = changes.bankTransferDetails || {};
          changes.bankTransferDetails.accountName = bankTransferDetails.accountName;
          withdrawal.bankTransferDetails.accountName = bankTransferDetails.accountName;
        }
        if (bankTransferDetails.accountNumber !== undefined) {
          changes.bankTransferDetails = changes.bankTransferDetails || {};
          changes.bankTransferDetails.accountNumber = bankTransferDetails.accountNumber;
          withdrawal.bankTransferDetails.accountNumber = bankTransferDetails.accountNumber;
        }
        if (bankTransferDetails.bankName !== undefined) {
          changes.bankTransferDetails = changes.bankTransferDetails || {};
          changes.bankTransferDetails.bankName = bankTransferDetails.bankName;
          withdrawal.bankTransferDetails.bankName = bankTransferDetails.bankName;
        }
      }

      // Add edit history
      if (Object.keys(changes).length > 0) {
        withdrawal.addEditHistory(adminId, changes, previousValues);
        await withdrawal.save({ session });
        await user.save({ session });
      }

      await session.commitTransaction();

      // Create notification for withdrawal edit (only if there were actual changes)
      if (Object.keys(changes).length > 0) {
        const changesList = Object.keys(changes).map(key => {
          if (key === 'amount') return `Amount updated to ${changes[key]}`;
          if (key === 'mobileBankingDetails') return 'Mobile banking details updated';
          if (key === 'bankTransferDetails') return 'Bank transfer details updated';
          return `${key} updated`;
        }).join(', ');

        await notifyWithdrawalEdited(withdrawal.userId._id, changes);
        
        // Send email notification
        await sendWithdrawalEmailNotification(withdrawal.userId.email, 'edited', {
          changes,
          withdrawalId: withdrawal._id
        });
      }

      res.status(200).json({
        success: true,
        message: "Withdrawal edited successfully",
        data: {
          withdrawal: {
            _id: withdrawal._id,
            method: withdrawal.method,
            amount: withdrawal.amount,
            status: withdrawal.status,
            paymentDetails: withdrawal.method === 'mobile_banking' 
              ? withdrawal.mobileBankingDetails 
              : withdrawal.bankTransferDetails,
            editHistory: withdrawal.editHistory
          },
          changes: changes
        }
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Error editing withdrawal:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: validationErrors
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An error occurred while editing withdrawal"
      }
    });
  }
};

// Sync all users' earnings fields
export const syncAllUsersEarnings = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    // Verify admin permissions
    const admin = await User.findById(adminId);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Import the helper function
    const { syncAllUsersEarningsFields } = await import('../utils/balanceHelpers.js');
    
    const results = await syncAllUsersEarningsFields();

    res.json({ 
      success: true, 
      message: 'Earnings sync completed successfully',
      results 
    });
  } catch (error) {
    console.error('Error syncing user earnings:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
