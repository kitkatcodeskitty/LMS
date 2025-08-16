import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import {
  createWithdrawalRequest,
  getUserWithdrawalHistory,
  getAvailableBalance,
  validateWithdrawalAmount
} from '../../controllers/withdrawalController.js';
import Withdrawal from '../../models/Withdrawal.js';
import User from '../../models/User.js';

// Mock request and response objects
const mockRequest = (body = {}, user = {}, query = {}) => ({
  body,
  user,
  query
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

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

describe('Withdrawal Controller', () => {
  let testUser;

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
  });

  describe('createWithdrawalRequest', () => {
    test('should create mobile banking withdrawal request successfully', async () => {
      const req = mockRequest({
        method: 'mobile_banking',
        amount: 500,
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      }, { id: testUser._id });
      const res = mockResponse();

      await createWithdrawalRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Withdrawal request created successfully",
          data: expect.objectContaining({
            withdrawal: expect.objectContaining({
              method: 'mobile_banking',
              amount: 500,
              status: 'pending'
            })
          })
        })
      );

      // Verify withdrawal was created in database
      const withdrawal = await Withdrawal.findOne({ userId: testUser._id });
      expect(withdrawal).toBeTruthy();
      expect(withdrawal.amount).toBe(500);

      // Verify user's pending withdrawals were updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.pendingWithdrawals).toBe(500);
    });

    test('should create bank transfer withdrawal request successfully', async () => {
      const req = mockRequest({
        method: 'bank_transfer',
        amount: 750,
        bankTransferDetails: {
          accountName: 'Test User Account',
          accountNumber: 'ACC123456789',
          bankName: 'Test Bank'
        }
      }, { id: testUser._id });
      const res = mockResponse();

      await createWithdrawalRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            withdrawal: expect.objectContaining({
              method: 'bank_transfer',
              amount: 750
            })
          })
        })
      );
    });

    test('should reject withdrawal when amount exceeds available balance', async () => {
      const req = mockRequest({
        method: 'mobile_banking',
        amount: 1500, // Exceeds available balance of 1000
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      }, { id: testUser._id });
      const res = mockResponse();

      await createWithdrawalRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "INSUFFICIENT_BALANCE",
            details: expect.objectContaining({
              requestedAmount: 1500,
              availableBalance: 1000
            })
          })
        })
      );
    });

    test('should reject withdrawal with missing required fields', async () => {
      const req = mockRequest({
        method: 'mobile_banking'
        // Missing amount
      }, { id: testUser._id });
      const res = mockResponse();

      await createWithdrawalRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "MISSING_REQUIRED_FIELDS"
          })
        })
      );
    });

    test('should reject withdrawal with invalid method', async () => {
      const req = mockRequest({
        method: 'invalid_method',
        amount: 500
      }, { id: testUser._id });
      const res = mockResponse();

      await createWithdrawalRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "INVALID_METHOD"
          })
        })
      );
    });

    test('should reject withdrawal with missing mobile banking details', async () => {
      const req = mockRequest({
        method: 'mobile_banking',
        amount: 500,
        mobileBankingDetails: {
          accountHolderName: 'Test User'
          // Missing mobileNumber and provider
        }
      }, { id: testUser._id });
      const res = mockResponse();

      await createWithdrawalRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "MISSING_MOBILE_BANKING_DETAILS"
          })
        })
      );
    });

    test('should reject withdrawal for non-existent user', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        method: 'mobile_banking',
        amount: 500,
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      }, { id: nonExistentUserId });
      const res = mockResponse();

      await createWithdrawalRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "USER_NOT_FOUND"
          })
        })
      );
    });
  });

  describe('getUserWithdrawalHistory', () => {
    beforeEach(async () => {
      // Create test withdrawals
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
        },
        {
          userId: testUser._id,
          method: 'mobile_banking',
          amount: 200,
          status: 'rejected',
          rejectionReason: 'Invalid details',
          mobileBankingDetails: {
            accountHolderName: 'Test User',
            mobileNumber: '9812345678',
            provider: 'Khalti'
          }
        }
      ]);
    });

    test('should return user withdrawal history with pagination', async () => {
      const req = mockRequest({}, { id: testUser._id }, { page: 1, limit: 10 });
      const res = mockResponse();

      await getUserWithdrawalHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            withdrawals: expect.arrayContaining([
              expect.objectContaining({
                method: 'mobile_banking',
                amount: 300,
                status: 'pending'
              }),
              expect.objectContaining({
                method: 'bank_transfer',
                amount: 500,
                status: 'approved',
                transactionReference: 'WD123456'
              }),
              expect.objectContaining({
                method: 'mobile_banking',
                amount: 200,
                status: 'rejected',
                rejectionReason: 'Invalid details'
              })
            ]),
            pagination: expect.objectContaining({
              currentPage: 1,
              totalCount: 3
            })
          })
        })
      );
    });

    test('should filter withdrawal history by status', async () => {
      const req = mockRequest({}, { id: testUser._id }, { status: 'approved' });
      const res = mockResponse();

      await getUserWithdrawalHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.withdrawals).toHaveLength(1);
      expect(responseData.data.withdrawals[0].status).toBe('approved');
    });

    test('should handle pagination correctly', async () => {
      const req = mockRequest({}, { id: testUser._id }, { page: 1, limit: 2 });
      const res = mockResponse();

      await getUserWithdrawalHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.withdrawals).toHaveLength(2);
      expect(responseData.data.pagination.totalPages).toBe(2);
      expect(responseData.data.pagination.hasNextPage).toBe(true);
    });
  });

  describe('getAvailableBalance', () => {
    test('should return user available balance information', async () => {
      const req = mockRequest({}, { id: testUser._id });
      const res = mockResponse();

      await getAvailableBalance(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            withdrawableBalance: 1000,
            pendingWithdrawals: 0,
            availableBalance: 1000,
            totalWithdrawn: 0,
            affiliateEarnings: 2000
          })
        })
      );
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

      const req = mockRequest({}, { id: testUser._id });
      const res = mockResponse();

      await getAvailableBalance(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.pendingWithdrawals).toBe(300);
      expect(responseData.data.availableBalance).toBe(700); // 1000 - 300
    });

    test('should return error for non-existent user', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const req = mockRequest({}, { id: nonExistentUserId });
      const res = mockResponse();

      await getAvailableBalance(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "USER_NOT_FOUND"
          })
        })
      );
    });
  });

  describe('validateWithdrawalAmount', () => {
    test('should validate sufficient balance', async () => {
      const result = await validateWithdrawalAmount(testUser._id, 500);

      expect(result.valid).toBe(true);
      expect(result.availableBalance).toBe(1000);
    });

    test('should reject insufficient balance', async () => {
      const result = await validateWithdrawalAmount(testUser._id, 1500);

      expect(result.valid).toBe(false);
      expect(result.error.code).toBe("INSUFFICIENT_BALANCE");
      expect(result.error.details.requestedAmount).toBe(1500);
      expect(result.error.details.availableBalance).toBe(1000);
    });

    test('should throw error for non-existent user', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();

      await expect(validateWithdrawalAmount(nonExistentUserId, 500))
        .rejects.toThrow('User not found');
    });
  });
});