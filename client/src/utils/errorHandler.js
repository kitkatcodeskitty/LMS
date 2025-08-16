/**
 * Comprehensive error handling utilities for withdrawal system
 */

// Error code mappings from server
export const SERVER_ERROR_CODES = {
  MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
  INVALID_METHOD: 'INVALID_METHOD',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  MISSING_MOBILE_BANKING_DETAILS: 'MISSING_MOBILE_BANKING_DETAILS',
  INVALID_MOBILE_NUMBER: 'INVALID_MOBILE_NUMBER',
  INVALID_PROVIDER: 'INVALID_PROVIDER',
  INVALID_ACCOUNT_HOLDER_NAME: 'INVALID_ACCOUNT_HOLDER_NAME',
  MISSING_BANK_TRANSFER_DETAILS: 'MISSING_BANK_TRANSFER_DETAILS',
  INVALID_ACCOUNT_NUMBER: 'INVALID_ACCOUNT_NUMBER',
  INVALID_BANK_NAME: 'INVALID_BANK_NAME',
  INVALID_ACCOUNT_NAME: 'INVALID_ACCOUNT_NAME',
  DUPLICATE_REQUEST: 'DUPLICATE_REQUEST',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  INVALID_USER_PERMISSIONS: 'INVALID_USER_PERMISSIONS',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};

