import mongoose from "mongoose";


const migrationName = "002_create_withdrawal_indexes";

export const up = async () => {
  // Running migration: ${migrationName}
  
  try {
    const db = mongoose.connection.db;
    const withdrawalsCollection = db.collection('withdrawals');
    const usersCollection = db.collection('users');

    // Create indexes for Withdrawal collection
    const withdrawalIndexes = [
      // Single field indexes
      { userId: 1 },
      { status: 1 },
      { createdAt: -1 },
      { processedAt: -1 },
      // Skip transactionReference as it already exists with unique constraint
      
      // Compound indexes for efficient admin queries
      { userId: 1, status: 1 },
      { status: 1, createdAt: -1 },
      { userId: 1, createdAt: -1 },
      { status: 1, processedAt: -1 },
      { processedBy: 1, processedAt: -1 },
      
      // Index for admin filtering and sorting
      { status: 1, amount: -1 },
      { status: 1, method: 1, createdAt: -1 }
    ];

    // Create withdrawal indexes with error handling
    for (const index of withdrawalIndexes) {
      try {
        await withdrawalsCollection.createIndex(index);
        // Created withdrawal index: ${index}
      } catch (error) {
        if (error.code === 86) { // IndexKeySpecsConflict
          // Index already exists (skipping): ${index}
        } else {
          throw error;
        }
      }
    }

    // Create indexes for User collection (withdrawal-related queries)
    const userIndexes = [
      // Indexes for balance queries
      { withdrawableBalance: -1 },
      { totalWithdrawn: -1 },
      { pendingWithdrawals: 1 },
      
      // Compound index for affiliate earnings and withdrawals
      { affiliateEarnings: -1, withdrawableBalance: -1 },
      
      // Index for users with pending withdrawals
      { pendingWithdrawals: 1, withdrawableBalance: -1 }
    ];


    for (const index of userIndexes) {
      try {
        await usersCollection.createIndex(index);
        // Created user index: ${index}
      } catch (error) {
        if (error.code === 86) { // IndexKeySpecsConflict
          // Index already exists (skipping): ${index}
        } else {
          throw error;
        }
      }
    }

    // Migration ${migrationName} completed successfully.
    // Created ${withdrawalIndexes.length} withdrawal indexes and ${userIndexes.length} user indexes.
    
    return {
      success: true,
      withdrawalIndexes: withdrawalIndexes.length,
      userIndexes: userIndexes.length,
      message: `Created ${withdrawalIndexes.length + userIndexes.length} total indexes`
    };
  } catch (error) {
    console.error(`Migration ${migrationName} failed:`, error);
    throw error;
  }
};

export const down = async () => {
  // Rolling back migration: ${migrationName}
  
  try {
    const db = mongoose.connection.db;
    const withdrawalsCollection = db.collection('withdrawals');
    const usersCollection = db.collection('users');

    // Get existing indexes
    const withdrawalIndexes = await withdrawalsCollection.indexes();
    const userIndexes = await usersCollection.indexes();

    let droppedCount = 0;

    // Drop withdrawal indexes (except _id_ which is default)
    for (const index of withdrawalIndexes) {
      if (index.name !== '_id_') {
        try {
          await withdrawalsCollection.dropIndex(index.name);
          // Dropped withdrawal index: ${index.name}
          droppedCount++;
        } catch (error) {
          // Index might not exist, continue
          // Could not drop withdrawal index ${index.name}: ${error.message}
        }
      }
    }

    // Drop user indexes related to withdrawals (be careful not to drop essential indexes)
    const withdrawalRelatedIndexes = [
      'withdrawableBalance_-1',
      'totalWithdrawn_-1', 
      'pendingWithdrawals_1',
      'affiliateEarnings_-1_withdrawableBalance_-1',
      'pendingWithdrawals_1_withdrawableBalance_-1'
    ];

    for (const indexName of withdrawalRelatedIndexes) {
      try {
        await usersCollection.dropIndex(indexName);
        // Dropped user index: ${indexName}
        droppedCount++;
      } catch (error) {
        // Index might not exist, continue
                  // Could not drop user index ${indexName}: ${error.message}
      }
    }

    // Rollback ${migrationName} completed successfully.
    // Dropped ${droppedCount} indexes.
    
    return {
      success: true,
      droppedCount,
      message: `Dropped ${droppedCount} indexes`
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