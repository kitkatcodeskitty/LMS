
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { Purchase } from '../models/Purchase.js';
import Withdrawal from '../models/Withdrawal.js';
import mongoose from 'mongoose';
import fs from 'fs';

// Function to convert YouTube URLs to embed format
const convertYouTubeToEmbed = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // Regular YouTube watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  
  // Already embed format
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  // Return original URL if not YouTube
  return url;
};

  
// naya course admin leh halni 
export const addCourse = async (req, res) => {
  try {
    const imageFile = req.files?.image?.[0];
    const chapterBanners = req.files?.chapterBanners || [];
    const userId = req.user.id;
    const body = req.body;

    // Debug: Log what we're receiving
    console.log('req.files:', req.files);
    console.log('imageFile:', imageFile);
    console.log('chapterBanners:', chapterBanners);

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

    // Convert YouTube URLs to embed format for all lectures
    if (parsedCourseData.courseContent && Array.isArray(parsedCourseData.courseContent)) {
      parsedCourseData.courseContent.forEach(chapter => {
        if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
          chapter.chapterContent.forEach(lecture => {
            if (lecture.lectureUrl) {
              const originalUrl = lecture.lectureUrl;
              lecture.lectureUrl = convertYouTubeToEmbed(lecture.lectureUrl);
              if (originalUrl !== lecture.lectureUrl) {
                console.log(`Converted YouTube URL: ${originalUrl} -> ${lecture.lectureUrl}`);
              }
            }
          });
        }
      });
    }

    // Upload course thumbnail
    console.log('Uploading course thumbnail...');
    const imageUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "course_thumbnails",
          quality: "auto",
          fetch_format: "auto",
          flags: "preserve_transparency"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(imageFile.buffer);
    });
    parsedCourseData.courseThumbnail = imageUpload.secure_url;
    console.log('Course thumbnail uploaded successfully');

    // Upload chapter banners and update course content
    if (chapterBanners.length > 0) {
      console.log(`Uploading ${chapterBanners.length} chapter banners...`);
      let bannerIndex = 0;
      
      // Process each chapter for banners
      for (let chapterIndex = 0; chapterIndex < parsedCourseData.courseContent.length; chapterIndex++) {
        const chapter = parsedCourseData.courseContent[chapterIndex];
        
        // Check if this chapter should have a banner
        if (chapter.chapterBanner && bannerIndex < chapterBanners.length) {
          const bannerFile = chapterBanners[bannerIndex];
          
          try {
            console.log(`Uploading chapter banner ${bannerIndex + 1}/${chapterBanners.length}...`);
            const bannerUpload = await new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                {
                  folder: "chapter_banners",
                  quality: "auto",
                  fetch_format: "auto",
                  flags: "preserve_transparency"
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              ).end(bannerFile.buffer);
            });
            
            // Update the chapter with the uploaded banner URL
            parsedCourseData.courseContent[chapterIndex].chapterBanner = bannerUpload.secure_url;
            
            bannerIndex++;
            console.log(`Chapter banner ${bannerIndex} uploaded successfully`);
          } catch (uploadError) {
            console.error('Error uploading chapter banner:', uploadError);
            // Continue with other banners even if one fails
          }
        }
      }
      console.log('All chapter banners processed');
    }

    console.log('Creating course in database...');
    const newCourse = await Course.create(parsedCourseData);
    console.log('Course created successfully with ID:', newCourse._id);

    // Clean up uploaded files
    try {
      if (imageFile && imageFile.path) {
        fs.unlinkSync(imageFile.path);
        console.log('Course thumbnail file cleaned up');
      }
      
      if (chapterBanners && chapterBanners.length > 0) {
        chapterBanners.forEach(file => {
          if (file.path) {
            fs.unlinkSync(file.path);
          }
        });
        console.log('Chapter banner files cleaned up');
      }
    } catch (cleanupError) {
      console.error('Error cleaning up files:', cleanupError);
    }

    res.json({ 
      success: true, 
      message: 'Course Added Successfully',
      courseId: newCourse._id,
      courseTitle: newCourse.courseTitle
    });
  } catch (error) {
    // Clean up files on error
    try {
      if (imageFile && imageFile.path) {
        fs.unlinkSync(imageFile.path);
      }
      
      if (chapterBanners && chapterBanners.length > 0) {
        chapterBanners.forEach(file => {
          if (file.path) {
            fs.unlinkSync(file.path);
          }
        });
      }
    } catch (cleanupError) {
      console.error('Error cleaning up files after error:', cleanupError);
    }
    
    res.json({ success: false, message: error.message });
  }
};



