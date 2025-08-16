

import mongoose from 'mongoose';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import Withdrawal from '../models/Withdrawal.js';

export const up = async () => {
  console.log('Starting commission calculation fix migration...');
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Step 1: Fix all purchases - withdrawableAmount should equal affiliateAmount
    console.log('Fixing purchase withdrawable amounts...');
    const purchases = await Purchase.find({ affiliateAmount: { $gt: 0 } }).session(session);
    
    let purchaseUpdates = 0;
    for (const purchase of purchases) {
      if (purchase.withdrawableAmount !== purchase.affiliateAmount) {
        purchase.withdrawableAmount = purchase.affiliateAmount;
        await purchase.save({ session });
        purchaseUpdates++;
      }
    }
    console.log(`Updated ${purchaseUpdates} purchases`);
    
    // Step 2: Recalculate user withdrawable balances
    console.log('Recalculating user withdrawable balances...');
    const users = await User.find({ affiliateEarnings: { $gt: 0 } }).session(session);
    
    let userUpdates = 0;
    for (const user of users) {
      // Calculate correct withdrawable balance from purchases
      const userPurchases = await Purchase.find({ 
        referrerId: user._id, 
        status: 'completed' 
      }).session(session);
      
      const correctWithdrawableBalance = userPurchases.reduce((sum, purchase) => {
        return sum + (purchase.withdrawableAmount || 0);
      }, 0);
      
      const correctAffiliateEarnings = userPurchases.reduce((sum, purchase) => {
        return sum + (purchase.affiliateAmount || 0);
      }, 0);
      
      // Update user balance if different
      if (user.withdrawableBalance !== correctWithdrawableBalance || 
          user.affiliateEarnings !== correctAffiliateEarnings) {
        
        const oldWithdrawableBalance = user.withdrawableBalance;
        const oldAffiliateEarnings = user.affiliateEarnings;
        
        user.withdrawableBalance = correctWithdrawableBalance;
        user.affiliateEarnings = correctAffiliateEarnings;
        
        await user.save({ session });
        userUpdates++;
        
        console.log(`Updated user ${user.email}:`);
        console.log(`  Withdrawable: ${oldWithdrawableBalance} -> ${correctWithdrawableBalance}`);
        console.log(`  Affiliate: ${oldAffiliateEarnings} -> ${correctAffiliateEarnings}`);
      }
    }
    console.log(`Updated ${userUpdates} users`);
    
    // Step 3: Check for any pending withdrawals that might be affected
    console.log('Checking pending withdrawals...');
    const pendingWithdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('userId')
      .session(session);
    
    let withdrawalWarnings = 0;
    for (const withdrawal of pendingWithdrawals) {
      const user = withdrawal.userId;
      const availableBalance = user.getAvailableBalance();
      
      if (withdrawal.amount > availableBalance) {
        console.warn(`WARNING: Pending withdrawal ${withdrawal._id} for user ${user.email} exceeds available balance`);
        console.warn(`  Withdrawal amount: ${withdrawal.amount}, Available: ${availableBalance}`);
        withdrawalWarnings++;
      }
    }
    
    if (withdrawalWarnings > 0) {
      console.log(`Found ${withdrawalWarnings} pending withdrawals that may need manual review`);
    }
    
    await session.commitTransaction();
    console.log('Commission calculation fix migration completed successfully');
    
    return {
      success: true,
      purchaseUpdates,
      userUpdates,
      withdrawalWarnings
    };
    
  } catch (error) {
    await session.abortTransaction();
    console.error('Migration failed:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

export const down = async () => {
  console.log('Rolling back commission calculation fix...');
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Revert purchases - set withdrawableAmount back to affiliateAmount * 0.5
    console.log('Reverting purchase withdrawable amounts...');
    const purchases = await Purchase.find({ affiliateAmount: { $gt: 0 } }).session(session);
    
    let purchaseReverts = 0;
    for (const purchase of purchases) {
      const oldWithdrawableAmount = purchase.affiliateAmount * 0.5;
      if (purchase.withdrawableAmount !== oldWithdrawableAmount) {
        purchase.withdrawableAmount = oldWithdrawableAmount;
        await purchase.save({ session });
        purchaseReverts++;
      }
    }
    console.log(`Reverted ${purchaseReverts} purchases`);
    
    // Recalculate user balances with old logic
    console.log('Reverting user withdrawable balances...');
    const users = await User.find({ affiliateEarnings: { $gt: 0 } }).session(session);
    
    let userReverts = 0;
    for (const user of users) {
      const userPurchases = await Purchase.find({ 
        referrerId: user._id, 
        status: 'completed' 
      }).session(session);
      
      const oldWithdrawableBalance = userPurchases.reduce((sum, purchase) => {
        return sum + (purchase.withdrawableAmount || 0);
      }, 0);
      
      if (user.withdrawableBalance !== oldWithdrawableBalance) {
        user.withdrawableBalance = oldWithdrawableBalance;
        await user.save({ session });
        userReverts++;
      }
    }
    console.log(`Reverted ${userReverts} users`);
    
    await session.commitTransaction();
    console.log('Commission calculation rollback completed');
    
    return {
      success: true,
      purchaseReverts,
      userReverts
    };
    
  } catch (error) {
    await session.abortTransaction();
    console.error('Rollback failed:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

export default { up, down };