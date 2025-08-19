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
 * Format price for display
 * @param {number} price - Price to format
 * @param {string} currency - Currency symbol (default: 'Rs.')
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price, currency = 'Rs.') => {
  if (typeof price !== 'number') return `${currency} 0`;
  return `${currency} ${price.toLocaleString()}`;
};
