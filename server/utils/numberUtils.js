/**
 * Utility functions for handling numbers and currency calculations
 */

/**
 * Safely convert a value to a number, ensuring it's not NaN
 * @param {any} value - Value to convert to number
 * @param {number} defaultValue - Default value if conversion fails
 * @returns {number} - Safe number value
 */
export const safeNumber = (value, defaultValue = 0) => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Round a number to avoid floating point precision issues
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {number} - Rounded number
 */
export const safeRound = (value, decimals = 0) => {
  const num = safeNumber(value);
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Ensure a number is not negative
 * @param {number} value - Value to check
 * @param {number} defaultValue - Default value if negative
 * @returns {number} - Non-negative number
 */
export const ensurePositive = (value, defaultValue = 0) => {
  const num = safeNumber(value);
  return Math.max(num, defaultValue);
};

/**
 * Format balance fields for database storage
 * @param {Object} balanceData - Object containing balance fields
 * @returns {Object} - Formatted balance data
 */
export const formatBalanceFields = (balanceData) => {
  return {
    withdrawableBalance: safeRound(balanceData.withdrawableBalance),
    totalWithdrawn: safeRound(balanceData.totalWithdrawn),
    pendingWithdrawals: safeRound(balanceData.pendingWithdrawals),
    affiliateEarnings: safeRound(balanceData.affiliateEarnings),
    lifetimeEarnings: safeRound(balanceData.lifetimeEarnings),
    dailyEarnings: safeRound(balanceData.dailyEarnings),
    weeklyEarnings: safeRound(balanceData.weeklyEarnings),
    monthlyEarnings: safeRound(balanceData.monthlyEarnings),
    currentBalance: safeRound(balanceData.currentBalance)
  };
};

/**
 * Validate balance update data
 * @param {Object} updateData - Balance update data
 * @returns {Object} - Validation result
 */
export const validateBalanceUpdate = (updateData) => {
  const errors = [];
  
  // Check for negative values
  const balanceFields = [
    'withdrawableBalance', 'totalWithdrawn', 'pendingWithdrawals',
    'affiliateEarnings', 'lifetimeEarnings', 'dailyEarnings',
    'weeklyEarnings', 'monthlyEarnings', 'currentBalance'
  ];
  
  balanceFields.forEach(field => {
    if (updateData[field] !== undefined) {
      const value = safeNumber(updateData[field]);
      if (value < 0) {
        errors.push(`${field} cannot be negative`);
      }
    }
  });
  
  // Check logical constraints
  if (updateData.totalWithdrawn !== undefined && updateData.withdrawableBalance !== undefined) {
    const totalWithdrawn = safeNumber(updateData.totalWithdrawn);
    const withdrawableBalance = safeNumber(updateData.withdrawableBalance);
    
    // Total withdrawn should not exceed lifetime earnings
    if (updateData.lifetimeEarnings !== undefined) {
      const lifetimeEarnings = safeNumber(updateData.lifetimeEarnings);
      if (totalWithdrawn > lifetimeEarnings) {
        errors.push('Total withdrawn cannot exceed lifetime earnings');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};