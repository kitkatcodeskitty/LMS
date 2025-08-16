import mongoose from "mongoose";
import User from "../../models/User.js";
import migration001 from "../../migrations/001_add_withdrawal_fields_to_users.js";
import migration003 from "../../migrations/003_migrate_existing_user_balances.js";

describe('User Migration Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/lms_test');
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  describe('Migration 001: Add Withdrawal Fields', () => {
    test('should add withdrawal fields to users without them', async () => {
      // Create users using direct MongoDB insertion to bypass schema defaults
      const db = mongoose.connection.db;
      const usersCollection = db.collection('users');
      
      await usersCollection.insertMany([
        {
          firstName: 'User1',
          lastName: 'Test',
          email: 'user1@example.com',
          password: 'password123',
          affiliateEarnings: 1000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          firstName: 'User2',
          lastName: 'Test',
          email: 'user2@example.com',
          password: 'password123',
          affiliateEarnings: 500,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      // Run migration
      const result = await migration001.up();

      expect(result.success).toBe(true);
      expect(result.modifiedCount).toBe(2);

      // Verify fields were added
      const users = await User.find({});
      users.forEach(user => {
        expect(user.withdrawableBalance).toBe(0);
        expect(user.totalWithdrawn).toBe(0);
        expect(user.pendingWithdrawals).toBe(0);
      });
    });

    test('should not modify users who already have withdrawal fields', async () => {
      // Create users with withdrawal fields already present
      await User.create([
        {
          firstName: 'User1',
          lastName: 'Test',
          email: 'user1@example.com',
          password: 'password123',
          affiliateEarnings: 1000,
          withdrawableBalance: 500,
          totalWithdrawn: 100,
          pendingWithdrawals: 50
        }
      ]);

      // Run migration
      const result = await migration001.up();

      expect(result.success).toBe(true);
      expect(result.modifiedCount).toBe(0); // No users should be modified

      // Verify original values are preserved
      const user = await User.findOne({ email: 'user1@example.com' });
      expect(user.withdrawableBalance).toBe(500);
      expect(user.totalWithdrawn).toBe(100);
      expect(user.pendingWithdrawals).toBe(50);
    });

    test('should handle rollback correctly', async () => {
      // Create users with withdrawal fields
      await User.create([
        {
          firstName: 'User1',
          lastName: 'Test',
          email: 'user1@example.com',
          password: 'password123',
          withdrawableBalance: 500,
          totalWithdrawn: 100,
          pendingWithdrawals: 50
        }
      ]);

      // Run rollback
      const result = await migration001.down();

      expect(result.success).toBe(true);

      // Verify fields were removed (using direct MongoDB query)
      const db = mongoose.connection.db;
      const usersCollection = db.collection('users');
      const users = await usersCollection.find({}).toArray();

      users.forEach(user => {
        expect(user.withdrawableBalance).toBeUndefined();
        expect(user.totalWithdrawn).toBeUndefined();
        expect(user.pendingWithdrawals).toBeUndefined();
      });
    });
  });

  describe('Migration 003: Migrate Existing User Balances', () => {
    test('should calculate withdrawable balance as 50% of affiliate earnings', async () => {
      // Create users with affiliate earnings
      await User.create([
        {
          firstName: 'User1',
          lastName: 'Test',
          email: 'user1@example.com',
          password: 'password123',
          affiliateEarnings: 2000,
          withdrawableBalance: 0
        },
        {
          firstName: 'User2',
          lastName: 'Test',
          email: 'user2@example.com',
          password: 'password123',
          affiliateEarnings: 1500,
          withdrawableBalance: 0
        }
      ]);

      // Run migration
      const result = await migration003.up();

      expect(result.success).toBe(true);
      expect(result.migratedUsersWithEarnings).toBe(2);

      // Verify calculations
      const users = await User.find({}).sort({ email: 1 });
      expect(users[0].withdrawableBalance).toBe(1000); // 50% of 2000
      expect(users[1].withdrawableBalance).toBe(750);  // 50% of 1500
    });

    test('should handle users with no affiliate earnings', async () => {
      // Create users without earnings
      await User.create([
        {
          firstName: 'User1',
          lastName: 'Test',
          email: 'user1@example.com',
          password: 'password123',
          affiliateEarnings: 0
        },
        {
          firstName: 'User2',
          lastName: 'Test',
          email: 'user2@example.com',
          password: 'password123'
          // No affiliateEarnings field
        }
      ]);

      // Run migration
      const result = await migration003.up();

      expect(result.success).toBe(true);
      expect(result.updatedUsersWithoutEarnings).toBeGreaterThanOrEqual(1);

      // Verify all fields are set to 0
      const users = await User.find({});
      users.forEach(user => {
        expect(user.affiliateEarnings).toBe(0);
        expect(user.withdrawableBalance).toBe(0);
        expect(user.totalWithdrawn).toBe(0);
        expect(user.pendingWithdrawals).toBe(0);
      });
    });

    test('should handle fractional calculations correctly', async () => {
      // Create users with odd affiliate earnings
      await User.create([
        {
          firstName: 'User1',
          lastName: 'Test',
          email: 'user1@example.com',
          password: 'password123',
          affiliateEarnings: 1001, // 50% = 500.5, should floor to 500
          withdrawableBalance: 0
        },
        {
          firstName: 'User2',
          lastName: 'Test',
          email: 'user2@example.com',
          password: 'password123',
          affiliateEarnings: 999, // 50% = 499.5, should floor to 499
          withdrawableBalance: 0
        }
      ]);

      // Run migration
      const result = await migration003.up();

      expect(result.success).toBe(true);

      // Verify flooring behavior
      const users = await User.find({}).sort({ email: 1 });
      expect(users[0].withdrawableBalance).toBe(500); // Math.floor(500.5)
      expect(users[1].withdrawableBalance).toBe(499); // Math.floor(499.5)
    });

    test('should not migrate users who already have withdrawable balance', async () => {
      // Create users with existing withdrawable balance
      await User.create([
        {
          firstName: 'User1',
          lastName: 'Test',
          email: 'user1@example.com',
          password: 'password123',
          affiliateEarnings: 2000,
          withdrawableBalance: 800 // Already has balance
        }
      ]);

      // Run migration
      const result = await migration003.up();

      expect(result.success).toBe(true);
      expect(result.migratedUsersWithEarnings).toBe(0); // No users migrated

      // Verify original balance is preserved
      const user = await User.findOne({ email: 'user1@example.com' });
      expect(user.withdrawableBalance).toBe(800); // Original value preserved
    });

    test('should handle rollback correctly', async () => {
      // Create users with withdrawable balances
      await User.create([
        {
          firstName: 'User1',
          lastName: 'Test',
          email: 'user1@example.com',
          password: 'password123',
          affiliateEarnings: 2000,
          withdrawableBalance: 1000,
          totalWithdrawn: 200,
          pendingWithdrawals: 100
        }
      ]);

      // Run rollback
      const result = await migration003.down();

      expect(result.success).toBe(true);

      // Verify withdrawal balances are reset but affiliate earnings preserved
      const user = await User.findOne({ email: 'user1@example.com' });
      expect(user.affiliateEarnings).toBe(2000); // Preserved
      expect(user.withdrawableBalance).toBe(0);  // Reset
      expect(user.totalWithdrawn).toBe(0);       // Reset
      expect(user.pendingWithdrawals).toBe(0);   // Reset
    });
  });

  describe('Migration Integration', () => {
    test('should run migrations in sequence correctly', async () => {
      // Create users using direct MongoDB insertion (no schema defaults)
      const db = mongoose.connection.db;
      const usersCollection = db.collection('users');
      
      await usersCollection.insertMany([
        {
          firstName: 'User1',
          lastName: 'Test',
          email: 'user1@example.com',
          password: 'password123',
          affiliateEarnings: 2000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      // Run migration 001 first
      await migration001.up();

      // Verify fields added with default values
      let user = await User.findOne({ email: 'user1@example.com' });
      expect(user.withdrawableBalance).toBe(0);
      expect(user.totalWithdrawn).toBe(0);
      expect(user.pendingWithdrawals).toBe(0);

      // Run migration 003
      await migration003.up();

      // Verify balance calculated correctly
      user = await User.findOne({ email: 'user1@example.com' });
      expect(user.withdrawableBalance).toBe(1000); // 50% of 2000
      expect(user.totalWithdrawn).toBe(0);
      expect(user.pendingWithdrawals).toBe(0);
    });

    test('should maintain data consistency across migrations', async () => {
      // Create multiple users with different scenarios
      await User.create([
        {
          firstName: 'User1',
          lastName: 'Test',
          email: 'user1@example.com',
          password: 'password123',
          affiliateEarnings: 1000
        },
        {
          firstName: 'User2',
          lastName: 'Test',
          email: 'user2@example.com',
          password: 'password123',
          affiliateEarnings: 0
        }
      ]);

      // Run all migrations
      await migration001.up();
      await migration003.up();

      // Verify final state
      const users = await User.find({}).sort({ email: 1 });
      
      // User with earnings
      expect(users[0].affiliateEarnings).toBe(1000);
      expect(users[0].withdrawableBalance).toBe(500);
      expect(users[0].totalWithdrawn).toBe(0);
      expect(users[0].pendingWithdrawals).toBe(0);
      
      // User without earnings
      expect(users[1].affiliateEarnings).toBe(0);
      expect(users[1].withdrawableBalance).toBe(0);
      expect(users[1].totalWithdrawn).toBe(0);
      expect(users[1].pendingWithdrawals).toBe(0);
    });
  });
});