// admin ko dashboard
export const adminDashboardData = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    // Use Purchase collection for financial calculations since that's where actual purchase data is stored
    // This matches what the enrolled students table is using
    const allPurchases = await Purchase.find({})
      .populate('userId', 'firstName lastName email affiliateCode')
      .populate('courseId', 'courseTitle coursePrice packageType')
      .populate('referrerId', 'firstName lastName email affiliateCode');

    const courses = await Course.find({}).select('courseTitle coursePrice packageType');
    
    let totalRevenue = 0;
    let totalAffiliateOutflow = 0;
    const enrolledStudentsData = [];
    
    allPurchases.forEach((purchase) => {
      // Skip purchases with missing or invalid data
      if (!purchase.amount || purchase.amount <= 0 || !purchase.userId || !purchase.courseId) {
        return;
      }

      // Calculate revenue from purchase amount
      const purchaseRevenue = purchase.amount;
      totalRevenue += purchaseRevenue;
      
      // Calculate affiliate outflow if referral code was used
      if (purchase.referralCode || purchase.referrerId) {
        // Calculate 60% commission for affiliate
        const affiliateAmount = purchaseRevenue * 0.6;
        totalAffiliateOutflow += affiliateAmount;
      }

      // Add to enrolled students if not already added
      const existingStudent = enrolledStudentsData.find(
        student => student.student._id.toString() === purchase.userId._id.toString()
      );
      
      if (!existingStudent) {
        enrolledStudentsData.push({
          courseTitle: purchase.courseId?.courseTitle || 'Unknown Course',
          student: { _id: purchase.userId._id },
          referralCode: purchase.referralCode || null,
          transactionId: purchase._id,
          paymentScreenshot: '', // Purchase doesn't have payment screenshot
          revenue: purchaseRevenue,
          affiliateOutflow: (purchase.referralCode || purchase.referrerId) ? (purchaseRevenue * 0.6) : 0
        });
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
      if (purchase.referrerId && purchase.referrerId._id && userPurchaseMap.has(purchase.referrerId._id.toString())) {
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
            // Silent error handling for earnings update
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
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Reset entire database - DANGEROUS OPERATION
export const resetDatabase = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    // Verify admin permissions - only full admins can reset database
    const admin = await User.findById(adminId);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only full admins can reset the database.' 
      });
    }

    console.log(`Database reset initiated by admin: ${admin.email} (${adminId})`);

    // Start a transaction to ensure all deletions succeed or none do
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete all data in the correct order to avoid foreign key constraints
      
      // 1. Delete all withdrawals first (references users)
      const withdrawalCount = await Withdrawal.countDocuments();
      await Withdrawal.deleteMany({}, { session });
      console.log(`Deleted ${withdrawalCount} withdrawals`);

      // 2. Delete all purchases (references users and courses)
      const purchaseCount = await Purchase.countDocuments();
      await Purchase.deleteMany({}, { session });
      console.log(`Deleted ${purchaseCount} purchases`);

      // 3. Delete all cart items (references users and courses)
      const cartCount = await Cart.countDocuments();
      await Cart.deleteMany({}, { session });
      console.log(`Deleted ${cartCount} cart items`);

      // 4. Delete all KYC documents (references users)
      const Kyc = await import('../models/Kyc.js');
      const kycCount = await Kyc.default.countDocuments();
      await Kyc.default.deleteMany({}, { session });
      console.log(`Deleted ${kycCount} KYC documents`);

      // 5. Delete all courses (references users)
      const courseCount = await Course.countDocuments();
      await Course.deleteMany({}, { session });
      console.log(`Deleted ${courseCount} courses`);

      // 6. Delete all users except the current admin
      const userCount = await User.countDocuments();
      const usersToDelete = userCount - 1; // Subtract 1 for the admin we're keeping
      await User.deleteMany({ _id: { $ne: adminId } }, { session });
      console.log(`Deleted ${usersToDelete} users (preserved admin: ${admin.email})`);

      // 7. Delete all popups
      const Popup = await import('../models/Popup.js');
      const popupCount = await Popup.default.countDocuments();
      await Popup.default.deleteMany({}, { session });
      console.log(`Deleted ${popupCount} popups`);

      // Commit the transaction
      await session.commitTransaction();
      console.log('Database reset completed successfully');

      // Log the reset action
      console.log(`Database reset completed by admin: ${admin.email} (${adminId})`);
      console.log(`Total records deleted: ${withdrawalCount + purchaseCount + cartCount + kycCount + courseCount + usersToDelete + popupCount}`);

      res.json({ 
        success: true, 
        message: 'Database has been completely reset. All data has been permanently deleted except your admin account.',
        deletedRecords: {
          withdrawals: withdrawalCount,
          purchases: purchaseCount,
          cartItems: cartCount,
          kycDocuments: kycCount,
          courses: courseCount,
          users: usersToDelete,
          popups: popupCount,
          total: withdrawalCount + purchaseCount + cartCount + kycCount + courseCount + usersToDelete + popupCount
        },
        preserved: {
          adminAccount: {
            email: admin.email,
            name: `${admin.firstName} ${admin.lastName}`,
            id: adminId
          }
        }
      });

    } catch (error) {
      // Rollback the transaction on error
      await session.abortTransaction();
      console.error('Database reset failed, transaction rolled back:', error);
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Database reset error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'An error occurred while resetting the database' 
    });
  }
};