// User-friendly error messages
export const ERROR_MESSAGES = {
  [SERVER_ERROR_CODES.MISSING_REQUIRED_FIELDS]: 'Please fill in all required fields.',
  [SERVER_ERROR_CODES.INVALID_METHOD]: 'Please select a valid withdrawal method.',
  [SERVER_ERROR_CODES.INVALID_AMOUNT]: 'Please enter a valid withdrawal amount.',
  [SERVER_ERROR_CODES.INSUFFICIENT_BALANCE]: 'Insufficient balance for this withdrawal.',
  [SERVER_ERROR_CODES.USER_NOT_FOUND]: 'User account not found. Please try logging in again.',
  [SERVER_ERROR_CODES.MISSING_MOBILE_BANKING_DETAILS]: 'Please provide all mobile banking details.',
  [SERVER_ERROR_CODES.INVALID_MOBILE_NUMBER]: 'Please enter a valid mobile number.',
  [SERVER_ERROR_CODES.INVALID_PROVIDER]: 'Please select a valid mobile banking provider.',
  [SERVER_ERROR_CODES.INVALID_ACCOUNT_HOLDER_NAME]: 'Please enter a valid account holder name.',
  [SERVER_ERROR_CODES.MISSING_BANK_TRANSFER_DETAILS]: 'Please provide all bank transfer details.',
  [SERVER_ERROR_CODES.INVALID_ACCOUNT_NUMBER]: 'Please enter a valid account number.',
  [SERVER_ERROR_CODES.INVALID_BANK_NAME]: 'Please enter a valid bank name.',
  [SERVER_ERROR_CODES.INVALID_ACCOUNT_NAME]: 'Please enter a valid account name.',
  [SERVER_ERROR_CODES.DUPLICATE_REQUEST]: 'A similar withdrawal request was submitted recently. Please wait before submitting another.',
  [SERVER_ERROR_CODES.UNAUTHORIZED_ACCESS]: 'You are not authorized to perform this action.',
  [SERVER_ERROR_CODES.INVALID_USER_PERMISSIONS]: 'Your account does not have permission to make withdrawals.',
  [SERVER_ERROR_CODES.ACCOUNT_SUSPENDED]: 'Your account is suspended. Please contact support.',
  [SERVER_ERROR_CODES.TOO_MANY_REQUESTS]: 'You have too many pending withdrawal requests. Please wait for them to be processed.',
  [SERVER_ERROR_CODES.SUSPICIOUS_ACTIVITY]: 'Suspicious activity detected. Please contact support.',
  [SERVER_ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred. Please try again later.'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Map error codes to severity levels
export const ERROR_SEVERITY_MAP = {
  [SERVER_ERROR_CODES.MISSING_REQUIRED_FIELDS]: ERROR_SEVERITY.LOW,
  [SERVER_ERROR_CODES.INVALID_METHOD]: ERROR_SEVERITY.LOW,
  [SERVER_ERROR_CODES.INVALID_AMOUNT]: ERROR_SEVERITY.LOW,
  [SERVER_ERROR_CODES.INSUFFICIENT_BALANCE]: ERROR_SEVERITY.MEDIUM,
  [SERVER_ERROR_CODES.USER_NOT_FOUND]: ERROR_SEVERITY.HIGH,
  [SERVER_ERROR_CODES.MISSING_MOBILE_BANKING_DETAILS]: ERROR_SEVERITY.LOW,
  [SERVER_ERROR_CODES.INVALID_MOBILE_NUMBER]: ERROR_SEVERITY.LOW,
  [SERVER_ERROR_CODES.INVALID_PROVIDER]: ERROR_SEVERITY.LOW,
  [SERVER_ERROR_CODES.INVALID_ACCOUNT_HOLDER_NAME]: ERROR_SEVERITY.LOW,
  [SERVER_ERROR_CODES.MISSING_BANK_TRANSFER_DETAILS]: ERROR_SEVERITY.LOW,
  [SERVER_ERROR_CODES.INVALID_ACCOUNT_NUMBER]: ERROR_SEVERITY.LOW,
  [SERVER_ERROR_CODES.INVALID_BANK_NAME]: ERROR_SEVERITY.LOW,
  [SERVER_ERROR_CODES.INVALID_ACCOUNT_NAME]: ERROR_SEVERITY.LOW,
  [SERVER_ERROR_CODES.DUPLICATE_REQUEST]: ERROR_SEVERITY.MEDIUM,
  [SERVER_ERROR_CODES.UNAUTHORIZED_ACCESS]: ERROR_SEVERITY.HIGH,
  [SERVER_ERROR_CODES.INVALID_USER_PERMISSIONS]: ERROR_SEVERITY.HIGH,
  [SERVER_ERROR_CODES.ACCOUNT_SUSPENDED]: ERROR_SEVERITY.CRITICAL,
  [SERVER_ERROR_CODES.TOO_MANY_REQUESTS]: ERROR_SEVERITY.MEDIUM,
  [SERVER_ERROR_CODES.SUSPICIOUS_ACTIVITY]: ERROR_SEVERITY.CRITICAL,
  [SERVER_ERROR_CODES.VALIDATION_ERROR]: ERROR_SEVERITY.LOW,
  [SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR]: ERROR_SEVERITY.CRITICAL
};

/**
 * Parse error response from server
 * @param {Object} error - Axios error object
 * @returns {Object} Parsed error information
 */
export const parseServerError = (error) => {
  // Default error structure
  const defaultError = {
    code: SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: ERROR_MESSAGES[SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR],
    details: null,
    severity: ERROR_SEVERITY.CRITICAL,
    statusCode: 500
  };

  // Handle network errors
  if (!error.response) {
    return {
      ...defaultError,
      message: 'Network error. Please check your internet connection and try again.',
      code: 'NETWORK_ERROR'
    };
  }

  const { status, data } = error.response;

  // Handle non-JSON responses
  if (!data || typeof data !== 'object') {
    return {
      ...defaultError,
      statusCode: status,
      message: `Server error (${status}). Please try again later.`
    };
  }

  // Extract error information from response
  const errorCode = data.error?.code || SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR;
  const errorMessage = data.error?.message || data.message || ERROR_MESSAGES[errorCode];
  const errorDetails = data.error?.details || null;

  return {
    code: errorCode,
    message: errorMessage,
    details: errorDetails,
    severity: ERROR_SEVERITY_MAP[errorCode] || ERROR_SEVERITY.MEDIUM,
    statusCode: status,
    userFriendlyMessage: ERROR_MESSAGES[errorCode] || errorMessage
  };
};

/**
 * Handle withdrawal-specific errors
 * @param {Object} error - Error object
 * @returns {Object} Processed error with specific handling
 */
export const handleWithdrawalError = (error) => {
  const parsedError = parseServerError(error);

  // Add specific handling for withdrawal errors
  switch (parsedError.code) {
    case SERVER_ERROR_CODES.INSUFFICIENT_BALANCE:
      if (parsedError.details?.availableBalance !== undefined) {
        parsedError.userFriendlyMessage = `Insufficient balance. You have ${parsedError.details.availableBalance} available for withdrawal.`;
      }
      break;

    case SERVER_ERROR_CODES.DUPLICATE_REQUEST:
      if (parsedError.details?.submittedAt) {
        const submittedTime = new Date(parsedError.details.submittedAt).toLocaleTimeString();
        parsedError.userFriendlyMessage = `A similar request was submitted at ${submittedTime}. Please wait before submitting another.`;
      }
      break;

    case SERVER_ERROR_CODES.TOO_MANY_REQUESTS:
      if (parsedError.details?.currentPendingCount && parsedError.details?.maxAllowed) {
        parsedError.userFriendlyMessage = `You have ${parsedError.details.currentPendingCount} pending requests. Maximum allowed is ${parsedError.details.maxAllowed}.`;
      }
      break;

    case SERVER_ERROR_CODES.VALIDATION_ERROR:
      if (Array.isArray(parsedError.details)) {
        parsedError.userFriendlyMessage = parsedError.details.join(' ');
      }
      break;
  }

  return parsedError;
};

/**
 * Get appropriate toast type based on error severity
 * @param {string} severity - Error severity level
 * @returns {string} Toast type
 */
export const getToastType = (severity) => {
  switch (severity) {
    case ERROR_SEVERITY.LOW:
      return 'warning';
    case ERROR_SEVERITY.MEDIUM:
      return 'error';
    case ERROR_SEVERITY.HIGH:
    case ERROR_SEVERITY.CRITICAL:
      return 'error';
    default:
      return 'error';
  }
};

/**
 * Show error toast with appropriate styling
 * @param {Function} toast - Toast function
 * @param {Object} error - Error object
 * @param {Object} options - Toast options
 */
export const showErrorToast = (toast, error, options = {}) => {
  const parsedError = typeof error === 'string' ? { message: error, severity: ERROR_SEVERITY.MEDIUM } : error;
  const toastType = getToastType(parsedError.severity);
  
  const toastOptions = {
    position: 'top-right',
    autoClose: parsedError.severity === ERROR_SEVERITY.CRITICAL ? 8000 : 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  };

  toast[toastType](parsedError.userFriendlyMessage || parsedError.message, toastOptions);
};

/**
 * Map field-specific errors to form fields
 * @param {Object} error - Server error object
 * @returns {Object} Field errors object
 */
export const mapServerErrorsToFields = (error) => {
  const fieldErrors = {};
  
  if (!error.details) return fieldErrors;

  // Handle validation errors array
  if (Array.isArray(error.details)) {
    error.details.forEach(detail => {
      if (typeof detail === 'string') {
        // Try to extract field name from error message
        if (detail.includes('mobile number')) {
          fieldErrors.mobileNumber = detail;
        } else if (detail.includes('account number')) {
          fieldErrors.accountNumber = detail;
        } else if (detail.includes('account name') || detail.includes('account holder')) {
          fieldErrors.accountName = detail;
          fieldErrors.accountHolderName = detail;
        } else if (detail.includes('bank name')) {
          fieldErrors.bankName = detail;
        } else if (detail.includes('amount')) {
          fieldErrors.amount = detail;
        } else if (detail.includes('provider')) {
          fieldErrors.provider = detail;
        }
      }
    });
  }

  // Handle specific error codes
  switch (error.code) {
    case SERVER_ERROR_CODES.INVALID_MOBILE_NUMBER:
      fieldErrors.mobileNumber = error.message;
      break;
    case SERVER_ERROR_CODES.INVALID_ACCOUNT_NUMBER:
      fieldErrors.accountNumber = error.message;
      break;
    case SERVER_ERROR_CODES.INVALID_ACCOUNT_HOLDER_NAME:
      fieldErrors.accountHolderName = error.message;
      break;
    case SERVER_ERROR_CODES.INVALID_ACCOUNT_NAME:
      fieldErrors.accountName = error.message;
      break;
    case SERVER_ERROR_CODES.INVALID_BANK_NAME:
      fieldErrors.bankName = error.message;
      break;
    case SERVER_ERROR_CODES.INVALID_AMOUNT:
    case SERVER_ERROR_CODES.INSUFFICIENT_BALANCE:
      fieldErrors.amount = error.message;
      break;
    case SERVER_ERROR_CODES.INVALID_PROVIDER:
      fieldErrors.provider = error.message;
      break;
  }

  return fieldErrors;
};

/**
 * Check if error requires user action
 * @param {Object} error - Error object
 * @returns {boolean} True if user action is required
 */
export const requiresUserAction = (error) => {
  const actionRequiredCodes = [
    SERVER_ERROR_CODES.ACCOUNT_SUSPENDED,
    SERVER_ERROR_CODES.INVALID_USER_PERMISSIONS,
    SERVER_ERROR_CODES.UNAUTHORIZED_ACCESS,
    SERVER_ERROR_CODES.SUSPICIOUS_ACTIVITY
  ];

  return actionRequiredCodes.includes(error.code);
};

/**
 * Get suggested action for error
 * @param {Object} error - Error object
 * @returns {string|null} Suggested action or null
 */
export const getSuggestedAction = (error) => {
  switch (error.code) {
    case SERVER_ERROR_CODES.ACCOUNT_SUSPENDED:
      return 'Please contact our support team to resolve your account status.';
    case SERVER_ERROR_CODES.INVALID_USER_PERMISSIONS:
      return 'Please complete your KYC verification to enable withdrawals.';
    case SERVER_ERROR_CODES.UNAUTHORIZED_ACCESS:
      return 'Please log out and log back in to refresh your session.';
    case SERVER_ERROR_CODES.SUSPICIOUS_ACTIVITY:
      return 'Please contact our support team for account verification.';
    case SERVER_ERROR_CODES.TOO_MANY_REQUESTS:
      return 'Please wait for your pending requests to be processed before submitting new ones.';
    case SERVER_ERROR_CODES.DUPLICATE_REQUEST:
      return 'Please wait a few minutes before submitting another withdrawal request.';
    case SERVER_ERROR_CODES.INSUFFICIENT_BALANCE:
      return 'Please check your available balance and adjust the withdrawal amount.';
    default:
      return null;
  }
};

/**
 * Log error for debugging (in development)
 * @param {Object} error - Error object
 * @param {string} context - Context where error occurred
 */
export const logError = (error, context = 'Unknown') => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Withdrawal Error - ${context}`);
    console.error('Error Code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
    console.error('Severity:', error.severity);
    console.error('Status Code:', error.statusCode);
    console.groupEnd();
  }
};

/**
 * Create error boundary fallback component props
 * @param {Object} error - Error object
 * @returns {Object} Props for error boundary fallback
 */
export const createErrorBoundaryProps = (error) => {
  return {
    title: 'Something went wrong',
    message: error.userFriendlyMessage || error.message || 'An unexpected error occurred',
    action: getSuggestedAction(error),
    severity: error.severity || ERROR_SEVERITY.MEDIUM
  };
};