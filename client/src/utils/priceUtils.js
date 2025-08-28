/**
 * Utility functions for price calculations
 * Consolidates duplicate calculateDiscountedPrice functions across the app
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
 * Calculate course duration from course content
 * @param {Object} course - Course object with courseContent
 * @returns {string} - Formatted duration string
 */
export const calculateCourseDuration = (course) => {
  if (!course?.courseContent) return '0 min';

  const totalMinutes = course.courseContent.reduce((total, chapter) => {
    if (!chapter.chapterContent) return total;
    
    return total + chapter.chapterContent.reduce((chapterTotal, lecture) => {
      return chapterTotal + (lecture.lectureDuration || 0);
    }, 0);
  }, 0);

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

/**
 * Calculate total number of lectures in a course
 * @param {Object} course - Course object with courseContent
 * @returns {number} - Total number of lectures
 */
export const calculateNoOfLectures = (course) => {
  if (!course?.courseContent) return 0;

  return course.courseContent.reduce((total, chapter) => {
    return total + (chapter.chapterContent?.length || 0);
  }, 0);
};

/**
 * Format currency with symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: 'Rs')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'Rs') => {
  if (typeof amount !== 'number') return `${currency}0`;
  return `${currency}${amount.toLocaleString()}`;
};
