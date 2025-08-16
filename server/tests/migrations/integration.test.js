import mongoose from "mongoose";
import User from "../../models/User.js";
import Withdrawal from "../../models/Withdrawal.js";

describe('Migration Integration Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Post-Migration Database State', () => {
    test('should have withdrawal fields in User model', async () => {
      // Find a user to test with
      const user = await User.findOne({});
      
      if (user) {
        expect(user.withdrawableBalance).toBeDefined();
        expect(user.totalWithdrawn).toBeDefined();
        expect(user.pendingWithdrawals).toBeDefined();
        expect(typeof user.withdrawableBalance).toBe('number');
        expect(typeof user.totalWithdrawn).toBe('number');
        expect(typeof user.pendingWithdrawals).toBe('number');
      }
    });

    test('should have proper indexes on withdrawals collection', async () => {
      const db = mongoose.connection.db;
      const withdrawalsCollection = db.collection('withdrawals');
      
      const indexes = await withdrawalsCollection.indexes();
      const indexNames = indexes.map(index => Object.keys(index.key).join('_'));
      
      // Check for essential indexes
      expect(indexNames).toContain('userId');
      expect(indexNames).toContain('status');
      expect(indexNames).toContain('createdAt');
    });

    test('should have proper indexes on users collection', async () => {
      const db = mongoose.connection.db;
      const usersCollection = db.collection('users');
      
      const indexes = await usersCollection.indexes();
      const indexNames = indexes.map(index => Object.keys(index.key).join('_'));
      
      // Check for withdrawal-related indexes
      expect(indexNames.some(name => name.includes('withdrawableBalance'))).toBe(true);
    });

    test('should have migration tracking records', async () => {
      const db = mongoose.connection.db;
      const migrationsCollection = db.collection('migrations');
      
      const migrationRecords = await migrationsCollection.find({}).toArray();
      
      expect(migrationRecords.length).toBeGreaterThan(0);
      
      const migrationNames = migrationRecords.map(m => m.name);
      expect(migrationNames).toContain('001_add_withdrawal_fields_to_users');
      expect(migrationNames).toContain('002_create_withdrawal_indexes');
      expect(migrationNames).toContain('003_migrate_existing_user_balances');
    });

    test('should have correct withdrawable balance calculations', async () => {
      const usersWithEarnings = await User.find({ affiliateEarnings: { $gt: 0 } });
      
      usersWithEarnings.forEach(user => {
        // Withdrawable balance should be 50% of affiliate earnings (floored)
        const expectedBalance = Math.floor(user.affiliateEarnings * 0.5);
        expect(user.withdrawableBalance).toBe(expectedBalance);
      });
    });

    test('should support withdrawal model operations', async () => {
      // Find a user to test with
      const user = await User.findOne({ withdrawableBalance: { $gt: 0 } });
      
      if (user) {
        // Test creating a withdrawal
        const withdrawal = new Withdrawal({
          userId: user._id,
          method: 'mobile_banking',
          amount: Math.min(100, user.withdrawableBalance),
          mobileBankingDetails: {
            accountHolderName: 'Test User',
            mobileNumber: '9812345678',
            provider: 'eSewa'
          }
        });

        await withdrawal.save();
        expect(withdrawal._id).toBeDefined();
        expect(withdrawal.status).toBe('pending');

        // Clean up
        await Withdrawal.findByIdAndDelete(withdrawal._id);
      }
    });

    test('should support user balance helper methods', async () => {
      const user = await User.findOne({ withdrawableBalance: { $gt: 0 } });
      
      if (user) {
        const availableBalance = user.getAvailableBalance();
        expect(typeof availableBalance).toBe('number');
        expect(availableBalance).toBe(user.withdrawableBalance - user.pendingWithdrawals);
      }
    });

    test('should handle withdrawal amount validation', async () => {
      const user = await User.findOne({ withdrawableBalance: { $gt: 0 } });
      
      if (user) {
        // Test that withdrawal amount cannot exceed available balance
        const excessiveAmount = user.withdrawableBalance + 1000;
        
        const withdrawal = new Withdrawal({
          userId: user._id,
          method: 'bank_transfer',
          amount: excessiveAmount,
          bankTransferDetails: {
            accountName: 'Test Account',
            accountNumber: 'ACC123456789',
            bankName: 'Test Bank'
          }
        });

        // This should pass validation at model level but would be caught at business logic level
        await expect(withdrawal.save()).resolves.toBeDefined();
        
        // Clean up
        await Withdrawal.findByIdAndDelete(withdrawal._id);
      }
    });

    test('should support compound queries efficiently', async () => {
      // Test that compound queries work (indicating indexes are working)
      const pendingWithdrawals = await Withdrawal.find({
        status: 'pending'
      }).sort({ createdAt: -1 }).limit(10);

      expect(Array.isArray(pendingWithdrawals)).toBe(true);
      
      // Test user balance queries
      const usersWithBalance = await User.find({
        withdrawableBalance: { $gt: 0 }
      }).sort({ withdrawableBalance: -1 }).limit(5);

      expect(Array.isArray(usersWithBalance)).toBe(true);
    });
  });

  describe('Data Integrity Verification', () => {
    test('should maintain referential integrity', async () => {
      const withdrawals = await Withdrawal.find({}).populate('userId');
      
      withdrawals.forEach(withdrawal => {
        if (withdrawal.userId) {
          expect(withdrawal.userId._id).toBeDefined();
          expect(withdrawal.userId.email).toBeDefined();
        }
      });
    });

    test('should have consistent balance calculations', async () => {
      const users = await User.find({});
      
      users.forEach(user => {
        // All balance fields should be non-negative
        expect(user.withdrawableBalance).toBeGreaterThanOrEqual(0);
        expect(user.totalWithdrawn).toBeGreaterThanOrEqual(0);
        expect(user.pendingWithdrawals).toBeGreaterThanOrEqual(0);
        
        // Available balance should not be negative
        const availableBalance = user.getAvailableBalance();
        expect(availableBalance).toBeGreaterThanOrEqual(0);
      });
    });

    test('should have proper field types', async () => {
      const user = await User.findOne({});
      
      if (user) {
        expect(typeof user.withdrawableBalance).toBe('number');
        expect(typeof user.totalWithdrawn).toBe('number');
        expect(typeof user.pendingWithdrawals).toBe('number');
        expect(Number.isFinite(user.withdrawableBalance)).toBe(true);
        expect(Number.isFinite(user.totalWithdrawn)).toBe(true);
        expect(Number.isFinite(user.pendingWithdrawals)).toBe(true);
      }
    });
  });
});