import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Calculate total withdrawable balance for a user based on their purchases
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Object containing balance information
 */
export const calculateUserWithdrawableBalance = async (userId) => {
    try {
        const result = await Purchase.getUserWithdrawableEarnings(userId);
        return {
            totalWithdrawable: result.totalWithdrawable || 0,
            totalAffiliate: result.totalAffiliate || 0
        };
    } catch (error) {
        throw new Error(`Error calculating withdrawable balance: ${error.message}`);
    }
};

/**
 * Sync user's withdrawable balance with actual purchase data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated balance information
 */
export const syncUserWithdrawableBalance = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const calculatedBalance = await calculateUserWithdrawableBalance(userId);

        // Update user's balance if it's out of sync
        if (user.withdrawableBalance !== calculatedBalance.totalWithdrawable ||
            user.affiliateEarnings !== calculatedBalance.totalAffiliate) {

            user.withdrawableBalance = calculatedBalance.totalWithdrawable;
            user.affiliateEarnings = calculatedBalance.totalAffiliate;
            await user.save();
        }

        return {
            withdrawableBalance: user.withdrawableBalance,
            affiliateEarnings: user.affiliateEarnings,
            availableBalance: user.getAvailableBalance(),
            pendingWithdrawals: user.pendingWithdrawals,
            totalWithdrawn: user.totalWithdrawn
        };
    } catch (error) {
        throw new Error(`Error syncing withdrawable balance: ${error.message}`);
    }
};

/**
 * Validate withdrawal amount against user's available balance
 * @param {string} userId - User ID
 * @param {number} amount - Withdrawal amount
 * @returns {Promise<Object>} Validation result
 */
export const validateWithdrawalAmount = async (userId, amount) => {
    try {
        if (typeof amount !== 'number' || amount <= 0) {
            return {
                valid: false,
                error: {
                    code: 'INVALID_AMOUNT',
                    message: 'Amount must be a positive number'
                }
            };
        }

        const user = await User.findById(userId);
        if (!user) {
            return {
                valid: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            };
        }

        const availableBalance = user.getAvailableBalance();

        if (amount > availableBalance) {
            return {
                valid: false,
                error: {
                    code: 'INSUFFICIENT_BALANCE',
                    message: 'Withdrawal amount exceeds available balance',
                    details: {
                        requestedAmount: amount,
                        availableBalance: availableBalance
                    }
                }
            };
        }

        return {
            valid: true,
            availableBalance: availableBalance,
            user: {
                withdrawableBalance: user.withdrawableBalance,
                pendingWithdrawals: user.pendingWithdrawals
            }
        };

    } catch (error) {
        throw new Error(`Error validating withdrawal amount: ${error.message}`);
    }
};

/**
 * Process affiliate earnings for a new purchase
 * @param {string} referrerId - Referrer user ID
 * @param {number} coursePrice - Course price
 * @param {number} commissionRate - Commission rate (default 0.5)
 * @returns {Promise<Object>} Processing result
 */
export const processAffiliateEarnings = async (referrerId, coursePrice, commissionRate = 0.5) => {
    try {
        const referrer = await User.findById(referrerId);
        if (!referrer) {
            throw new Error('Referrer not found');
        }

        const affiliateAmount = coursePrice * commissionRate;
        const withdrawableAmount = affiliateAmount; // Full affiliate amount is withdrawable (already the commission)

        // Update referrer's balance
        referrer.updateWithdrawableBalance(affiliateAmount);
        await referrer.save();

        return {
            affiliateAmount,
            withdrawableAmount,
            referrer: {
                id: referrer._id,
                name: `${referrer.firstName} ${referrer.lastName}`,
                newWithdrawableBalance: referrer.withdrawableBalance,
                newAffiliateEarnings: referrer.affiliateEarnings
            }
        };

    } catch (error) {
        throw new Error(`Error processing affiliate earnings: ${error.message}`);
    }
};

/**
 * Get comprehensive earnings data for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Comprehensive earnings data
 */
export const getUserEarningsData = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Calculate time-based earnings using UTC to avoid timezone issues
        const now = new Date();
        const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

        const sumAffiliate = async (fromDate, toDate = null) => {
            const query = {
                referrerId: new mongoose.Types.ObjectId(userId),
                status: 'completed',
                createdAt: { $gte: fromDate }
            };
            if (toDate) query.createdAt.$lt = toDate;

            const docs = await Purchase.find(query).select('affiliateAmount withdrawableAmount createdAt');
            
            // Additional validation to ensure we only count valid amounts
            return docs.reduce((acc, p) => {
                const affiliateAmount = Number(p.affiliateAmount) || 0;
                const withdrawableAmount = Number(p.withdrawableAmount) || 0;
                
                // Only count positive amounts
                if (affiliateAmount > 0) {
                    acc.affiliate += affiliateAmount;
                }
                if (withdrawableAmount > 0) {
                    acc.withdrawable += withdrawableAmount;
                }
                
                return acc;
            }, { affiliate: 0, withdrawable: 0 });
        };

        const [today, lastSevenDays, thisMonth] = await Promise.all([
            sumAffiliate(startOfToday),
            sumAffiliate(last7Days),
            sumAffiliate(startOfMonth)
        ]);

        return {
            lifetime: {
                affiliate: user.affiliateEarnings || 0,
                withdrawable: user.withdrawableBalance || 0
            },
            today: {
                affiliate: today.affiliate,
                withdrawable: today.withdrawable
            },
            lastSevenDays: {
                affiliate: lastSevenDays.affiliate,
                withdrawable: lastSevenDays.withdrawable
            },
            thisMonth: {
                affiliate: thisMonth.affiliate,
                withdrawable: thisMonth.withdrawable
            },
            balance: {
                withdrawableBalance: user.withdrawableBalance || 0,
                totalWithdrawn: user.totalWithdrawn || 0,
                pendingWithdrawals: user.pendingWithdrawals || 0,
                availableBalance: user.getAvailableBalance()
            }
        };

    } catch (error) {
        throw new Error(`Error getting user earnings data: ${error.message}`);
    }
};