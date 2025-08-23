import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const testAdmin = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Checking admin users...');
    
    // Get all users
    const allUsers = await User.find({});
    console.log('👥 Total users found:', allUsers.length);
    
    // Check for admin users
    const adminUsers = await User.find({
      $or: [
        { isAdmin: true },
        { role: 'admin' },
        { isSubAdmin: true },
        { role: 'subadmin' }
      ]
    });
    
    console.log('\n👑 Admin/SubAdmin users found:', adminUsers.length);
    
    if (adminUsers.length > 0) {
      adminUsers.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`Name: ${user.firstName} ${user.lastName}`);
        console.log(`Email: ${user.email}`);
        console.log(`isAdmin: ${user.isAdmin}`);
        console.log(`isSubAdmin: ${user.isSubAdmin}`);
        console.log(`role: ${user.role}`);
        console.log(`ID: ${user._id}`);
      });
    } else {
      console.log('❌ No admin users found');
    }

    // Check the specific user from the cart
    const cartUser = await User.findById('68a9bc8b1c75a4b1edf289f8');
    if (cartUser) {
      console.log('\n🛒 Cart user details:');
      console.log(`Name: ${cartUser.firstName} ${cartUser.lastName}`);
      console.log(`Email: ${cartUser.email}`);
      console.log(`isAdmin: ${cartUser.isAdmin}`);
      console.log(`isSubAdmin: ${cartUser.isSubAdmin}`);
      console.log(`role: ${cartUser.role}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the test
testAdmin();
