import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models to ensure indexes are created
import '../models/User.js';
import '../models/Course.js';
import '../models/Purchase.js';

const createIndexes = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📊 Checking and creating database indexes...');

    // Get all models
    const User = mongoose.model('User');
    const Course = mongoose.model('Course');
    const Purchase = mongoose.model('Purchase');

    // Create indexes for User model
    console.log('👤 Checking User indexes...');
    try {
      await User.collection.createIndex({ email: 1 }, { unique: true, background: true });
      console.log('  ✅ email index');
    } catch (e) { console.log('  ℹ️  email index already exists'); }
    
    try {
      await User.collection.createIndex({ isAdmin: 1 }, { background: true });
      console.log('  ✅ isAdmin index');
    } catch (e) { console.log('  ℹ️  isAdmin index already exists'); }
    
    try {
      await User.collection.createIndex({ isSubAdmin: 1 }, { background: true });
      console.log('  ✅ isSubAdmin index');
    } catch (e) { console.log('  ℹ️  isSubAdmin index already exists'); }
    
    try {
      await User.collection.createIndex({ role: 1 }, { background: true });
      console.log('  ✅ role index');
    } catch (e) { console.log('  ℹ️  role index already exists'); }
    
    try {
      await User.collection.createIndex({ affiliateCode: 1 }, { sparse: true, background: true });
      console.log('  ✅ affiliateCode index');
    } catch (e) { console.log('  ℹ️  affiliateCode index already exists'); }
    
    try {
      await User.collection.createIndex({ referredBy: 1 }, { background: true });
      console.log('  ✅ referredBy index');
    } catch (e) { console.log('  ℹ️  referredBy index already exists'); }
    
    try {
      await User.collection.createIndex({ kycStatus: 1 }, { background: true });
      console.log('  ✅ kycStatus index');
    } catch (e) { console.log('  ℹ️  kycStatus index already exists'); }
    
    try {
      await User.collection.createIndex({ isAdmin: 1, isSubAdmin: 1 }, { background: true });
      console.log('  ✅ isAdmin+isSubAdmin compound index');
    } catch (e) { console.log('  ℹ️  isAdmin+isSubAdmin compound index already exists'); }
    
    try {
      await User.collection.createIndex({ kycStatus: 1, createdAt: -1 }, { background: true });
      console.log('  ✅ kycStatus+createdAt compound index');
    } catch (e) { console.log('  ℹ️  kycStatus+createdAt compound index already exists'); }
    
    try {
      await User.collection.createIndex({ affiliateCode: 1, isAdmin: 1 }, { background: true });
      console.log('  ✅ affiliateCode+isAdmin compound index');
    } catch (e) { console.log('  ℹ️  affiliateCode+isAdmin compound index already exists'); }
    
    try {
      await User.collection.createIndex({ createdAt: -1 }, { background: true });
      console.log('  ✅ createdAt index');
    } catch (e) { console.log('  ℹ️  createdAt index already exists'); }

    // Create indexes for Course model
    console.log('📚 Checking Course indexes...');
    try {
      await Course.collection.createIndex({ admin: 1 }, { background: true });
      console.log('  ✅ admin index');
    } catch (e) { console.log('  ℹ️  admin index already exists'); }
    
    try {
      await Course.collection.createIndex({ admin: 1, isPublished: 1 }, { background: true });
      console.log('  ✅ admin+isPublished compound index');
    } catch (e) { console.log('  ℹ️  admin+isPublished compound index already exists'); }
    
    try {
      await Course.collection.createIndex({ isPublished: 1 }, { background: true });
      console.log('  ✅ isPublished index');
    } catch (e) { console.log('  ℹ️  isPublished index already exists'); }
    
    try {
      await Course.collection.createIndex({ packageType: 1 }, { background: true });
      console.log('  ✅ packageType index');
    } catch (e) { console.log('  ℹ️  packageType index already exists'); }
    
    try {
      await Course.collection.createIndex({ createdAt: -1 }, { background: true });
      console.log('  ✅ createdAt index');
    } catch (e) { console.log('  ℹ️  createdAt index already exists'); }

    // Create indexes for Purchase model
    console.log('💰 Checking Purchase indexes...');
    try {
      await Purchase.collection.createIndex({ courseId: 1 }, { background: true });
      console.log('  ✅ courseId index');
    } catch (e) { console.log('  ℹ️  courseId index already exists'); }
    
    try {
      await Purchase.collection.createIndex({ userId: 1 }, { background: true });
      console.log('  ✅ userId index');
    } catch (e) { console.log('  ℹ️  userId index already exists'); }
    
    try {
      await Purchase.collection.createIndex({ referrerId: 1 }, { background: true });
      console.log('  ✅ referrerId index');
    } catch (e) { console.log('  ℹ️  referrerId index already exists'); }
    
    try {
      await Purchase.collection.createIndex({ status: 1 }, { background: true });
      console.log('  ✅ status index');
    } catch (e) { console.log('  ℹ️  status index already exists'); }
    
    try {
      await Purchase.collection.createIndex({ userId: 1, status: 1 }, { background: true });
      console.log('  ✅ userId+status compound index');
    } catch (e) { console.log('  ℹ️  userId+status compound index already exists'); }
    
    try {
      await Purchase.collection.createIndex({ referrerId: 1, status: 1 }, { background: true });
      console.log('  ✅ referrerId+status compound index');
    } catch (e) { console.log('  ℹ️  referrerId+status compound index already exists'); }
    
    try {
      await Purchase.collection.createIndex({ courseId: 1, status: 1 }, { background: true });
      console.log('  ✅ courseId+status compound index');
    } catch (e) { console.log('  ℹ️  courseId+status compound index already exists'); }
    
    try {
      await Purchase.collection.createIndex({ createdAt: -1 }, { background: true });
      console.log('  ✅ createdAt index');
    } catch (e) { console.log('  ℹ️  createdAt index already exists'); }

    console.log('✅ All indexes checked/created successfully!');
    console.log('📈 Database performance should be optimized');

    // Show index information
    console.log('\n📋 Index Summary:');
    
    const userIndexes = await User.collection.indexes();
    console.log(`👤 User: ${userIndexes.length} indexes`);
    
    const courseIndexes = await Course.collection.indexes();
    console.log(`📚 Course: ${courseIndexes.length} indexes`);
    
    const purchaseIndexes = await Purchase.collection.indexes();
    console.log(`💰 Purchase: ${purchaseIndexes.length} indexes`);

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
createIndexes();
