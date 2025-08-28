import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { safeNumber, safeRound, ensurePositive } from './numberUtils.js';
import { calculatePackageBasedCommission } from './priceHelpers.js';

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

        // Update user's balance if it's out of sync (with proper number handling)
        const currentWithdrawable = safeNumber(user.withdrawableBalance);
        const currentAffiliate = safeNumber(user.affiliateEarnings);
        const calculatedWithdrawable = safeNumber(calculatedBalance.totalWithdrawable);
        const calculatedAffiliate = safeNumber(calculatedBalance.totalAffiliate);

        if (Math.abs(currentWithdrawable - calculatedWithdrawable) > 0.01 ||
            Math.abs(currentAffiliate - calculatedAffiliate) > 0.01) {

            user.withdrawableBalance = safeRound(calculatedWithdrawable);
            user.affiliateEarnings = safeRound(calculatedAffiliate);
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
 * Update user's earnings fields with time-based calculations
 * @param {string} userId - User ID
 * @param {number} affiliateAmount - New affiliate amount earned
 * @returns {Promise<void>}
 */
export const updateUserEarningsFields = async (userId, affiliateAmount) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Get current date info
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Calculate time-based earnings from Purchase collection
        const sumAffiliate = async (fromDate, toDate = null) => {
            const query = {
                referrerId: new mongoose.Types.ObjectId(userId),
                status: 'completed',
                createdAt: { $gte: fromDate }
            };
            if (toDate) query.createdAt.$lt = toDate;

            const docs = await Purchase.find(query).select('affiliateAmount createdAt');
            return docs.reduce((acc, p) => acc + (Number(p.affiliateAmount) || 0), 0);
        };

        // Calculate and update earnings fields
        const [todayEarnings, weeklyEarnings, monthlyEarnings] = await Promise.all([
            sumAffiliate(startOfToday),
            sumAffiliate(last7Days),
            sumAffiliate(startOfMonth)
        ]);

        // Check if admin has recently updated earnings (within last 10 minutes)
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
        const adminRecentlyUpdated = user.lastAdminUpdate && user.lastAdminUpdate > tenMinutesAgo;
        
        // Only update earnings fields if admin hasn't recently updated them
        if (!adminRecentlyUpdated) {
            user.dailyEarnings = todayEarnings;
            user.weeklyEarnings = weeklyEarnings;
            user.monthlyEarnings = monthlyEarnings;
            user.lifetimeEarnings = user.affiliateEarnings || 0;
        }
        
        // Only update currentBalance if it wasn't recently set by an admin
        if (!adminRecentlyUpdated) {
            user.currentBalance = user.withdrawableBalance || 0;
        }

        await user.save();
    } catch (error) {
        console.error('Error updating user earnings fields:', error);
    }
};

/**
 * Process affiliate earnings for a referrer
 * @param {string} referrerId - Referrer's user ID
 * @param {number} coursePrice - Course price
 * @param {number} commissionRate - Commission rate (default 0.6 for 60%)
 * @param {string} referrerPackage - Referrer's highest package
 * @param {string} purchasedPackage - Package being purchased
 * @returns {Promise<Object>} Processing result
 */
export const processAffiliateEarnings = async (referrerId, coursePrice, commissionRate = 0.6, referrerPackage = null, purchasedPackage = null) => {
    try {
        const referrer = await User.findById(referrerId);
        if (!referrer) {
            throw new Error('Referrer not found');
        }

        // Use package-based commission calculation if package information is available
        let affiliateAmount;
        if (referrerPackage && purchasedPackage) {
            affiliateAmount = calculatePackageBasedCommission(
                coursePrice,
                referrerPackage,
                purchasedPackage,
                commissionRate
            );
        } else {
            // Fallback to simple commission calculation
            affiliateAmount = coursePrice * commissionRate;
        }

        const withdrawableAmount = affiliateAmount; // Full affiliate amount is withdrawable (already the commission)

        // Update referrer's balance
        referrer.updateWithdrawableBalance(affiliateAmount);
        await referrer.save();

        // Update earnings fields
        await updateUserEarningsFields(referrerId, affiliateAmount);

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

            const docs = await Purchase.find(query).select('affiliateAmount');
            return docs.reduce((acc, p) => acc + (Number(p.affiliateAmount) || 0), 0);
        };

        const [today, lastSevenDays, thisMonth] = await Promise.all([
            sumAffiliate(startOfToday),
            sumAffiliate(last7Days),
            sumAffiliate(startOfMonth)
        ]);

        // Check if admin has recently updated earnings (within last 10 minutes)
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
        const adminRecentlyUpdated = user.lastAdminUpdate && user.lastAdminUpdate > tenMinutesAgo;
        
        // If admin recently updated, prioritize admin-set values
        // Otherwise, use calculated values from Purchase collection
        const getEarningsValue = (adminValue, calculatedValue) => {
            if (adminRecentlyUpdated && adminValue !== undefined && adminValue !== null) {
                return adminValue;
            }
            return calculatedValue;
        };
        
        return {
            lifetime: {
                affiliate: getEarningsValue(user.lifetimeEarnings, user.affiliateEarnings || 0),
                withdrawable: user.withdrawableBalance || 0
            },
            today: {
                affiliate: getEarningsValue(user.dailyEarnings, today),
                withdrawable: user.withdrawableBalance || 0
            },
            lastSevenDays: {
                affiliate: getEarningsValue(user.weeklyEarnings, lastSevenDays),
                withdrawable: user.withdrawableBalance || 0
            },
            thisMonth: {
                affiliate: getEarningsValue(user.monthlyEarnings, thisMonth),
                withdrawable: user.withdrawableBalance || 0
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

/**
 * Sync all users' earnings fields with current purchase data
 * This function should be called periodically or when needed
 * @returns {Promise<Object>} Sync results
 */
export const syncAllUsersEarningsFields = async () => {
    try {
        const users = await User.find({ affiliateEarnings: { $gt: 0 } });
        const results = {
            totalUsers: users.length,
            updatedUsers: 0,
            errors: 0
        };

        for (const user of users) {
            try {
                // Check if admin has recently updated this user (within last 10 minutes)
                const now = new Date();
                const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
                const adminRecentlyUpdated = user.lastAdminUpdate && user.lastAdminUpdate > tenMinutesAgo;
                
                if (!adminRecentlyUpdated) {
                    await updateUserEarningsFields(user._id, 0); // 0 means just recalculate existing data
                    results.updatedUsers++;
                } else {
                    results.updatedUsers++; // Count as updated since we're preserving admin values
                }
            } catch (error) {
                console.error(`Error updating earnings for user ${user._id}:`, error);
                results.errors++;
            }
        }

        return results;
    } catch (error) {
        throw new Error(`Error syncing all users earnings: ${error.message}`);
    }
};