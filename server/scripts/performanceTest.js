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
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🚀 Running performance tests...\n');

    const User = mongoose.model('User');
    const Course = mongoose.model('Course');
    const Purchase = mongoose.model('Purchase');

    // Test 1: Get all courses
    console.log('📚 Test 1: Get all courses');
    const start1 = Date.now();
    const courses = await Course.find()
      .populate({ path: "admin", select: "firstName lastName imageUrl" })
      .select("-courseContent -enrolledStudents")
      .lean();
    const end1 = Date.now();
    console.log(`  ⏱️  Time: ${end1 - start1}ms`);
    console.log(`  📊 Results: ${courses.length} courses\n`);

    // Test 2: Get all purchases with population
    console.log('💰 Test 2: Get all purchases with population');
    const start2 = Date.now();
    const purchases = await Purchase.find()
      .populate('userId', 'firstName lastName email')
      .populate('courseId', 'courseTitle coursePrice')
      .populate('referrerId', 'firstName lastName email affiliateCode')
      .lean();
    const end2 = Date.now();
    console.log(`  ⏱️  Time: ${end2 - start2}ms`);
    console.log(`  📊 Results: ${purchases.length} purchases\n`);

    // Test 3: Get admin users
    console.log('👑 Test 3: Get admin users');
    const start3 = Date.now();
    const admins = await User.find({ isAdmin: true }).lean();
    const end3 = Date.now();
    console.log(`  ⏱️  Time: ${end3 - start3}ms`);
    console.log(`  📊 Results: ${admins.length} admins\n`);

    // Test 4: Complex aggregation (enrolled students)
    console.log('🎓 Test 4: Complex aggregation (enrolled students)');
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
    console.log(`  ⏱️  Time: ${end4 - start4}ms`);
    console.log(`  📊 Results: ${enrolledStudents.length} students\n`);

    // Test 5: Count operations
    console.log('🔢 Test 5: Count operations');
    const start5 = Date.now();
    const [userCount, courseCount, purchaseCount] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Purchase.countDocuments()
    ]);
    const end5 = Date.now();
    console.log(`  ⏱️  Time: ${end5 - start5}ms`);
    console.log(`  📊 Results: ${userCount} users, ${courseCount} courses, ${purchaseCount} purchases\n`);

    console.log('✅ Performance tests completed!');
    console.log('📈 If times are under 100ms, your database is performing well!');

  } catch (error) {
    console.error('❌ Error in performance test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the performance test
performanceTest();
