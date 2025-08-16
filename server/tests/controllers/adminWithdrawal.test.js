import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import {
  getPendingWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  editWithdrawal
} from '../../controllers/adminController.js';
import Withdrawal from '../../models/Withdrawal.js';
import User from '../../models/User.js';

// Mock request and response objects
const mockRequest = (params = {}, body = {}, user = {}, query = {}) => ({
  params,
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

describe('Admin Withdrawal Controller', () => {
  let testUser;
  let adminUser;
  let testWithdrawal;

  beforeEach(async () => {
    // Create test user
    testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'hashedpassword',
      withdrawableBalance: 1000,
      pendingWithdrawals: 500,
      totalWithdrawn: 0,
      affiliateEarnings: 2000
    });
    await testUser.save();

    // Create admin user
    adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'hashedpassword',
      isAdmin: true,
      role: 'admin'
    });
    await adminUser.save();

    // Create test withdrawal
    testWithdrawal = new Withdrawal({
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
    await testWithdrawal.save();
  });

  describe('getPendingWithdrawals', () => {
    test('should return pending withdrawals with user details', async () => {
      const req = mockRequest({}, {}, { id: adminUser._id }, { page: 1, limit: 10 });
      const res = mockResponse();

      await getPendingWithdrawals(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            withdrawals: expect.arrayContaining([
              expect.objectContaining({
                _id: testWithdrawal._id,
                user: expect.objectContaining({
                  name: 'Test User',
                  email: 'test@example.com'
                }),
                method: 'mobile_banking',
                amount: 500,
                status: 'pending'
              })
            ]),
            pagination: expect.objectContaining({
              currentPage: 1,
              totalCount: 1
            })
          })
        })
      );
    });

    test('should handle pagination correctly', async () => {
      // Create additional pending withdrawals
      await Withdrawal.create([
        {
          userId: testUser._id,
          method: 'bank_transfer',
          amount: 300,
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
          amount: 200,
          status: 'pending',
          mobileBankingDetails: {
            accountHolderName: 'Test User',
            mobileNumber: '9812345678',
            provider: 'Khalti'
          }
        }
      ]);

      const req = mockRequest({}, {}, { id: adminUser._id }, { page: 1, limit: 2 });
      const res = mockResponse();

      await getPendingWithdrawals(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.withdrawals).toHaveLength(2);
      expect(responseData.data.pagination.totalCount).toBe(3);
      expect(responseData.data.pagination.totalPages).toBe(2);
    });

    test('should only return pending withdrawals', async () => {
      // Create approved withdrawal
      await Withdrawal.create({
        userId: testUser._id,
        method: 'mobile_banking',
        amount: 300,
        status: 'approved',
        mobileBankingDetails: {
          accountHolderName: 'Test User',
          mobileNumber: '9812345678',
          provider: 'eSewa'
        }
      });

      const req = mockRequest({}, {}, { id: adminUser._id });
      const res = mockResponse();

      await getPendingWithdrawals(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.withdrawals).toHaveLength(1);
      expect(responseData.data.withdrawals[0].status).toBe('pending');
    });
  });

  describe('getAllWithdrawals', () => {
    beforeEach(async () => {
      // Create withdrawals with different statuses
      await Withdrawal.create([
        {
          userId: testUser._id,
          method: 'bank_transfer',
          amount: 300,
          status: 'approved',
          processedBy: adminUser._id,
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
          processedBy: adminUser._id,
          rejectionReason: 'Invalid details',
          mobileBankingDetails: {
            accountHolderName: 'Test User',
            mobileNumber: '9812345678',
            provider: 'Khalti'
          }
        }
      ]);
    });

    test('should return all withdrawals with details', async () => {
      const req = mockRequest({}, {}, { id: adminUser._id });
      const res = mockResponse();

      await getAllWithdrawals(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.withdrawals).toHaveLength(3); // Including the one from beforeEach
      expect(responseData.data.withdrawals).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ status: 'pending' }),
          expect.objectContaining({ status: 'approved' }),
          expect.objectContaining({ status: 'rejected' })
        ])
      );
    });

    test('should filter by status', async () => {
      const req = mockRequest({}, {}, { id: adminUser._id }, { status: 'approved' });
      const res = mockResponse();

      await getAllWithdrawals(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.withdrawals).toHaveLength(1);
      expect(responseData.data.withdrawals[0].status).toBe('approved');
    });

    test('should filter by method', async () => {
      const req = mockRequest({}, {}, { id: adminUser._id }, { method: 'mobile_banking' });
      const res = mockResponse();

      await getAllWithdrawals(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.withdrawals).toHaveLength(2);
      responseData.data.withdrawals.forEach(withdrawal => {
        expect(withdrawal.method).toBe('mobile_banking');
      });
    });

    test('should filter by user ID', async () => {
      const req = mockRequest({}, {}, { id: adminUser._id }, { userId: testUser._id.toString() });
      const res = mockResponse();

      await getAllWithdrawals(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.withdrawals).toHaveLength(3);
      responseData.data.withdrawals.forEach(withdrawal => {
        expect(withdrawal.user._id.toString()).toBe(testUser._id.toString());
      });
    });
  });

  describe('approveWithdrawal', () => {
    test('should approve withdrawal successfully', async () => {
      const req = mockRequest(
        { id: testWithdrawal._id },
        { transactionReference: 'TXN123456' },
        { id: adminUser._id }
      );
      const res = mockResponse();

      await approveWithdrawal(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Withdrawal approved successfully",
          data: expect.objectContaining({
            withdrawal: expect.objectContaining({
              status: 'approved',
              transactionReference: 'TXN123456'
            }),
            userBalance: expect.objectContaining({
              withdrawableBalance: 500, // 1000 - 500
              totalWithdrawn: 500,
              pendingWithdrawals: 0 // 500 - 500
            })
          })
        })
      );

      // Verify database updates
      const updatedWithdrawal = await Withdrawal.findById(testWithdrawal._id);
      expect(updatedWithdrawal.status).toBe('approved');
      expect(updatedWithdrawal.processedBy.toString()).toBe(adminUser._id.toString());

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.withdrawableBalance).toBe(500);
      expect(updatedUser.totalWithdrawn).toBe(500);
      expect(updatedUser.pendingWithdrawals).toBe(0);
    });

    test('should reject approval of non-pending withdrawal', async () => {
      testWithdrawal.status = 'approved';
      await testWithdrawal.save();

      const req = mockRequest(
        { id: testWithdrawal._id },
        {},
        { id: adminUser._id }
      );
      const res = mockResponse();

      await approveWithdrawal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "WITHDRAWAL_ALREADY_PROCESSED"
          })
        })
      );
    });

    test('should reject approval when user has insufficient balance', async () => {
      // Reduce user's withdrawable balance
      testUser.withdrawableBalance = 300; // Less than withdrawal amount of 500
      await testUser.save();

      const req = mockRequest(
        { id: testWithdrawal._id },
        {},
        { id: adminUser._id }
      );
      const res = mockResponse();

      await approveWithdrawal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "INSUFFICIENT_USER_BALANCE"
          })
        })
      );
    });

    test('should reject approval for non-existent withdrawal', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest(
        { id: nonExistentId },
        {},
        { id: adminUser._id }
      );
      const res = mockResponse();

      await approveWithdrawal(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "WITHDRAWAL_NOT_FOUND"
          })
        })
      );
    });
  });

  describe('rejectWithdrawal', () => {
    test('should reject withdrawal successfully', async () => {
      const req = mockRequest(
        { id: testWithdrawal._id },
        { rejectionReason: 'Invalid payment details' },
        { id: adminUser._id }
      );
      const res = mockResponse();

      await rejectWithdrawal(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Withdrawal rejected successfully",
          data: expect.objectContaining({
            withdrawal: expect.objectContaining({
              status: 'rejected',
              rejectionReason: 'Invalid payment details'
            }),
            userBalance: expect.objectContaining({
              withdrawableBalance: 1000, // Unchanged
              totalWithdrawn: 0, // Unchanged
              pendingWithdrawals: 0 // 500 - 500
            })
          })
        })
      );

      // Verify database updates
      const updatedWithdrawal = await Withdrawal.findById(testWithdrawal._id);
      expect(updatedWithdrawal.status).toBe('rejected');
      expect(updatedWithdrawal.rejectionReason).toBe('Invalid payment details');

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.pendingWithdrawals).toBe(0);
    });

    test('should reject rejection of non-pending withdrawal', async () => {
      testWithdrawal.status = 'rejected';
      await testWithdrawal.save();

      const req = mockRequest(
        { id: testWithdrawal._id },
        { rejectionReason: 'Test reason' },
        { id: adminUser._id }
      );
      const res = mockResponse();

      await rejectWithdrawal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "WITHDRAWAL_ALREADY_PROCESSED"
          })
        })
      );
    });
  });

  describe('editWithdrawal', () => {
    test('should edit withdrawal amount successfully', async () => {
      const req = mockRequest(
        { id: testWithdrawal._id },
        { amount: 400 }, // Reduce from 500 to 400
        { id: adminUser._id }
      );
      const res = mockResponse();

      await editWithdrawal(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Withdrawal edited successfully",
          data: expect.objectContaining({
            withdrawal: expect.objectContaining({
              amount: 400
            }),
            changes: expect.objectContaining({
              amount: 400
            })
          })
        })
      );

      // Verify database updates
      const updatedWithdrawal = await Withdrawal.findById(testWithdrawal._id);
      expect(updatedWithdrawal.amount).toBe(400);
      expect(updatedWithdrawal.editHistory).toHaveLength(1);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.pendingWithdrawals).toBe(400); // 500 - 100 (difference)
    });

    test('should edit mobile banking details successfully', async () => {
      const req = mockRequest(
        { id: testWithdrawal._id },
        {
          mobileBankingDetails: {
            accountHolderName: 'Updated Name',
            provider: 'Khalti'
          }
        },
        { id: adminUser._id }
      );
      const res = mockResponse();

      await editWithdrawal(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.withdrawal.paymentDetails.accountHolderName).toBe('Updated Name');
      expect(responseData.data.withdrawal.paymentDetails.provider).toBe('Khalti');
    });

    test('should reject edit when amount exceeds available balance', async () => {
      const req = mockRequest(
        { id: testWithdrawal._id },
        { amount: 1200 }, // Exceeds available balance
        { id: adminUser._id }
      );
      const res = mockResponse();

      await editWithdrawal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "INSUFFICIENT_BALANCE"
          })
        })
      );
    });

    test('should reject edit of non-pending withdrawal', async () => {
      testWithdrawal.status = 'approved';
      await testWithdrawal.save();

      const req = mockRequest(
        { id: testWithdrawal._id },
        { amount: 400 },
        { id: adminUser._id }
      );
      const res = mockResponse();

      await editWithdrawal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "WITHDRAWAL_CANNOT_BE_EDITED"
          })
        })
      );
    });

    test('should maintain edit history', async () => {
      // First edit
      const req1 = mockRequest(
        { id: testWithdrawal._id },
        { amount: 400 },
        { id: adminUser._id }
      );
      const res1 = mockResponse();
      await editWithdrawal(req1, res1);

      // Second edit
      const req2 = mockRequest(
        { id: testWithdrawal._id },
        { amount: 350 },
        { id: adminUser._id }
      );
      const res2 = mockResponse();
      await editWithdrawal(req2, res2);

      const updatedWithdrawal = await Withdrawal.findById(testWithdrawal._id);
      expect(updatedWithdrawal.editHistory).toHaveLength(2);
      expect(updatedWithdrawal.editHistory[0].changes.amount).toBe(400);
      expect(updatedWithdrawal.editHistory[1].changes.amount).toBe(350);
    });
  });
});