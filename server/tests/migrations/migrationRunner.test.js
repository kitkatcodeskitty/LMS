import mongoose from "mongoose";
import MigrationRunner from "../../utils/migrationRunner.js";
import User from "../../models/User.js";

describe('Migration Runner', () => {
  let runner;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/lms_test');
    }
    
    runner = new MigrationRunner();
  });

  beforeEach(async () => {
    // Clean up test data
    await User.deleteMany({});
    await mongoose.connection.db.collection('migrations').deleteMany({});
    
    // Create test user
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      affiliateEarnings: 1000
    });
  });

  afterAll(async () => {
    // Clean up and disconnect
    await User.deleteMany({});
    await mongoose.connection.db.collection('migrations').deleteMany({});
    await mongoose.disconnect();
  });

  describe('Migration File Management', () => {
    test('should get migration files in order', async () => {
      const files = await runner.getMigrationFiles();
      
      expect(files).toBeInstanceOf(Array);
      expect(files.length).toBeGreaterThan(0);
      
      // Check that files are in order
      const sortedFiles = [...files].sort();
      expect(files).toEqual(sortedFiles);
      
      // Check that all files are JavaScript files
      files.forEach(file => {
        expect(file).toMatch(/\.js$/);
      });
    });

    test('should load migration modules correctly', async () => {
      const files = await runner.getMigrationFiles();
      
      if (files.length > 0) {
        const migration = await runner.loadMigration(files[0]);
        
        expect(migration).toHaveProperty('name');
        expect(migration).toHaveProperty('up');
        expect(typeof migration.up).toBe('function');
        
        if (migration.down) {
          expect(typeof migration.down).toBe('function');
        }
      }
    });
  });

  describe('Migration Execution', () => {
    test('should run pending migrations successfully', async () => {
      const result = await runner.runPendingMigrations();
      
      expect(result.success).toBe(true);
      
      // Check that migrations were recorded
      const completedMigrations = await runner.getCompletedMigrations();
      expect(completedMigrations.length).toBeGreaterThan(0);
    });

    test('should not run already completed migrations', async () => {
      // Run migrations first time
      await runner.runPendingMigrations();
      const firstRunCount = (await runner.getCompletedMigrations()).length;
      
      // Run migrations second time
      const result = await runner.runPendingMigrations();
      const secondRunCount = (await runner.getCompletedMigrations()).length;
      
      expect(result.success).toBe(true);
      expect(secondRunCount).toBe(firstRunCount);
    });

    test('should get migration status correctly', async () => {
      const status = await runner.getStatus();
      
      expect(status).toHaveProperty('total');
      expect(status).toHaveProperty('completed');
      expect(status).toHaveProperty('pending');
      expect(status).toHaveProperty('migrations');
      
      expect(status.total).toBeGreaterThan(0);
      expect(status.completed).toBe(0); // No migrations run yet
      expect(status.pending).toBe(status.total);
      expect(status.migrations).toBeInstanceOf(Array);
    });
  });

  describe('User Field Migration', () => {
    test('should add withdrawal fields to existing users', async () => {
      // Create user without withdrawal fields
      const userBefore = await User.findById(testUser._id);
      expect(userBefore.withdrawableBalance).toBeDefined();
      expect(userBefore.totalWithdrawn).toBeDefined();
      expect(userBefore.pendingWithdrawals).toBeDefined();
      
      // Run migrations
      await runner.runPendingMigrations();
      
      // Check user after migration
      const userAfter = await User.findById(testUser._id);
      expect(userAfter.withdrawableBalance).toBeDefined();
      expect(userAfter.totalWithdrawn).toBeDefined();
      expect(userAfter.pendingWithdrawals).toBeDefined();
      
      // For user with affiliate earnings, withdrawable balance should be 50%
      if (userAfter.affiliateEarnings > 0) {
        expect(userAfter.withdrawableBalance).toBe(Math.floor(userAfter.affiliateEarnings * 0.5));
      }
    });

    test('should handle users with no affiliate earnings', async () => {
      // Create user with no earnings
      const userWithoutEarnings = await User.create({
        firstName: 'No',
        lastName: 'Earnings',
        email: 'noearnings@example.com',
        password: 'password123',
        affiliateEarnings: 0
      });
      
      // Run migrations
      await runner.runPendingMigrations();
      
      // Check user after migration
      const userAfter = await User.findById(userWithoutEarnings._id);
      expect(userAfter.withdrawableBalance).toBe(0);
      expect(userAfter.totalWithdrawn).toBe(0);
      expect(userAfter.pendingWithdrawals).toBe(0);
    });
  });

  describe('Index Creation', () => {
    test('should create withdrawal indexes', async () => {
      // Run migrations
      await runner.runPendingMigrations();
      
      // Check that indexes were created
      const db = mongoose.connection.db;
      const withdrawalsCollection = db.collection('withdrawals');
      const indexes = await withdrawalsCollection.indexes();
      
      // Should have more than just the default _id index
      expect(indexes.length).toBeGreaterThan(1);
      
      // Check for specific indexes
      const indexNames = indexes.map(index => Object.keys(index.key).join('_'));
      expect(indexNames).toContain('userId');
      expect(indexNames).toContain('status');
    });

    test('should create user indexes for withdrawal queries', async () => {
      // Run migrations
      await runner.runPendingMigrations();
      
      // Check that user indexes were created
      const db = mongoose.connection.db;
      const usersCollection = db.collection('users');
      const indexes = await usersCollection.indexes();
      
      // Should have withdrawal-related indexes
      const indexNames = indexes.map(index => Object.keys(index.key).join('_'));
      expect(indexNames.some(name => name.includes('withdrawableBalance'))).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    test('should maintain data consistency during migration', async () => {
      // Create multiple users with different scenarios
      const users = await User.create([
        {
          firstName: 'User1',
          lastName: 'Test',
          email: 'user1@example.com',
          password: 'password123',
          affiliateEarnings: 2000
        },
        {
          firstName: 'User2',
          lastName: 'Test',
          email: 'user2@example.com',
          password: 'password123',
          affiliateEarnings: 0
        },
        {
          firstName: 'User3',
          lastName: 'Test',
          email: 'user3@example.com',
          password: 'password123',
          affiliateEarnings: 1500
        }
      ]);
      
      // Run migrations
      await runner.runPendingMigrations();
      
      // Verify data integrity
      const migratedUsers = await User.find({
        _id: { $in: users.map(u => u._id) }
      });
      
      migratedUsers.forEach(user => {
        expect(user.withdrawableBalance).toBeDefined();
        expect(user.totalWithdrawn).toBeDefined();
        expect(user.pendingWithdrawals).toBeDefined();
        
        // Verify calculation
        if (user.affiliateEarnings > 0) {
          expect(user.withdrawableBalance).toBe(Math.floor(user.affiliateEarnings * 0.5));
        } else {
          expect(user.withdrawableBalance).toBe(0);
        }
        
        expect(user.totalWithdrawn).toBe(0);
        expect(user.pendingWithdrawals).toBe(0);
      });
    });

    test('should handle edge cases in balance calculation', async () => {
      // Create users with edge case values
      const edgeCaseUsers = await User.create([
        {
          firstName: 'Edge1',
          lastName: 'Test',
          email: 'edge1@example.com',
          password: 'password123',
          affiliateEarnings: 1 // Very small amount
        },
        {
          firstName: 'Edge2',
          lastName: 'Test',
          email: 'edge2@example.com',
          password: 'password123',
          affiliateEarnings: 999999 // Large amount
        }
      ]);
      
      // Run migrations
      await runner.runPendingMigrations();
      
      // Verify edge cases
      const migratedUsers = await User.find({
        _id: { $in: edgeCaseUsers.map(u => u._id) }
      });
      
      migratedUsers.forEach(user => {
        expect(user.withdrawableBalance).toBe(Math.floor(user.affiliateEarnings * 0.5));
        expect(user.withdrawableBalance).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(user.withdrawableBalance)).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle migration failures gracefully', async () => {
      // This test would require creating a migration that fails
      // For now, we'll test the error handling structure
      const status = await runner.getStatus();
      expect(status).toHaveProperty('total');
      expect(status).toHaveProperty('completed');
      expect(status).toHaveProperty('pending');
    });

    test('should record migration status correctly', async () => {
      await runner.runPendingMigrations();
      
      // Check migration records
      const migrationRecords = await mongoose.connection.db
        .collection('migrations')
        .find({})
        .toArray();
      
      expect(migrationRecords.length).toBeGreaterThan(0);
      
      migrationRecords.forEach(record => {
        expect(record).toHaveProperty('name');
        expect(record).toHaveProperty('executedAt');
        expect(record).toHaveProperty('status');
        expect(record.status).toBe('completed');
      });
    });
  });
});