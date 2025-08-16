/**
 * Simple test script to verify withdrawal functionality
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import { Purchase } from './models/Purchase.js';
import Withdrawal from './models/Withdrawal.js';

dotenv.config();

const testWithdrawalSystem = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Check commission calculation
    console.log('\n📊 Testing Commission Calculation...');
    
    // Find a user with affiliate earnings
    const userWithEarnings = await User.findOne({ affiliateEarnings: { $gt: 0 } });
    if (userWithEarnings) {
      console.log(`User: ${userWithEarnings.email}`);
      console.log(`Affiliate Earnings: ${userWithEarnings.affiliateEarnings}`);
      console.log(`Withdrawable Balance: ${userWithEarnings.withdrawableBalance}`);
      console.log(`Available Balance: ${userWithEarnings.getAvailableBalance()}`);
      
      // Check if withdrawable balance equals affiliate earnings (50% commission fix)
      if (userWithEarnings.withdrawableBalance === userWithEarnings.affiliateEarnings) {
        console.log('✅ Commission calculation is correct (50%)');
      } else {
        console.log('❌ Commission calculation issue detected');
      }
    }

    // Test 2: Check purchase withdrawable amounts
    console.log('\n💰 Testing Purchase Withdrawable Amounts...');
    const samplePurchases = await Purchase.find({ affiliateAmount: { $gt: 0 } }).limit(3);
    
    for (const purchase of samplePurchases) {
      console.log(`Purchase ID: ${purchase._id}`);
      console.log(`Affiliate Amount: ${purchase.affiliateAmount}`);
      console.log(`Withdrawable Amount: ${purchase.withdrawableAmount}`);
      
      if (purchase.withdrawableAmount === purchase.affiliateAmount) {
        console.log('✅ Withdrawable amount is correct');
      } else {
        console.log('❌ Withdrawable amount mismatch');
      }
    }

    // Test 3: Check pending withdrawals
    console.log('\n⏳ Testing Pending Withdrawals...');
    const pendingWithdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('userId', 'email withdrawableBalance pendingWithdrawals')
      .limit(5);

    if (pendingWithdrawals.length === 0) {
      console.log('No pending withdrawals found');
    } else {
      for (const withdrawal of pendingWithdrawals) {
        const user = withdrawal.userId;
        const availableBalance = user.withdrawableBalance - user.pendingWithdrawals;
        
        console.log(`Withdrawal ID: ${withdrawal._id}`);
        console.log(`User: ${user.email}`);
        console.log(`Amount: ${withdrawal.amount}`);
        console.log(`Available Balance: ${availableBalance}`);
        
        if (withdrawal.amount <= availableBalance) {
          console.log('✅ Withdrawal amount is valid');
        } else {
          console.log('❌ Withdrawal amount exceeds available balance');
        }
      }
    }

    console.log('\n🎉 Withdrawal system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
};

// Run the test
testWithdrawalSystem();