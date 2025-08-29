import mongoose from "mongoose";
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";



const migrationName = "003_migrate_existing_user_balances";

export const up = async () => {
  // Running migration: ${migrationName}
  
  try {

    const usersWithEarnings = await User.find({
      affiliateEarnings: { $gt: 0 },
      $or: [
        { withdrawableBalance: 0 },
        { withdrawableBalance: { $exists: false } }
      ]
    });

    // Found ${usersWithEarnings.length} users with affiliate earnings to migrate.

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
            totalWithdrawn: 0, 
            pendingWithdrawals: 0 
          }
        });

        totalWithdrawableAmount += withdrawableAmount;
        migratedCount++;

        // Migrated user ${user.email}: affiliateEarnings=${user.affiliateEarnings}, withdrawableBalance=${withdrawableAmount}
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

    // Migration ${migrationName} completed successfully.
    // Migrated ${migratedCount} users with earnings.
    // Updated ${usersWithoutEarnings.modifiedCount} users without earnings.
    // Total withdrawable amount set: ${totalWithdrawableAmount}
    
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
  // Rolling back migration: ${migrationName}
  
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

    // Rollback ${migrationName} completed successfully.
    // Reset withdrawal balances for ${result.modifiedCount} users.
    
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