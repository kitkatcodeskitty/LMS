import mongoose from "mongoose";
import User from "../models/User.js";

import { v2 as cloudinary } from "cloudinary"; 
import Cart from '../models/Cart.js';  
import { Purchase } from "../models/Purchase.js";
import { verify, verifyAdmin, createAccessToken, errorHandler } from "../auth.js";


// registration
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const imageFile = req.file;

    if (!email.includes("@")) {
      return res.status(400).json({ success: false, message: "Email invalid" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    let imageUrl = "";
    if (imageFile) {
      const uploadedImage = await cloudinary.uploader.upload(imageFile.path);
      imageUrl = uploadedImage.secure_url;
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password, // Will be hashed by pre-save middleware
      imageUrl,
    });



    await newUser.save();


    const token = createAccessToken(newUser);

    res.status(201).json({ success: true, message: "Registration successful", user: newUser, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = createAccessToken(user);

    res.json({ success: true, message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// get user details with id  profile ma kam lauxa yo 
export const getUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("enrolledCourses");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    errorHandler(error, req, res, null);
  }
};

// update user info by admin
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { 
      firstName, 
      lastName, 
      email, 
      password,
      affiliateEarnings, 
      affiliateCode,
      isAdmin,
      isSubAdmin,
      referredBy,
      // New earnings and balance fields
      withdrawableBalance,
      totalWithdrawn,
      pendingWithdrawals,
      lifetimeEarnings,
      dailyEarnings,
      weeklyEarnings,
      monthlyEarnings,
      currentBalance
    } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if email is already used by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use by another user" });
    }

    // Check if affiliate code is already used by another user (if provided)
    if (affiliateCode) {
      const existingAffiliateUser = await User.findOne({ affiliateCode, _id: { $ne: userId } });
      if (existingAffiliateUser) {
        return res.status(400).json({ success: false, message: "Affiliate code already in use by another user" });
      }
    }

    // Prepare update data
    const updateData = {
      firstName,
      lastName,
      email,
      affiliateEarnings: affiliateEarnings || 0,
      affiliateCode: affiliateCode || null,
      isAdmin: Boolean(isAdmin),
      referredBy: referredBy || null,
      // Add new earnings and balance fields
      withdrawableBalance: withdrawableBalance || 0,
      totalWithdrawn: totalWithdrawn || 0,
      pendingWithdrawals: pendingWithdrawals || 0,
      lifetimeEarnings: lifetimeEarnings || 0,
      dailyEarnings: dailyEarnings || 0,
      weeklyEarnings: weeklyEarnings || 0,
      monthlyEarnings: monthlyEarnings || 0,
      currentBalance: currentBalance || 0,
      // Set admin update timestamp
      lastAdminUpdate: new Date()
    };

    // Set role based on admin status
    if (Boolean(isAdmin)) {
      updateData.role = 'admin';
      updateData.isSubAdmin = false;
    } else if (Boolean(isSubAdmin)) {
      updateData.role = 'subadmin';
      updateData.isAdmin = false;
      updateData.isSubAdmin = true;
    } else {
      updateData.role = 'user';
      updateData.isAdmin = false;
      updateData.isSubAdmin = false;
    }

    // Password will be hashed by pre-save middleware if provided
    if (password && password.trim()) {
      updateData.password = password.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password'); // exclude password from response

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// get user by id
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password'); // exclude password

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// reset password 
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    errorHandler(error, req, res, null);
  }
};

// make admin
export const makeUserAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid userId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isAdmin = true;
    await user.save();

    res.json({ message: "User is now an admin" });
  } catch (error) {
    errorHandler(error, req, res, null);
  }
};
 
