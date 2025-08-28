/**
 * Server-side utility functions for price calculations
 * Consolidates duplicate calculateDiscountedPrice functions across controllers
 */

/**
 * Calculate discounted price for a course
 * @param {Object} course - Course object with coursePrice, discount, and discountType
 * @returns {number} - Calculated discounted price
 */
export const calculateDiscountedPrice = (course) => {
  if (!course || typeof course.coursePrice !== 'number') {
    return 0;
  }

  if (course.discountType === 'amount') {
    return Math.max(0, course.coursePrice - (course.discount || 0));
  } else {
    // percentage discount
    const discountAmount = (course.discount || 0) * course.coursePrice / 100;
    return Math.max(0, course.coursePrice - discountAmount);
  }
};

/**
 * Calculate commission for a referral
 * @param {number} coursePrice - Original course price
 * @param {number} commissionRate - Commission rate as percentage (default: 10)
 * @returns {number} - Commission amount
 */
export const calculateCommission = (coursePrice, commissionRate = 10) => {
  if (typeof coursePrice !== 'number' || coursePrice <= 0) {
    return 0;
  }
  
  return (coursePrice * commissionRate) / 100;
};

/**
 * Calculate commission based on package hierarchy system
 * @param {number} coursePrice - Course price
 * @param {string} referrerPackage - Referrer's highest package
 * @param {string} purchasedPackage - Package being purchased
 * @param {number} baseCommissionRate - Base commission rate (default: 0.6 for 60%)
 * @returns {number} - Commission amount
 */
export const calculatePackageBasedCommission = (coursePrice, referrerPackage, purchasedPackage, baseCommissionRate = 0.6) => {
  if (typeof coursePrice !== 'number' || coursePrice <= 0) {
    return 0;
  }

  if (!referrerPackage || !purchasedPackage) {
    return coursePrice * baseCommissionRate;
  }

  const packageHierarchy = {
    'elite': 1,
    'creator': 2,
    'prime': 3,
    'master': 4
  };

  const referrerValue = packageHierarchy[referrerPackage] || 0;
  const purchasedValue = packageHierarchy[purchasedPackage] || 0;

  // If referrer has a higher or equal package, they get 60% of the purchased package
  if (referrerValue >= purchasedValue) {
    return coursePrice * baseCommissionRate;
  }
  
  // If referrer has a lower package, they get 60% of their own package's earning potential
  // This is a simplified approach - you might want to adjust this logic
  const referrerEarningPotential = {
    'elite': 1000,    // Rs 500 - Rs 1,000
    'creator': 3000,  // Rs 1,500 - Rs 3,000
    'prime': 4000,    // Rs 2,000 - Rs 4,000
    'master': 6000    // Rs 3,000 - Rs 6,000
  };

  const referrerMaxEarning = referrerEarningPotential[referrerPackage] || 1000;
  const commissionAmount = Math.min(coursePrice * baseCommissionRate, referrerMaxEarning * baseCommissionRate);
  
  return commissionAmount;
};

/**
 * Format price for display
 * @param {number} price - Price to format
 * @param {string} currency - Currency symbol (default: 'Rs')
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price, currency = 'Rs') => {
  if (typeof price !== 'number') return `${currency} 0`;
  return `${currency} ${price.toLocaleString()}`;
};
