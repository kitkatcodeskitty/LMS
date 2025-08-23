import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Cart from './models/Cart.js';

// Load environment variables
dotenv.config();

const testCart = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Checking Cart collection...');
    
    // Get all carts
    const allCarts = await Cart.find({});
    console.log('📦 Total carts found:', allCarts.length);
    
    if (allCarts.length > 0) {
      console.log('\n📋 First cart details:');
      console.log(JSON.stringify(allCarts[0], null, 2));
      
      // Check for pending orders
      const pendingCarts = await Cart.find({
        'courses.isValidated': false
      });
      console.log('\n⏳ Carts with pending orders:', pendingCarts.length);
      
      if (pendingCarts.length > 0) {
        console.log('\n📝 Pending orders details:');
        pendingCarts.forEach((cart, index) => {
          console.log(`\nCart ${index + 1}:`);
          console.log(`User: ${cart.user.firstName} ${cart.user.lastName}`);
          cart.courses.forEach((course, cIndex) => {
            if (!course.isValidated) {
              console.log(`  Course ${cIndex + 1}: ${course.course.courseTitle} (Validated: ${course.isValidated})`);
            }
          });
        });
      }
    } else {
      console.log('❌ No carts found in database');
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
testCart();
