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
 * Calculate commission based on price comparison system
 * @param {number} purchasedCoursePrice - Price of the course being purchased
 * @param {string} referrerPackage - Referrer's highest package
 * @param {string} purchasedPackage - Package being purchased
 * @param {number} baseCommissionRate - Base commission rate (default: 0.6 for 60%)
 * @returns {number} - Commission amount
 */
export const calculatePackageBasedCommission = (purchasedCoursePrice, referrerPackage, purchasedPackage, baseCommissionRate = 0.6) => {
  if (typeof purchasedCoursePrice !== 'number' || purchasedCoursePrice <= 0) {
    return 0;
  }

  if (!referrerPackage || !purchasedPackage) {
    return purchasedCoursePrice * baseCommissionRate;
  }

  // Get default prices for packages
  const packagePrices = {
    'elite': 1000,
    'creator': 2000,
    'prime': 3000,
    'master': 5500
  };

  const referrerCoursePrice = packagePrices[referrerPackage] || 1000;
  const purchasedCoursePriceValue = packagePrices[purchasedPackage] || purchasedCoursePrice;

  // If purchased course price is higher than referrer's course price
  // Referrer gets commission of their own course price
  if (purchasedCoursePriceValue > referrerCoursePrice) {
    return referrerCoursePrice * baseCommissionRate;
  }
  
  // If purchased course price is lower than or equal to referrer's course price
  // Referrer gets 60% of the purchased course price
  return purchasedCoursePriceValue * baseCommissionRate;
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
