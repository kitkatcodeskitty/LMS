import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import withdrawalRouter from '../../routes/withdrawalRoute.js';
import User from '../../models/User.js';
import Withdrawal from '../../models/Withdrawal.js';
import { createAccessToken } from '../../auth.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/withdrawals', withdrawalRouter);

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/lms_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Withdrawal.deleteMany({});
  await User.deleteMany({});
});

describe('Withdrawal API Integration Tests', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'hashedpassword',
      withdrawableBalance: 1000,
      pendingWithdrawals: 0,
      totalWithdrawn: 0,
      affiliateEarnings: 2000
    });
    await testUser.save();

    authToken = createAccessToken(testUser);
  });

  describe('POST /api/withdrawals/request', () => {
    test('should create mobile banking withdrawal request', async () => {
      const withdrawalData = {
        method: 'mobile_banking',
        amount: 500,
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      };

      const response = await request(app)
        .post('/api/withdrawals/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send(withdrawalData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.withdrawal.method).toBe('mobile_banking');
      expect(response.body.data.withdrawal.amount).toBe(500);
      expect(response.body.data.withdrawal.status).toBe('pending');

      // Verify database record
      const withdrawal = await Withdrawal.findOne({ userId: testUser._id });
      expect(withdrawal).toBeTruthy();
      expect(withdrawal.amount).toBe(500);
    });

    test('should create bank transfer withdrawal request', async () => {
      const withdrawalData = {
        method: 'bank_transfer',
        amount: 750,
        bankTransferDetails: {
          accountName: 'Test User Account',
          accountNumber: 'ACC123456789',
          bankName: 'Test Bank'
        }
      };

      const response = await request(app)
        .post('/api/withdrawals/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send(withdrawalData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.withdrawal.method).toBe('bank_transfer');
      expect(response.body.data.withdrawal.amount).toBe(750);
    });

    test('should reject unauthorized request', async () => {
      const withdrawalData = {
        method: 'mobile_banking',
        amount: 500,
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      };

      await request(app)
        .post('/api/withdrawals/request')
        .send(withdrawalData)
        .expect(401);
    });

    test('should reject withdrawal exceeding available balance', async () => {
      const withdrawalData = {
        method: 'mobile_banking',
        amount: 1500, // Exceeds available balance
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      };

      const response = await request(app)
        .post('/api/withdrawals/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send(withdrawalData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_BALANCE');
    });

    test('should reject invalid mobile number format', async () => {
      const withdrawalData = {
        method: 'mobile_banking',
        amount: 500,
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '123456789', // Invalid format
          provider: 'eSewa'
        }
      };

      const response = await request(app)
        .post('/api/withdrawals/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send(withdrawalData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/withdrawals/history', () => {
    beforeEach(async () => {
      // Create test withdrawal history
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
          amount: 500,
          status: 'approved',
          transactionReference: 'WD123456',
          bankTransferDetails: {
            accountName: 'Test User',
            accountNumber: 'ACC123456789',
            bankName: 'Test Bank'
          }
        }
      ]);
    });

    test('should return withdrawal history', async () => {
      const response = await request(app)
        .get('/api/withdrawals/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.withdrawals).toHaveLength(2);
      expect(response.body.data.pagination.totalCount).toBe(2);
    });

    test('should filter by status', async () => {
      const response = await request(app)
        .get('/api/withdrawals/history?status=approved')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.withdrawals).toHaveLength(1);
      expect(response.body.data.withdrawals[0].status).toBe('approved');
    });

    test('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/withdrawals/history?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.withdrawals).toHaveLength(1);
      expect(response.body.data.pagination.totalPages).toBe(2);
      expect(response.body.data.pagination.hasNextPage).toBe(true);
    });

    test('should reject unauthorized request', async () => {
      await request(app)
        .get('/api/withdrawals/history')
        .expect(401);
    });
  });

  describe('GET /api/withdrawals/available-balance', () => {
    test('should return available balance information', async () => {
      const response = await request(app)
        .get('/api/withdrawals/available-balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.withdrawableBalance).toBe(1000);
      expect(response.body.data.pendingWithdrawals).toBe(0);
      expect(response.body.data.availableBalance).toBe(1000);
      expect(response.body.data.totalWithdrawn).toBe(0);
      expect(response.body.data.affiliateEarnings).toBe(2000);
    });

    test('should sync pending withdrawals from database', async () => {
      // Create a pending withdrawal
      await Withdrawal.create({
        userId: testUser._id,
        method: 'mobile_banking',
        amount: 300,
        status: 'pending',
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      });

      const response = await request(app)
        .get('/api/withdrawals/available-balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pendingWithdrawals).toBe(300);
      expect(response.body.data.availableBalance).toBe(700); // 1000 - 300
    });

    test('should reject unauthorized request', async () => {
      await request(app)
        .get('/api/withdrawals/available-balance')
        .expect(401);
    });
  });

  describe('Complete Withdrawal Flow', () => {
    test('should handle complete withdrawal request flow', async () => {
      // Step 1: Check initial balance
      let response = await request(app)
        .get('/api/withdrawals/available-balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.availableBalance).toBe(1000);

      // Step 2: Create withdrawal request
      const withdrawalData = {
        method: 'mobile_banking',
        amount: 400,
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      };

      response = await request(app)
        .post('/api/withdrawals/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send(withdrawalData)
        .expect(201);

      const withdrawalId = response.body.data.withdrawal._id;

      // Step 3: Check updated balance
      response = await request(app)
        .get('/api/withdrawals/available-balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.pendingWithdrawals).toBe(400);
      expect(response.body.data.availableBalance).toBe(600); // 1000 - 400

      // Step 4: Check withdrawal history
      response = await request(app)
        .get('/api/withdrawals/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.withdrawals).toHaveLength(1);
      expect(response.body.data.withdrawals[0].status).toBe('pending');
      expect(response.body.data.withdrawals[0].amount).toBe(400);
    });

    test('should prevent multiple withdrawals exceeding balance', async () => {
      // Create first withdrawal
      const firstWithdrawal = {
        method: 'mobile_banking',
        amount: 600,
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      };

      await request(app)
        .post('/api/withdrawals/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send(firstWithdrawal)
        .expect(201);

      // Try to create second withdrawal that would exceed available balance
      const secondWithdrawal = {
        method: 'bank_transfer',
        amount: 500, // This would exceed remaining balance of 400
        bankTransferDetails: {
          accountName: 'Test User',
          accountNumber: 'ACC123456789',
          bankName: 'Test Bank'
        }
      };

      const response = await request(app)
        .post('/api/withdrawals/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send(secondWithdrawal)
        .expect(400);

      expect(response.body.error.code).toBe('INSUFFICIENT_BALANCE');
      expect(response.body.error.details.availableBalance).toBe(400);
    });
  });
});