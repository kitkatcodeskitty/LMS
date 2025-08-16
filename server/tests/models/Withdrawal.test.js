import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import Withdrawal from '../../models/Withdrawal.js';
import User from '../../models/User.js';

// Mock mongoose connection for testing
beforeAll(async () => {
  // Use in-memory MongoDB for testing
  const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/lms_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clean up test data
  await Withdrawal.deleteMany({});
  await User.deleteMany({});
});

describe('Withdrawal Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'hashedpassword',
      withdrawableBalance: 1000,
      pendingWithdrawals: 0
    });
    await testUser.save();
  });

  describe('Mobile Banking Withdrawal', () => {
    test('should create valid mobile banking withdrawal', async () => {
      const withdrawalData = {
        userId: testUser._id,
        method: 'mobile_banking',
        amount: 500,
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      };

      const withdrawal = new Withdrawal(withdrawalData);
      const savedWithdrawal = await withdrawal.save();

      expect(savedWithdrawal.method).toBe('mobile_banking');
      expect(savedWithdrawal.amount).toBe(500);
      expect(savedWithdrawal.status).toBe('pending');
      expect(savedWithdrawal.mobileBankingDetails.accountHolderName).toBe('Test User');
    });

    test('should validate mobile number format', async () => {
      const withdrawalData = {
        userId: testUser._id,
        method: 'mobile_banking',
        amount: 500,
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '123456789', // Invalid format
          provider: 'eSewa'
        }
      };

      const withdrawal = new Withdrawal(withdrawalData);
      
      await expect(withdrawal.save()).rejects.toThrow('Invalid mobile number format');
    });

    test('should require mobile banking details when method is mobile_banking', async () => {
      const withdrawalData = {
        userId: testUser._id,
        method: 'mobile_banking',
        amount: 500
        // Missing mobileBankingDetails
      };

      const withdrawal = new Withdrawal(withdrawalData);
      
      await expect(withdrawal.save()).rejects.toThrow();
    });
  });

  describe('Bank Transfer Withdrawal', () => {
    test('should create valid bank transfer withdrawal', async () => {
      const withdrawalData = {
        userId: testUser._id,
        method: 'bank_transfer',
        amount: 750,
        bankTransferDetails: {
          accountName: 'Test User Account',
          accountNumber: 'ACC123456789',
          bankName: 'Test Bank'
        }
      };

      const withdrawal = new Withdrawal(withdrawalData);
      const savedWithdrawal = await withdrawal.save();

      expect(savedWithdrawal.method).toBe('bank_transfer');
      expect(savedWithdrawal.amount).toBe(750);
      expect(savedWithdrawal.bankTransferDetails.accountName).toBe('Test User Account');
    });

    test('should validate account number format', async () => {
      const withdrawalData = {
        userId: testUser._id,
        method: 'bank_transfer',
        amount: 500,
        bankTransferDetails: {
          accountName: 'Test User',
          accountNumber: '123', // Too short
          bankName: 'Test Bank'
        }
      };

      const withdrawal = new Withdrawal(withdrawalData);
      
      await expect(withdrawal.save()).rejects.toThrow('Invalid account number format');
    });
  });

  describe('Validation', () => {
    test('should reject negative withdrawal amounts', async () => {
      const withdrawalData = {
        userId: testUser._id,
        method: 'mobile_banking',
        amount: -100,
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      };

      const withdrawal = new Withdrawal(withdrawalData);
      
      await expect(withdrawal.save()).rejects.toThrow('Withdrawal amount must be greater than 0');
    });

    test('should reject zero withdrawal amounts', async () => {
      const withdrawalData = {
        userId: testUser._id,
        method: 'mobile_banking',
        amount: 0,
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      };

      const withdrawal = new Withdrawal(withdrawalData);
      
      await expect(withdrawal.save()).rejects.toThrow('Withdrawal amount must be greater than 0');
    });
  });

  describe('Instance Methods', () => {
    test('canBeEdited should return true for pending withdrawals', async () => {
      const withdrawal = new Withdrawal({
        userId: testUser._id,
        method: 'mobile_banking',
        amount: 500,
        status: 'pending',
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      });

      expect(withdrawal.canBeEdited()).toBe(true);
    });

    test('canBeEdited should return false for approved withdrawals', async () => {
      const withdrawal = new Withdrawal({
        userId: testUser._id,
        method: 'mobile_banking',
        amount: 500,
        status: 'approved',
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      });

      expect(withdrawal.canBeEdited()).toBe(false);
    });

    test('addEditHistory should add edit record', async () => {
      const withdrawal = new Withdrawal({
        userId: testUser._id,
        method: 'mobile_banking',
        amount: 500,
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      });

      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'hashedpassword',
        isAdmin: true
      });
      await adminUser.save();

      withdrawal.addEditHistory(adminUser._id, { amount: 600 }, { amount: 500 });

      expect(withdrawal.editHistory).toHaveLength(1);
      expect(withdrawal.editHistory[0].editedBy).toEqual(adminUser._id);
      expect(withdrawal.editHistory[0].changes.amount).toBe(600);
    });
  });

  describe('Static Methods', () => {
    test('getUserPendingAmount should calculate total pending withdrawals', async () => {
      // Create multiple pending withdrawals
      await Withdrawal.create([
        {
          userId: testUser._id,
          method: 'mobile_banking',
          amount: 300,
          status: 'pending',
          mobileBankingDetails: {
            accountHolderName: 'Test User',
            mobileNumber: '9812345678',
            provider: 'eSewa'
          }
        },
        {
          userId: testUser._id,
          method: 'bank_transfer',
          amount: 200,
          status: 'pending',
          bankTransferDetails: {
            accountName: 'Test User',
            accountNumber: 'ACC123456789',
            bankName: 'Test Bank'
          }
        },
        {
          userId: testUser._id,
          method: 'mobile_banking',
          amount: 100,
          status: 'approved', // This should not be counted
          mobileBankingDetails: {
            accountHolderName: 'Test User',
            mobileNumber: '9812345678',
            provider: 'eSewa'
          }
        }
      ]);

      const pendingAmount = await Withdrawal.getUserPendingAmount(testUser._id);
      expect(pendingAmount).toBe(500); // 300 + 200
    });
  });

  describe('Pre-save Middleware', () => {
    test('should generate transaction reference when status changes to approved', async () => {
      const withdrawal = new Withdrawal({
        userId: testUser._id,
        method: 'mobile_banking',
        amount: 500,
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      });

      await withdrawal.save();
      expect(withdrawal.transactionReference).toBeUndefined();

      withdrawal.status = 'approved';
      await withdrawal.save();

      expect(withdrawal.transactionReference).toBeDefined();
      expect(withdrawal.transactionReference).toMatch(/^WD[A-Z0-9]+$/);
    });
  });
});