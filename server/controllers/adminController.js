
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { Purchase } from '../models/Purchase.js';


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

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
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
    const courses = await Course.find({ admin: adminId });
    const totalCourses = courses.length;

    const enrolledStudentsData = [];
    let totalEarnings = 0;

    for (const course of courses) {
      const cartsWithCourse = await Cart.find({
        "courses.course._id": course._id,
        "courses.isValidated": true
      });

      cartsWithCourse.forEach(cart => {
        const validatedCourse = cart.courses.find(
          c => c.course._id.toString() === course._id.toString() && c.isValidated
        );

        if (validatedCourse) {
          enrolledStudentsData.push({
            courseTitle: course.courseTitle,
            student: cart.user,
            referralCode: validatedCourse.referralCode || null,
            transactionId: validatedCourse.transactionId,
            paymentScreenshot: validatedCourse.paymentScreenshot
          });
          totalEarnings += validatedCourse.course.coursePrice;
        }
      });
    }

    res.json({
      success: true,
      dashboardData: {
        totalCourses,
        totalEarnings,
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
      .populate('userId', 'firstName lastName email affiliateCode affiliateEarnings isAdmin imageUrl referredBy')
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
    const { purchaseId, affiliateAmount } = req.body;
    if (!purchaseId || typeof affiliateAmount === 'undefined') {
      return res.status(400).json({ success: false, message: 'purchaseId and affiliateAmount are required' });
    }
    const amountNum = Number(affiliateAmount);
    if (Number.isNaN(amountNum) || amountNum < 0) {
      return res.status(400).json({ success: false, message: 'affiliateAmount must be a non-negative number' });
    }
    const purchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      { affiliateAmount: amountNum },
      { new: true }
    ).populate('userId', 'firstName lastName email').populate('courseId', 'courseTitle coursePrice').populate('referrerId', 'firstName lastName email affiliateCode');
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }
    return res.status(200).json({ success: true, purchase });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