// Delete user and all associated data
export const deleteUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const userId = req.params.userId;
    

    
    // Verify admin permissions
    const admin = await User.findById(adminId);
    if (!admin || (!admin.isAdmin && !admin.isSubAdmin)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin or Sub-Admin privileges required.' 
      });
    }

    // Prevent admin from deleting themselves
    if (adminId === userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot delete your own account.' 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    // Prevent deletion of other admins (unless super admin)
    if (user.isAdmin && !admin.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Sub-admins cannot delete admin accounts.' 
      });
    }

    // Check if user has referred other users (for informational purposes only)
    const referredUsers = await User.find({ referredBy: user.affiliateCode });
    const referralCount = referredUsers.length;

    // Get user statistics for confirmation
    const userStats = {
      totalPurchases: await Purchase.countDocuments({ userId: userId }),
      totalWithdrawals: await Withdrawal.countDocuments({ userId: userId }),
      hasKyc: await (await import('../models/Kyc.js')).default.exists({ user: userId }),
      referredUsers: referralCount,
      totalSpent: await Purchase.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0)
    };

    // Check if user has pending purchases or withdrawals
    const pendingPurchases = await Purchase.find({ 
      userId: userId, 
      status: { $in: ['pending', 'processing'] } 
    });
    
    const pendingWithdrawals = await Withdrawal.find({ 
      userId: userId, 
      status: { $in: ['pending', 'processing'] } 
    });

    if (pendingPurchases.length > 0 || pendingWithdrawals.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete user. User has ${pendingPurchases.length} pending purchases and ${pendingWithdrawals.length} pending withdrawals. Please resolve these first.` 
      });
    }

    // Note: Earnings and balance checks removed - admins can now delete users with earnings

    // Start a transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete all associated data
      
      // 1. Delete all purchases by this user
      await Purchase.deleteMany({ userId: userId }, { session });
      
      // 2. Delete KYC data
      const Kyc = await import('../models/Kyc.js');
      await Kyc.default.deleteMany({ user: userId }, { session });
      
      // 3. Delete cart items
      await Cart.deleteMany({ userId: userId }, { session });
      
      // 4. Delete withdrawal requests
      await Withdrawal.deleteMany({ userId: userId }, { session });
      
      // 5. Handle referral relationships - remove referrer but preserve referred users' earnings
      if (user.affiliateCode && referredUsers.length > 0) {
        // Remove the referrer relationship but keep all earnings intact
        await User.updateMany(
          { referredBy: user.affiliateCode },
          { $unset: { referredBy: 1 } },
          { session }
        );
        

      }
      
      // 6. Delete the user account
      await User.findByIdAndDelete(userId, { session });

      // Commit the transaction
      await session.commitTransaction();
      

      
      res.json({ 
        success: true, 
        message: referralCount > 0 
          ? `User deleted successfully. ${referralCount} referred users' earnings were preserved.`
          : 'User and all associated data deleted successfully',
        deletedUser: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          stats: userStats
        }
      });

    } catch (error) {
      // Rollback the transaction on error

      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {

    res.status(500).json({ 
      success: false, 
      message: error.message || 'An error occurred while deleting the user' 
    });
  }
};