// get purchased courses with id yesle chai specific person ko matra dinxa 
export const getUserPurchasedCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get purchases made by this user to get actual paid amounts
    const purchases = await Purchase.find({ userId: userId, status: 'completed' })
      .populate({
        path: 'courseId',
        select: 'courseTitle coursePrice courseThumbnail courseContent'
      })
      .sort({ createdAt: -1 });

    if (!purchases || purchases.length === 0) {
      return res.status(200).json({ success: true, purchasedCourses: [] });
    }

    // Map purchases to course format with actual paid amount
    const purchasedCourses = purchases.map(purchase => ({
      ...purchase.courseId.toObject(),
      actualPaidAmount: purchase.amount, // The actual amount paid (with discount)
      originalPrice: purchase.courseId.coursePrice, // Original course price
      purchaseDate: purchase.createdAt,
      purchaseId: purchase._id
    }));

    res.status(200).json({
      success: true,
      purchasedCourses: purchasedCourses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching purchased courses",
    });
  }
};

// Get affiliate earnings for the authenticated user over time windows
export const getAffiliateEarnings = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const sumAffiliate = async (fromDate) => {
      const docs = await Purchase.find({
        referrerId: userId,
        status: 'completed',
        createdAt: { $gte: fromDate },
      }).select('affiliateAmount');
      return docs.reduce((acc, p) => acc + (Number(p.affiliateAmount) || 0), 0);
    };

    const [today, last7, last30] = await Promise.all([
      sumAffiliate(startOfToday),
      sumAffiliate(last7Days),
      sumAffiliate(last30Days),
    ]);

    res.status(200).json({ success: true, earnings: { today, last7, last30 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get detailed earnings data for profile dashboard
export const getEarningsData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Import the helper function
    const { getUserEarningsData } = await import('../utils/balanceHelpers.js');
    
    const earningsData = await getUserEarningsData(userId);

    // Format response to maintain backward compatibility
    const earnings = {
      lifetime: earningsData.lifetime.affiliate,
      today: earningsData.today.affiliate,
      lastSevenDays: earningsData.lastSevenDays.affiliate,
      thisMonth: earningsData.thisMonth.affiliate,
      withdrawableBalance: earningsData.balance.withdrawableBalance,
      totalWithdrawn: earningsData.balance.totalWithdrawn,
      pendingWithdrawals: earningsData.balance.pendingWithdrawals,
      availableBalance: earningsData.balance.availableBalance,
      // Add currentBalance for backward compatibility
      currentBalance: earningsData.balance.availableBalance,
      // Additional detailed data
      withdrawableEarnings: {
        lifetime: earningsData.lifetime.withdrawable,
        today: earningsData.today.withdrawable,
        lastSevenDays: earningsData.lastSevenDays.withdrawable,
        thisMonth: earningsData.thisMonth.withdrawable
      }
    };

    res.status(200).json({ success: true, earnings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user referrals
export const getUserReferrals = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all purchases made by users referred by this user
    const referralPurchases = await Purchase.find({ referrerId: userId })
      .populate('userId', 'firstName lastName email createdAt')
      .populate('courseId', 'courseTitle coursePrice')
      .sort({ createdAt: -1 });

    // Group by user to get referral summary
    const referralMap = new Map();
    
    referralPurchases.forEach(purchase => {
      if (purchase.userId) {
        const userId = purchase.userId._id.toString();
        if (!referralMap.has(userId)) {
          referralMap.set(userId, {
            name: `${purchase.userId.firstName} ${purchase.userId.lastName}`,
            email: purchase.userId.email,
            joinDate: purchase.userId.createdAt,
            coursesBought: 0,
            commissionEarned: 0,
          });
        }
        
        const referralData = referralMap.get(userId);
        referralData.coursesBought += 1;
        referralData.commissionEarned += purchase.affiliateAmount || 0;
      }
    });

    const referrals = Array.from(referralMap.values());

    res.status(200).json({ success: true, referrals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({ affiliateEarnings: { $gt: 0 } })
      .select('firstName lastName email affiliateEarnings imageUrl')
      .sort({ affiliateEarnings: -1 })
      .limit(50);

    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment statements
export const getPaymentStatements = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all purchases where this user earned affiliate commission
    const statements = await Purchase.find({ 
      referrerId: userId,
      affiliateAmount: { $gt: 0 }
    })
      .populate('userId', 'firstName lastName')
      .populate('courseId', 'courseTitle')
      .sort({ createdAt: -1 });

    const formattedStatements = statements.map(purchase => ({
      date: purchase.createdAt,
      description: `Commission from ${purchase.userId?.firstName} ${purchase.userId?.lastName} - ${purchase.courseId?.courseTitle}`,
      amount: purchase.affiliateAmount || 0,
      status: 'paid', // You can modify this based on your payment logic
    }));

    res.status(200).json({ success: true, statements: formattedStatements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user has already edited their profile once
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If user has already edited profile once, prevent further edits
    if (user.hasEditedProfile) {
      return res.status(403).json({ 
        success: false, 
        message: "Profile can only be edited once. Please contact an administrator for any further changes.",
        hasEditedProfile: true,
        profileEditDate: user.profileEditDate
      });
    }
    
    // Handle both text fields and file uploads
    const updateData = {};
    
    // Handle text fields if they exist and are not empty
    if (req.body.firstName && req.body.firstName.trim() !== '') updateData.firstName = req.body.firstName.trim();
    if (req.body.lastName && req.body.lastName.trim() !== '') updateData.lastName = req.body.lastName.trim();
    if (req.body.email && req.body.email.trim() !== '') {
      // Check if email is already used by another user
      const existingUser = await User.findOne({ email: req.body.email.trim(), _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already in use by another user" });
      }
      updateData.email = req.body.email.trim();
    }
    
    // Handle password update if provided
    if (req.body.currentPassword && req.body.newPassword) {
      // Verify current password
      const isPasswordValid = await user.comparePassword(req.body.currentPassword);
      if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }
      
      // New password will be hashed by pre-save middleware
      updateData.password = req.body.newPassword;
    }
    
    // Handle profile image upload if provided
    if (req.file) {
      try {
        const uploadedImage = await cloudinary.uploader.upload(req.file.path);
        updateData.imageUrl = uploadedImage.secure_url;
      } catch (uploadError) {
        return res.status(500).json({ success: false, message: "Failed to upload image" });
      }
    }
    
    // Only update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    // Mark that profile has been edited and set the edit date
    updateData.hasEditedProfile = true;
    updateData.profileEditDate = new Date();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ 
      success: true, 
      data: updatedUser, 
      message: "Profile updated successfully. Note: Profile can only be edited once. Contact an administrator for any further changes." 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset profile edit restriction (Admin only)
export const resetProfileEditRestriction = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Reset the profile edit restriction
    user.hasEditedProfile = false;
    user.profileEditDate = null;
    await user.save();

    res.json({ 
      success: true, 
      message: "Profile edit restriction has been reset for this user",
      data: {
        hasEditedProfile: user.hasEditedProfile,
        profileEditDate: user.profileEditDate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's purchase history with detailed transaction information
export const getPurchaseHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all purchases made by this user
    const purchases = await Purchase.find({ userId })
      .populate('courseId', 'courseTitle coursePrice courseThumbnail courseDescription')
      .populate('referrerId', 'firstName lastName affiliateCode')
      .sort({ createdAt: -1 });

    // Format the purchase data for the frontend
    const formattedPurchases = purchases.map(purchase => ({
      _id: purchase._id,
      courseId: purchase.courseId,
      amount: purchase.amount,
      status: purchase.status || 'completed',
      transactionId: purchase.transactionId,
      referralCode: purchase.referralCode,
      paymentScreenshot: purchase.paymentScreenshot,
      createdAt: purchase.createdAt,
      referrerId: purchase.referrerId,
      affiliateAmount: purchase.affiliateAmount
    }));

    res.status(200).json({ 
      success: true, 
      purchases: formattedPurchases,
      totalPurchases: formattedPurchases.length,
      totalAmount: formattedPurchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Make user sub-admin
export const makeUserSubAdmin = async (req, res) => {
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

    // Check if user is already an admin or sub-admin
    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'User is already a full admin'
      });
    }

    if (user.isSubAdmin || user.role === 'subadmin') {
      return res.status(400).json({
        success: false,
        message: 'User is already a sub-admin'
      });
    }

    // Update user to sub-admin
    user.isSubAdmin = true;
    user.role = 'subadmin';
    await user.save();

    res.json({
      success: true,
      message: `${user.firstName} ${user.lastName} has been made a sub-admin successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};