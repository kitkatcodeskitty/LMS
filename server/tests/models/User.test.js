import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import User from '../../models/User.js';

// Mock mongoose connection for testing
beforeAll(async () => {
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/lms_test';
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe('User Model - Withdrawal Features', () => {
    let testUser;

    beforeEach(async () => {
        testUser = new User({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'hashedpassword',
            affiliateEarnings: 2000,
            withdrawableBalance: 1000,
            totalWithdrawn: 500,
            pendingWithdrawals: 200
        });
        await testUser.save();
    });

    describe('Schema Validation', () => {
        test('should create user with withdrawal fields', async () => {
            expect(testUser.withdrawableBalance).toBe(1000);
            expect(testUser.totalWithdrawn).toBe(500);
            expect(testUser.pendingWithdrawals).toBe(200);
        });

        test('should set default values for withdrawal fields', async () => {
            const newUser = new User({
                firstName: 'New',
                lastName: 'User',
                email: 'new@example.com',
                password: 'hashedpassword'
            });
            await newUser.save();

            expect(newUser.withdrawableBalance).toBe(0);
            expect(newUser.totalWithdrawn).toBe(0);
            expect(newUser.pendingWithdrawals).toBe(0);
        });
    });

    describe('Instance Methods', () => {
        describe('getAvailableBalance', () => {
            test('should calculate available balance correctly', () => {
                const availableBalance = testUser.getAvailableBalance();
                expect(availableBalance).toBe(800); // 1000 - 200
            });

            test('should return 0 when pending withdrawals exceed withdrawable balance', () => {
                testUser.pendingWithdrawals = 1200;
                const availableBalance = testUser.getAvailableBalance();
                expect(availableBalance).toBe(0);
            });

            test('should return 0 when withdrawable balance is 0', () => {
                testUser.withdrawableBalance = 0;
                testUser.pendingWithdrawals = 0;
                const availableBalance = testUser.getAvailableBalance();
                expect(availableBalance).toBe(0);
            });
        });

        describe('updateWithdrawableBalance', () => {
            test('should add 50% of affiliate amount to withdrawable balance', () => {
                const initialWithdrawable = testUser.withdrawableBalance;
                const initialEarnings = testUser.affiliateEarnings;

                const withdrawableAmount = testUser.updateWithdrawableBalance(1000);

                expect(withdrawableAmount).toBe(500); // 50% of 1000
                expect(testUser.withdrawableBalance).toBe(initialWithdrawable + 500);
                expect(testUser.affiliateEarnings).toBe(initialEarnings + 1000);
            });

            test('should handle decimal amounts correctly', () => {
                const withdrawableAmount = testUser.updateWithdrawableBalance(333);

                expect(withdrawableAmount).toBe(166.5); // 50% of 333
                expect(testUser.withdrawableBalance).toBe(1166.5);
            });
        });

        describe('processWithdrawalApproval', () => {
            test('should update balances correctly on approval', () => {
                const withdrawalAmount = 300;
                const initialWithdrawable = testUser.withdrawableBalance;
                const initialWithdrawn = testUser.totalWithdrawn;
                const initialPending = testUser.pendingWithdrawals;

                testUser.processWithdrawalApproval(withdrawalAmount);

                expect(testUser.withdrawableBalance).toBe(initialWithdrawable - withdrawalAmount);
                expect(testUser.totalWithdrawn).toBe(initialWithdrawn + withdrawalAmount);
                expect(testUser.pendingWithdrawals).toBe(initialPending - withdrawalAmount);
            });
        });

        describe('processWithdrawalRejection', () => {
            test('should update pending withdrawals on rejection', () => {
                const withdrawalAmount = 150;
                const initialPending = testUser.pendingWithdrawals;
                const initialWithdrawable = testUser.withdrawableBalance;
                const initialWithdrawn = testUser.totalWithdrawn;

                testUser.processWithdrawalRejection(withdrawalAmount);

                expect(testUser.pendingWithdrawals).toBe(initialPending - withdrawalAmount);
                expect(testUser.withdrawableBalance).toBe(initialWithdrawable); // Should not change
                expect(testUser.totalWithdrawn).toBe(initialWithdrawn); // Should not change
            });
        });

        describe('addPendingWithdrawal', () => {
            test('should increase pending withdrawals', () => {
                const withdrawalAmount = 250;
                const initialPending = testUser.pendingWithdrawals;

                testUser.addPendingWithdrawal(withdrawalAmount);

                expect(testUser.pendingWithdrawals).toBe(initialPending + withdrawalAmount);
            });
        });
    });

    describe('Static Methods', () => {
        describe('updateBalanceAfterPurchase', () => {
            test('should update user balance after purchase', async () => {
                const affiliateAmount = 800;
                const initialWithdrawable = testUser.withdrawableBalance;
                const initialEarnings = testUser.affiliateEarnings;

                const withdrawableAmount = await User.updateBalanceAfterPurchase(testUser._id, affiliateAmount);

                // Refresh user from database
                await testUser.reload();

                expect(withdrawableAmount).toBe(400); // 50% of 800
                expect(testUser.withdrawableBalance).toBe(initialWithdrawable + 400);
                expect(testUser.affiliateEarnings).toBe(initialEarnings + 800);
            });

            test('should throw error for non-existent user', async () => {
                const nonExistentId = new mongoose.Types.ObjectId();

                await expect(User.updateBalanceAfterPurchase(nonExistentId, 500))
                    .rejects.toThrow('User not found');
            });
        });
    });

    describe('Integration Scenarios', () => {
        test('should handle complete withdrawal lifecycle', async () => {
            // Initial state
            expect(testUser.getAvailableBalance()).toBe(800); // 1000 - 200

            // Add new pending withdrawal
            testUser.addPendingWithdrawal(300);
            expect(testUser.getAvailableBalance()).toBe(500); // 1000 - 500

            // Process approval
            testUser.processWithdrawalApproval(300);
            expect(testUser.withdrawableBalance).toBe(700); // 1000 - 300
            expect(testUser.totalWithdrawn).toBe(800); // 500 + 300
            expect(testUser.pendingWithdrawals).toBe(200); // 500 - 300
            expect(testUser.getAvailableBalance()).toBe(500); // 700 - 200
        });

        test('should handle withdrawal rejection scenario', async () => {
            // Add pending withdrawal
            testUser.addPendingWithdrawal(400);
            expect(testUser.getAvailableBalance()).toBe(400); // 1000 - 600

            // Process rejection
            testUser.processWithdrawalRejection(400);
            expect(testUser.withdrawableBalance).toBe(1000); // Unchanged
            expect(testUser.totalWithdrawn).toBe(500); // Unchanged
            expect(testUser.pendingWithdrawals).toBe(200); // 600 - 400
            expect(testUser.getAvailableBalance()).toBe(800); // Back to original
        });

        test('should handle multiple affiliate earnings', async () => {
            const initialWithdrawable = testUser.withdrawableBalance;

            // Multiple purchases
            await User.updateBalanceAfterPurchase(testUser._id, 600);
            await User.updateBalanceAfterPurchase(testUser._id, 400);

            await testUser.reload();

            expect(testUser.withdrawableBalance).toBe(initialWithdrawable + 300 + 200); // +500 total
            expect(testUser.affiliateEarnings).toBe(2000 + 600 + 400); // +1000 total
        });
    });
});