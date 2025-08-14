import fs from 'fs';
import Cart from '../models/Cart.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary';
import { createNotification } from './notificationController.js';

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, referralCode, transactionId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }
    if (!transactionId) {
      return res.status(400).json({ success: false, message: "Transaction ID is required" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Payment screenshot is required" });
    }

    // Upload payment screenshot to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "payment_screenshots", // optional: organize uploads
    });

    // Remove the local file after upload
    fs.unlinkSync(req.file.path);

    const paymentScreenshot = result.secure_url; // Cloudinary URL

    const user = await User.findById(userId).select("firstName lastName email affiliateCode");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent users from using their own referral code
    if (referralCode && referralCode.trim() === user.affiliateCode) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot use your own referral code for purchases" 
      });
    }

    const course = await Course.findById(courseId).select(
      "courseTitle courseDescription coursePrice courseThumbnail discount discountType"
    );
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Calculate discounted price
    const calculateDiscountedPrice = (course) => {
      if (course.discountType === 'amount') {
        return Math.max(0, course.coursePrice - course.discount);
      } else {
        // percentage discount
        return course.coursePrice - (course.discount * course.coursePrice) / 100;
      }
    };

    const discountedPrice = calculateDiscountedPrice(course);

    let userCart = await Cart.findOne({ "user._id": userId });

    const newCourseData = {
      course: {
        _id: course._id,
        courseTitle: course.courseTitle,
        courseDescription: course.courseDescription,
        coursePrice: discountedPrice, // Use discounted price instead of original price
        courseThumbnail: course.courseThumbnail,
      },
      referralCode: referralCode || null,
      transactionId,
      paymentScreenshot, // save Cloudinary URL here
    };

    if (!userCart) {
      userCart = new Cart({
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        courses: [newCourseData],
      });
    } else {
      const alreadyInCart = userCart.courses.some(
        (item) => item.course._id.toString() === courseId
      );

      if (alreadyInCart) {
        return res.status(400).json({ success: false, message: "Course already in cart" });
      }

      userCart.courses.push(newCourseData);
    }

    await userCart.save();
    res.status(200).json({ success: true, message: "Course added to cart", userCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};







// get cart 
export const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find({});
    res.status(200).json({ success: true, carts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// yesle course like green signal dinxa mero matlab ki payment vayasi complete vanyara validatwe garaidinxa 
export const validatePurchase = async (req, res) => {
  try {
    const { userId, courseId } = req.body;


    const userCart = await Cart.findOne({ "user._id": userId });

    if (!userCart) {
      return res.status(404).json({ success: false, message: "User cart not found" });
    }


    const courseItem = userCart.courses.find(
      (item) => item.course._id.toString() === courseId
    );

    if (!courseItem) {
      return res.status(404).json({ success: false, message: "Course not found in cart" });
    }

    courseItem.isValidated = true;
    const purchasingUser = await User.findById(userId);

    if (!purchasingUser.enrolledCourses.includes(courseId)) {
      purchasingUser.enrolledCourses.push(courseId);
    }

    if (!purchasingUser.affiliateCode) {
      const generatedCode = purchasingUser._id.toString().slice(-6);
      purchasingUser.affiliateCode = generatedCode;
    }

    if (courseItem.referralCode) {
      const referrer = await User.findOne({ affiliateCode: courseItem.referralCode });

      if (referrer && referrer._id.toString() !== userId) {
        referrer.affiliateEarnings += courseItem.course.coursePrice / 2;

        if (!purchasingUser.referredBy) {
          purchasingUser.referredBy = courseItem.referralCode;
        }

        await referrer.save();
      }
    }

    await purchasingUser.save();

    const purchaseDoc = new Purchase({
      courseId,
      userId,
      amount: courseItem.course.coursePrice,
      status: "completed",
      referralCode: courseItem.referralCode || null,
      transactionId: courseItem.transactionId,
      paymentScreenshot: courseItem.paymentScreenshot,
    });
    if (courseItem.referralCode) {
      const referrer = await User.findOne({ affiliateCode: courseItem.referralCode });
      if (referrer) {
        purchaseDoc.referrerId = referrer._id;
        // Default split (can be overridden by admin later)
        purchaseDoc.affiliateAmount = courseItem.course.coursePrice / 2;
      }
    }
    await purchaseDoc.save();

    // Send success notification to user
    await createNotification(
      userId,
      "Course Purchase Validated! 🎉",
      `Your purchase for "${courseItem.course.courseTitle}" has been validated successfully. You can now access the course content.`,
      "success",
      courseId,
      "course_validated"
    );

    userCart.courses = userCart.courses.filter(
      (item) => item.course._id.toString() !== courseId
    );

    await userCart.save();

    res.status(200).json({ success: true, message: "Course validated, purchased, and removed from cart" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// getcoursedetails
export const getCourseDetails = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;  

    const course = await Course.findById(courseId).lean();
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });


    const purchase = await Purchase.findOne({ courseId, userId, status: 'completed' });

    if (purchase) {
      course.courseContent = course.courseContent.map(chapter => ({
        ...chapter,
        chapterContent: chapter.chapterContent.map(lecture => ({
          ...lecture,
          isPreviewFree: true,
        })),
      }));
    course.isPurchased = true;
  } else {
    course.isPurchased = false;
    } 

  return res.json(course);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// remove card 
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }

    const userCart = await Cart.findOne({ "user._id": userId });

    if (!userCart) {
      return res.status(404).json({ success: false, message: "User cart not found" });
    }

    

    // Check if course exists in cart before filtering
    const courseExists = userCart.courses.some(
      (item) => item.course._id.toString() === courseId.toString()
    );

    if (!courseExists) {
      return res.status(404).json({ success: false, message: "Course not found in cart" });
    }

    // Filter out the course
    userCart.courses = userCart.courses.filter(
      (item) => item.course._id.toString() !== courseId.toString()
    );

    await userCart.save();

    res.status(200).json({ success: true, message: "Course removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Admin function to reject purchase and remove from cart
export const rejectPurchase = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID and Course ID are required" 
      });
    }

    const userCart = await Cart.findOne({ "user._id": userId });

    if (!userCart) {
      return res.status(404).json({ 
        success: false, 
        message: "User cart not found" 
      });
    }

    // Check if course exists in cart
    const courseExists = userCart.courses.some(
      (item) => item.course._id.toString() === courseId.toString()
    );

    if (!courseExists) {
      return res.status(404).json({ 
        success: false, 
        message: "Course not found in user's cart" 
      });
    }

    // Get course details for notification
    const courseItem = userCart.courses.find(
      (item) => item.course._id.toString() === courseId.toString()
    );

    // Send rejection notification to user
    await createNotification(
      userId,
      "Course Purchase Rejected ❌",
      `Your purchase for "${courseItem.course.courseTitle}" has been rejected. Please contact support for more information.`,
      "error",
      courseId,
      "course_rejected"
    );

    // Remove the course from cart
    userCart.courses = userCart.courses.filter(
      (item) => item.course._id.toString() !== courseId.toString()
    );

    await userCart.save();

    res.status(200).json({ 
      success: true, 
      message: "Course rejected and removed from cart" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Admin function to update a cart item details (referralCode, transactionId, paymentScreenshot)
export const updateCartItem = async (req, res) => {
  try {
    const { userId, courseId, referralCode, transactionId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Course ID are required',
      });
    }

    // Validate transactionId if provided
    if (typeof transactionId !== 'undefined') {
      const trimmedTx = String(transactionId).trim();
      if (trimmedTx.length === 0) {
        return res.status(400).json({ success: false, message: 'Transaction ID cannot be empty' });
      }
      const txPattern = /^[A-Za-z0-9_-]{4,100}$/;
      if (!txPattern.test(trimmedTx)) {
        return res.status(400).json({ success: false, message: 'Invalid transaction ID format' });
      }
    }

    // Validate referral code if provided (allow empty to clear)
    let validatedReferralCode = null;
    if (typeof referralCode !== 'undefined' && referralCode !== null && referralCode !== '') {
      const refUser = await User.findOne({ affiliateCode: referralCode.trim() });
      if (!refUser) {
        return res.status(400).json({ success: false, message: 'Invalid referral code' });
      }
      validatedReferralCode = referralCode.trim();
    } else if (referralCode === '') {
      validatedReferralCode = null; // explicit clear
    }

    const userCart = await Cart.findOne({ 'user._id': userId });
    if (!userCart) {
      return res.status(404).json({ success: false, message: 'User cart not found' });
    }

    const courseItem = userCart.courses.find(
      (item) => item.course._id.toString() === courseId.toString()
    );

    if (!courseItem) {
      return res.status(404).json({ success: false, message: "Course not found in user's cart" });
    }

    if (courseItem.isValidated) {
      return res.status(400).json({ success: false, message: 'Cannot edit a validated purchase' });
    }

    // Handle optional payment screenshot replacement
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'payment_screenshots',
      });
      fs.unlinkSync(req.file.path);
      courseItem.paymentScreenshot = uploadResult.secure_url;
    }

    if (typeof transactionId !== 'undefined') {
      courseItem.transactionId = String(transactionId).trim();
    }
    if (typeof referralCode !== 'undefined') {
      courseItem.referralCode = validatedReferralCode;
    }

    await userCart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      cart: userCart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending orders for admin dashboard
export const getPendingOrders = async (req, res) => {
  try {
    const carts = await Cart.find({
      'courses.isValidated': false
    });

    const pendingOrders = [];

    carts.forEach(cart => {
      cart.courses.forEach(courseItem => {
        if (!courseItem.isValidated) {
          pendingOrders.push({
            _id: `${cart.user._id}_${courseItem.course._id}`,
            user: cart.user,
            course: courseItem.course,
            referralCode: courseItem.referralCode,
            transactionId: courseItem.transactionId,
            paymentScreenshot: courseItem.paymentScreenshot,
            addedAt: courseItem.addedAt,
            status: 'pending'
          });
        }
      });
    });

    // Sort by most recent first
    pendingOrders.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    res.status(200).json({
      success: true,
      pendingOrders,
      totalPending: pendingOrders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

