import mongoose from "mongoose";
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";

/**
 * Migration: Set initial withdrawable balance values for existing users
 * This migration calculates and sets the withdrawable balance for existing users
 * based on their current affiliate earnings (50% of total affiliate earnings)
 */

const migrationName = "003_migrate_existing_user_balances";

export const up = async () => {
  console.log(`Running migration: ${migrationName}`);
  
  try {
    // Find all users with affiliate earnings but no withdrawable balance set
    const usersWithEarnings = await User.find({
      affiliateEarnings: { $gt: 0 },
      $or: [
        { withdrawableBalance: 0 },
        { withdrawableBalance: { $exists: false } }
      ]
    });

    console.log(`Found ${usersWithEarnings.length} users with affiliate earnings to migrate.`);

    let migratedCount = 0;
    let totalWithdrawableAmount = 0;

    // Process each user
    for (const user of usersWithEarnings) {
      try {
        // Calculate withdrawable balance as 50% of current affiliate earnings
        const withdrawableAmount = Math.floor(user.affiliateEarnings * 0.5);
        
        // Update user's withdrawable balance
        await User.findByIdAndUpdate(user._id, {
          $set: {
            withdrawableBalance: withdrawableAmount,
            totalWithdrawn: 0, // Ensure this is set
            pendingWithdrawals: 0 // Ensure this is set
          }
        });

        totalWithdrawableAmount += withdrawableAmount;
        migratedCount++;

        console.log(`Migrated user ${user.email}: affiliateEarnings=${user.affiliateEarnings}, withdrawableBalance=${withdrawableAmount}`);
      } catch (error) {
        console.error(`Failed to migrate user ${user._id}:`, error);
      }
    }

    // Also ensure users with no affiliate earnings have the fields set to 0
    const usersWithoutEarnings = await User.updateMany(
      {
        $or: [
          { affiliateEarnings: { $exists: false } },
          { affiliateEarnings: 0 }
        ],
        $or: [
          { withdrawableBalance: { $exists: false } },
          { totalWithdrawn: { $exists: false } },
          { pendingWithdrawals: { $exists: false } }
        ]
      },
      {
        $set: {
          affiliateEarnings: 0,
          withdrawableBalance: 0,
          totalWithdrawn: 0,
          pendingWithdrawals: 0
        }
      }
    );

    console.log(`Migration ${migrationName} completed successfully.`);
    console.log(`Migrated ${migratedCount} users with earnings.`);
    console.log(`Updated ${usersWithoutEarnings.modifiedCount} users without earnings.`);
    console.log(`Total withdrawable amount set: ${totalWithdrawableAmount}`);
    
    return {
      success: true,
      migratedUsersWithEarnings: migratedCount,
      updatedUsersWithoutEarnings: usersWithoutEarnings.modifiedCount,
      totalWithdrawableAmount,
      message: `Migrated ${migratedCount} users with earnings and updated ${usersWithoutEarnings.modifiedCount} users without earnings`
    };
  } catch (error) {
    console.error(`Migration ${migrationName} failed:`, error);
    throw error;
  }
};

export const down = async () => {
  console.log(`Rolling back migration: ${migrationName}`);
  
  try {
    // Reset all withdrawable balances to 0 but keep affiliate earnings
    const result = await User.updateMany(
      {},
      {
        $set: {
          withdrawableBalance: 0,
          totalWithdrawn: 0,
          pendingWithdrawals: 0
        }
      }
    );

    console.log(`Rollback ${migrationName} completed successfully.`);
    console.log(`Reset withdrawal balances for ${result.modifiedCount} users.`);
    
    return {
      success: true,
      resetCount: result.modifiedCount,
      message: `Reset withdrawal balances for ${result.modifiedCount} users`
    };
  } catch (error) {
    console.error(`Rollback ${migrationName} failed:`, error);
    throw error;
  }
};

export default {
  name: migrationName,
  up,
  down
};