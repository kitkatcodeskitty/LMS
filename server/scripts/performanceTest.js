import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import '../models/User.js';
import '../models/Course.js';
import '../models/Purchase.js';

const performanceTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const User = mongoose.model('User');
    const Course = mongoose.model('Course');
    const Purchase = mongoose.model('Purchase');

    // Test 1: Get all courses
    const start1 = Date.now();
    const courses = await Course.find()
      .populate({ path: "admin", select: "firstName lastName imageUrl" })
      .select("-courseContent -enrolledStudents")
      .lean();
    const end1 = Date.now();

    // Test 2: Get all purchases with population
    const start2 = Date.now();
    const purchases = await Purchase.find()
      .populate('userId', 'firstName lastName email')
      .populate('courseId', 'courseTitle coursePrice')
      .populate('referrerId', 'firstName lastName email affiliateCode')
      .lean();
    const end2 = Date.now();

    // Test 3: Get admin users
    const start3 = Date.now();
    const admins = await User.find({ isAdmin: true }).lean();
    const end3 = Date.now();

    // Test 4: Complex aggregation (enrolled students)
    const start4 = Date.now();
    const enrolledStudents = await Purchase.aggregate([
      {
        $match: {
          status: 'completed'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $unwind: '$courseDetails'
      },
      {
        $group: {
          _id: '$userId',
          userDetails: { $first: '$userDetails' },
          totalSpent: { $sum: '$amount' },
          totalCourses: { $sum: 1 },
          totalAffiliateEarned: { $sum: '$affiliateAmount' }
        }
      },
      {
        $sort: { totalSpent: -1 }
      }
    ]);
    const end4 = Date.now();

    // Test 5: Count operations
    const start5 = Date.now();
    const [userCount, courseCount, purchaseCount] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Purchase.countDocuments()
    ]);
    const end5 = Date.now();

    // Performance tests completed

  } catch (error) {
    // Silent error handling
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run the performance test
performanceTest();
