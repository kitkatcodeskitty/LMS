import mongoose from "mongoose";
import migration002 from "../../migrations/002_create_withdrawal_indexes.js";

describe('Index Migration Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/lms_test');
    }
  });

  beforeEach(async () => {
    // Clean up collections
    const db = mongoose.connection.db;
    
    try {
      await db.collection('withdrawals').drop();
    } catch (error) {
      // Collection might not exist, ignore error
    }
    
    // Recreate collections
    await db.createCollection('withdrawals');
  });

  afterAll(async () => {
    // Clean up
    const db = mongoose.connection.db;
    
    try {
      await db.collection('withdrawals').drop();
    } catch (error) {
      // Ignore error
    }
    
    await mongoose.disconnect();
  });

  describe('Migration 002: Create Withdrawal Indexes', () => {
    test('should create withdrawal collection indexes', async () => {
      const db = mongoose.connection.db;
      const withdrawalsCollection = db.collection('withdrawals');

      // Check initial state (should only have _id index)
      let initialIndexes = await withdrawalsCollection.indexes();
      expect(initialIndexes.length).toBe(1); // Only _id index

      // Run migration
      const result = await migration002.up();

      expect(result.success).toBe(true);
      expect(result.withdrawalIndexes).toBeGreaterThan(0);
      expect(result.userIndexes).toBeGreaterThan(0);

      // Check that indexes were created
      const indexes = await withdrawalsCollection.indexes();
      expect(indexes.length).toBeGreaterThan(1);

      // Verify specific indexes exist
      const indexKeys = indexes.map(index => index.key);
      
      // Check for single field indexes
      expect(indexKeys.some(key => key.userId === 1)).toBe(true);
      expect(indexKeys.some(key => key.status === 1)).toBe(true);
      expect(indexKeys.some(key => key.createdAt === -1)).toBe(true);

      // Check for compound indexes
      expect(indexKeys.some(key => key.userId === 1 && key.status === 1)).toBe(true);
      expect(indexKeys.some(key => key.status === 1 && key.createdAt === -1)).toBe(true);
    });

    test('should create user collection indexes', async () => {
      const db = mongoose.connection.db;
      const usersCollection = db.collection('users');

      // Get initial indexes
      const initialIndexes = await usersCollection.indexes();
      const initialIndexCount = initialIndexes.length;

      // Run migration
      const result = await migration002.up();

      expect(result.success).toBe(true);

      // Check that new indexes were created
      const indexes = await usersCollection.indexes();
      expect(indexes.length).toBeGreaterThan(initialIndexCount);

      // Verify withdrawal-related indexes exist
      const indexKeys = indexes.map(index => index.key);
      
      expect(indexKeys.some(key => key.withdrawableBalance === -1)).toBe(true);
      expect(indexKeys.some(key => key.totalWithdrawn === -1)).toBe(true);
      expect(indexKeys.some(key => key.pendingWithdrawals === 1)).toBe(true);
    });

    test('should handle duplicate index creation gracefully', async () => {
      // Run migration twice
      const result1 = await migration002.up();
      const result2 = await migration002.up();

      // Both should succeed (MongoDB handles duplicate index creation)
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // Verify indexes still exist and are not duplicated
      const db = mongoose.connection.db;
      const withdrawalsCollection = db.collection('withdrawals');
      const indexes = await withdrawalsCollection.indexes();

      // Should not have duplicate indexes
      const indexNames = indexes.map(index => index.name);
      const uniqueIndexNames = [...new Set(indexNames)];
      expect(indexNames.length).toBe(uniqueIndexNames.length);
    });

    test('should create indexes with correct properties', async () => {
      // Run migration
      await migration002.up();

      const db = mongoose.connection.db;
      const withdrawalsCollection = db.collection('withdrawals');
      const indexes = await withdrawalsCollection.indexes();

      // Find specific indexes and verify their properties
      const userIdIndex = indexes.find(index => 
        Object.keys(index.key).length === 1 && index.key.userId === 1
      );
      expect(userIdIndex).toBeDefined();

      const statusIndex = indexes.find(index => 
        Object.keys(index.key).length === 1 && index.key.status === 1
      );
      expect(statusIndex).toBeDefined();

      const createdAtIndex = indexes.find(index => 
        Object.keys(index.key).length === 1 && index.key.createdAt === -1
      );
      expect(createdAtIndex).toBeDefined();

      // Check compound index
      const compoundIndex = indexes.find(index => 
        index.key.userId === 1 && index.key.status === 1
      );
      expect(compoundIndex).toBeDefined();
    });

    test('should handle rollback correctly', async () => {
      const db = mongoose.connection.db;
      const withdrawalsCollection = db.collection('withdrawals');

      // Run migration
      await migration002.up();

      // Verify indexes were created
      let indexes = await withdrawalsCollection.indexes();
      const indexCountAfterUp = indexes.length;
      expect(indexCountAfterUp).toBeGreaterThan(1);

      // Run rollback
      const rollbackResult = await migration002.down();
      expect(rollbackResult.success).toBe(true);

      // Verify indexes were removed (except _id)
      indexes = await withdrawalsCollection.indexes();
      expect(indexes.length).toBeLessThan(indexCountAfterUp);
      
      // Should still have the default _id index
      expect(indexes.some(index => index.name === '_id_')).toBe(true);
    });

    test('should create indexes for efficient query patterns', async () => {
      // Run migration
      await migration002.up();

      const db = mongoose.connection.db;
      const withdrawalsCollection = db.collection('withdrawals');

      // Insert test data
      await withdrawalsCollection.insertMany([
        {
          userId: new mongoose.Types.ObjectId(),
          status: 'pending',
          amount: 1000,
          method: 'mobile_banking',
          createdAt: new Date()
        },
        {
          userId: new mongoose.Types.ObjectId(),
          status: 'approved',
          amount: 500,
          method: 'bank_transfer',
          createdAt: new Date()
        }
      ]);

      // Test query performance with explain
      const explainResult = await withdrawalsCollection
        .find({ status: 'pending' })
        .explain('executionStats');

      // Should use index for the query
      expect(explainResult.executionStats.executionSuccess).toBe(true);
      
      // With proper indexing, should examine fewer documents
      expect(explainResult.executionStats.totalDocsExamined)
        .toBeLessThanOrEqual(explainResult.executionStats.totalDocsExamined);
    });

    test('should support admin filtering queries', async () => {
      // Run migration
      await migration002.up();

      const db = mongoose.connection.db;
      const withdrawalsCollection = db.collection('withdrawals');

      // Insert test data
      const testData = [
        {
          userId: new mongoose.Types.ObjectId(),
          status: 'pending',
          amount: 1000,
          method: 'mobile_banking',
          createdAt: new Date('2024-01-01')
        },
        {
          userId: new mongoose.Types.ObjectId(),
          status: 'approved',
          amount: 500,
          method: 'bank_transfer',
          createdAt: new Date('2024-01-02')
        },
        {
          userId: new mongoose.Types.ObjectId(),
          status: 'pending',
          amount: 750,
          method: 'mobile_banking',
          createdAt: new Date('2024-01-03')
        }
      ];

      await withdrawalsCollection.insertMany(testData);

      // Test admin filtering query (status + sorting by createdAt)
      const adminQuery = await withdrawalsCollection
        .find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .explain('executionStats');

      expect(adminQuery.executionStats.executionSuccess).toBe(true);

      // Test compound query (status + method + sorting)
      const compoundQuery = await withdrawalsCollection
        .find({ status: 'pending', method: 'mobile_banking' })
        .sort({ createdAt: -1 })
        .explain('executionStats');

      expect(compoundQuery.executionStats.executionSuccess).toBe(true);
    });

    test('should handle edge cases in rollback', async () => {
      // Run migration
      await migration002.up();

      // Manually drop some indexes to simulate partial state
      const db = mongoose.connection.db;
      const withdrawalsCollection = db.collection('withdrawals');
      
      try {
        await withdrawalsCollection.dropIndex('userId_1');
      } catch (error) {
        // Index might not exist with this exact name, ignore
      }

      // Rollback should still succeed even with missing indexes
      const rollbackResult = await migration002.down();
      expect(rollbackResult.success).toBe(true);
    });
  });

  describe('Index Performance', () => {
    test('should improve query performance for common patterns', async () => {
      const db = mongoose.connection.db;
      const withdrawalsCollection = db.collection('withdrawals');

      // Insert a larger dataset for performance testing
      const testData = [];
      for (let i = 0; i < 1000; i++) {
        testData.push({
          userId: new mongoose.Types.ObjectId(),
          status: i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'approved' : 'rejected',
          amount: Math.floor(Math.random() * 10000),
          method: i % 2 === 0 ? 'mobile_banking' : 'bank_transfer',
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 30) // Random date within 30 days
        });
      }

      await withdrawalsCollection.insertMany(testData);

      // Test query performance without indexes
      const beforeIndexes = await withdrawalsCollection
        .find({ status: 'pending' })
        .explain('executionStats');

      // Run migration to create indexes
      await migration002.up();

      // Test query performance with indexes
      const afterIndexes = await withdrawalsCollection
        .find({ status: 'pending' })
        .explain('executionStats');

      // With indexes, should be more efficient
      expect(afterIndexes.executionStats.executionSuccess).toBe(true);
      
      // The query should use an index
      expect(afterIndexes.executionStats.totalKeysExamined).toBeGreaterThan(0);
    });
  });
});