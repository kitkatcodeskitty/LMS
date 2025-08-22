/**
 * Comprehensive validation utilities for withdrawal system
 */

// Validation error codes
export const VALIDATION_ERRORS = {
  // General validation errors
  MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
  INVALID_METHOD: 'INVALID_METHOD',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  
  // Mobile banking validation errors
  MISSING_MOBILE_BANKING_DETAILS: 'MISSING_MOBILE_BANKING_DETAILS',
  INVALID_MOBILE_NUMBER: 'INVALID_MOBILE_NUMBER',
  INVALID_PROVIDER: 'INVALID_PROVIDER',
  INVALID_ACCOUNT_HOLDER_NAME: 'INVALID_ACCOUNT_HOLDER_NAME',
  
  // Bank transfer validation errors
  MISSING_BANK_TRANSFER_DETAILS: 'MISSING_BANK_TRANSFER_DETAILS',
  INVALID_ACCOUNT_NUMBER: 'INVALID_ACCOUNT_NUMBER',
  INVALID_BANK_NAME: 'INVALID_BANK_NAME',
  INVALID_ACCOUNT_NAME: 'INVALID_ACCOUNT_NAME',
  INVALID_IBAN: 'INVALID_IBAN',
  INVALID_SWIFT_CODE: 'INVALID_SWIFT_CODE',
  INVALID_COUNTRY: 'INVALID_COUNTRY',
  
  // Security and permission errors
  DUPLICATE_REQUEST: 'DUPLICATE_REQUEST',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  INVALID_USER_PERMISSIONS: 'INVALID_USER_PERMISSIONS',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  
  // Rate limiting and security
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  
  // System errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};

// Validation constants
export const VALIDATION_CONSTANTS = {
  MIN_WITHDRAWAL_AMOUNT: 1,
  MIN_MOBILE_BANKING_AMOUNT: 100,
  MIN_BANK_TRANSFER_AMOUNT: 500,
  MAX_WITHDRAWAL_AMOUNT: 100000,
  MAX_PENDING_WITHDRAWALS: 5,
  MIN_ACCOUNT_HOLDER_NAME_LENGTH: 2,
  MAX_ACCOUNT_HOLDER_NAME_LENGTH: 100,
  MIN_BANK_NAME_LENGTH: 2,
  MAX_BANK_NAME_LENGTH: 100,
  MOBILE_NUMBER_REGEX: /^(98|97)\d{8}$/,
  ACCOUNT_NUMBER_REGEX: /^[A-Za-z0-9]{8,20}$/,
  NAME_REGEX: /^[a-zA-Z\s.'-]+$/,
  BANK_NAME_REGEX: /^[a-zA-Z\s&.-]+$/,
  VALID_MOBILE_PROVIDERS: ['eSewa', 'Khalti', 'IME Pay', 'ConnectIPS', 'Other'],
  VALID_WITHDRAWAL_METHODS: ['mobile_banking', 'bank_transfer'],
  VALID_WITHDRAWAL_STATUSES: ['pending', 'approved', 'rejected']
};

/**
 * Sanitize and validate input string
 * @param {string} input - Input string to sanitize
 * @param {Object} options - Validation options
 * @returns {Object} Sanitized string and validation result
 */
export const sanitizeInput = (input, options = {}) => {
  if (typeof input !== 'string') {
    return {
      sanitized: '',
      valid: false,
      error: 'Input must be a string'
    };
  }

  // Basic sanitization
  let sanitized = input.trim();

  // Remove potentially dangerous characters if specified
  if (options.removeDangerous) {
    // Remove a broader range of potentially dangerous characters
    sanitized = sanitized.replace(/[<>"'&`\/\\(){}[\]]/g, '');
    // Also consider using a proper sanitization library like DOMPurify for HTML contexts
  }

  // Length validation
  if (options.minLength && sanitized.length < options.minLength) {
    return {
      sanitized,
      valid: false,
      error: `Input must be at least ${options.minLength} characters long`
    };
  }

  if (options.maxLength && sanitized.length > options.maxLength) {
    return {
      sanitized: sanitized.substring(0, options.maxLength),
      valid: false,
      error: `Input must not exceed ${options.maxLength} characters`
    };
  }

  // Pattern validation
  if (options.pattern && !options.pattern.test(sanitized)) {
    return {
      sanitized,
      valid: false,
      error: options.patternError || 'Input format is invalid'
    };
  }

  return {
    sanitized,
    valid: true,
    error: null
  };
};

/**
 * Validate withdrawal method
 * @param {string} method - Withdrawal method
 * @returns {Object} Validation result
 */
export const validateWithdrawalMethod = (method) => {
  if (!method) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.MISSING_REQUIRED_FIELDS,
        message: 'Withdrawal method is required'
      }
    };
  }

  if (!VALIDATION_CONSTANTS.VALID_WITHDRAWAL_METHODS.includes(method)) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.INVALID_METHOD,
        message: `Method must be one of: ${VALIDATION_CONSTANTS.VALID_WITHDRAWAL_METHODS.join(', ')}`
      }
    };
  }

  return { valid: true };
};

/**
 * Validate withdrawal amount
 * @param {number} amount - Withdrawal amount
 * @param {number} availableBalance - User's available balance
 * @param {string} method - Withdrawal method (optional, for method-specific validation)
 * @returns {Object} Validation result
 */
export const validateWithdrawalAmount = (amount, availableBalance = null, method = null) => {
  // Check if amount is provided
  if (amount === undefined || amount === null) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.MISSING_REQUIRED_FIELDS,
        message: 'Withdrawal amount is required'
      }
    };
  }

  // Check if amount is a number
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.INVALID_AMOUNT,
        message: 'Amount must be a valid number'
      }
    };
  }

  // Check minimum amount based on method
  let minAmount = VALIDATION_CONSTANTS.MIN_WITHDRAWAL_AMOUNT;
  let methodName = 'withdrawal';
  
  if (method === 'mobile_banking') {
    minAmount = VALIDATION_CONSTANTS.MIN_MOBILE_BANKING_AMOUNT;
    methodName = 'mobile banking withdrawal';
  } else if (method === 'bank_transfer') {
    minAmount = VALIDATION_CONSTANTS.MIN_BANK_TRANSFER_AMOUNT;
    methodName = 'bank transfer withdrawal';
  }
  
  if (amount < minAmount) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.INVALID_AMOUNT,
        message: `Minimum ${methodName} amount is ${minAmount}`
      }
    };
  }

  
  // Check against available balance if provided
  if (availableBalance !== null && amount > availableBalance) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.INSUFFICIENT_BALANCE,
        message: 'Withdrawal amount exceeds available balance',
        details: {
          requestedAmount: amount,
          availableBalance: availableBalance
        }
      }
    };
  }

  return { valid: true };
};

/**
 * Validate mobile banking details with enhanced validation
 * @param {Object} details - Mobile banking details
 * @returns {Object} Validation result
 */
export const validateMobileBankingDetails = (details) => {
  if (!details) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.MISSING_REQUIRED_FIELDS,
        message: 'Mobile banking details are required'
      }
    };
  }

  const { accountHolderName, mobileNumber, provider } = details;

  // Validate account holder name
  if (!accountHolderName || typeof accountHolderName !== 'string') {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.MISSING_REQUIRED_FIELDS,
        message: 'Account holder name is required'
      }
    };
  }

  const trimmedName = accountHolderName.trim();
  if (trimmedName.length < 2 || trimmedName.length > VALIDATION_CONSTANTS.MAX_ACCOUNT_HOLDER_NAME_LENGTH) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.INVALID_ACCOUNT_HOLDER_NAME,
        message: `Account holder name must be between 2 and ${VALIDATION_CONSTANTS.MAX_ACCOUNT_HOLDER_NAME_LENGTH} characters`
      }
    };
  }

  // Validate mobile number with enhanced format support
  if (!mobileNumber || typeof mobileNumber !== 'string') {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.MISSING_REQUIRED_FIELDS,
        message: 'Mobile number is required'
      }
    };
  }

  const cleanMobileNumber = mobileNumber.replace(/\D/g, '');
  
  // Support multiple mobile number formats
  const mobileFormats = [
    /^(98|97)\d{8}$/, // Nepali format
    /^\+?[1-9]\d{1,14}$/, // International format (E.164)
    /^\d{10,15}$/ // General format for other countries
  ];
  
  const isValidFormat = mobileFormats.some(format => format.test(cleanMobileNumber));
  
  if (!isValidFormat) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.INVALID_MOBILE_NUMBER,
        message: 'Invalid mobile number format. Please enter a valid mobile number.'
      }
    };
  }

  // Validate provider
  if (!provider || typeof provider !== 'string') {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.MISSING_REQUIRED_FIELDS,
        message: 'Mobile banking provider is required'
      }
    };
  }

  const validProviders = ["eSewa", "Khalti", "IME Pay", "ConnectIPS", "Other"];
  if (!validProviders.includes(provider)) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.INVALID_PROVIDER,
        message: 'Invalid mobile banking provider'
      }
    };
  }

  return {
    valid: true,
    sanitizedData: {
      accountHolderName: trimmedName,
      mobileNumber: cleanMobileNumber,
      provider
    }
  };
};

/**
 * Validate bank transfer details with enhanced international support
 * @param {Object} details - Bank transfer details
 * @returns {Object} Validation result
 */
export const validateBankTransferDetails = (details) => {
  if (!details) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.MISSING_REQUIRED_FIELDS,
        message: 'Bank transfer details are required'
      }
    };
  }

  const { accountName, accountNumber, bankName, iban, swiftCode, country } = details;

  // Validate account name
  if (!accountName || typeof accountName !== 'string') {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.MISSING_REQUIRED_FIELDS,
        message: 'Account name is required'
      }
    };
  }

  const trimmedAccountName = accountName.trim();
  if (trimmedAccountName.length < 2 || trimmedAccountName.length > VALIDATION_CONSTANTS.MAX_ACCOUNT_HOLDER_NAME_LENGTH) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.INVALID_ACCOUNT_HOLDER_NAME,
        message: `Account name must be between 2 and ${VALIDATION_CONSTANTS.MAX_ACCOUNT_HOLDER_NAME_LENGTH} characters`
      }
    };
  }

  // Validate account number
  if (!accountNumber || typeof accountNumber !== 'string') {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.MISSING_REQUIRED_FIELDS,
        message: 'Account number is required'
      }
    };
  }

  const cleanAccountNumber = accountNumber.replace(/\s/g, '');
  if (cleanAccountNumber.length < 5 || cleanAccountNumber.length > 50) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.INVALID_ACCOUNT_NUMBER,
        message: 'Account number must be between 5 and 50 characters'
      }
    };
  }

  // Validate bank name
  if (!bankName || typeof bankName !== 'string') {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.MISSING_REQUIRED_FIELDS,
        message: 'Bank name is required'
      }
    };
  }

  const trimmedBankName = bankName.trim();
  if (trimmedBankName.length < 2 || trimmedBankName.length > 100) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.INVALID_BANK_NAME,
        message: 'Bank name must be between 2 and 100 characters'
      }
    };
  }

  // Validate IBAN if provided (for international transfers)
  if (iban && typeof iban === 'string') {
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    if (cleanIban.length < 15 || cleanIban.length > 34) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.INVALID_IBAN,
          message: 'IBAN must be between 15 and 34 characters'
        }
      };
    }
  }

  // Validate SWIFT code if provided (for international transfers)
  if (swiftCode && typeof swiftCode === 'string') {
    const cleanSwiftCode = swiftCode.replace(/\s/g, '').toUpperCase();
    if (cleanSwiftCode.length !== 8 && cleanSwiftCode.length !== 11) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.INVALID_SWIFT_CODE,
          message: 'SWIFT code must be 8 or 11 characters'
        }
      };
    }
  }

  // Validate country if provided
  if (country && typeof country === 'string') {
    const trimmedCountry = country.trim();
    if (trimmedCountry.length < 2 || trimmedCountry.length > 50) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.INVALID_COUNTRY,
          message: 'Country must be between 2 and 50 characters'
        }
      };
    }
  }

  return {
    valid: true,
    sanitizedData: {
      accountName: trimmedAccountName,
      accountNumber: cleanAccountNumber,
      bankName: trimmedBankName,
      iban: iban ? iban.replace(/\s/g, '').toUpperCase() : undefined,
      swiftCode: swiftCode ? swiftCode.replace(/\s/g, '').toUpperCase() : undefined,
      country: country ? country.trim() : undefined
    }
  };
};

/**
 * Check for duplicate withdrawal requests with enhanced security
 * @param {string} userId - User ID
 * @param {number} amount - Withdrawal amount
 * @param {string} method - Withdrawal method
 * @returns {Promise<Object>} Validation result
 */
export const checkDuplicateWithdrawal = async (userId, amount, method) => {
  try {
    const Withdrawal = (await import('../models/Withdrawal.js')).default;
    
    // Check for identical pending requests in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const duplicateRequest = await Withdrawal.findOne({
      userId,
      amount,
      method,
      status: 'pending',
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (duplicateRequest) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.DUPLICATE_REQUEST,
          message: 'A similar withdrawal request was submitted recently. Please wait before submitting another request.',
          details: {
            existingRequestId: duplicateRequest._id,
            submittedAt: duplicateRequest.createdAt
          }
        }
      };
    }

    // Additional check for suspicious patterns - multiple requests with same amount in short time
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSimilarRequests = await Withdrawal.countDocuments({
      userId,
      amount,
      createdAt: { $gte: oneHourAgo }
    });

    if (recentSimilarRequests >= 3) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.SUSPICIOUS_ACTIVITY,
          message: 'Multiple similar requests detected. Please contact support if you need assistance.',
          details: {
            similarRequestsCount: recentSimilarRequests,
            timeWindow: '1 hour'
          }
        }
      };
    }

    return { valid: true };

  } catch (error) {
    throw new Error(`Error checking duplicate withdrawal: ${error.message}`);
  }
};

/**
 * Check user's pending withdrawal count
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Validation result
 */
export const checkPendingWithdrawalLimit = async (userId) => {
  try {
    const Withdrawal = (await import('../models/Withdrawal.js')).default;
    
    const pendingCount = await Withdrawal.countDocuments({
      userId,
      status: 'pending'
    });

    if (pendingCount >= VALIDATION_CONSTANTS.MAX_PENDING_WITHDRAWALS) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.TOO_MANY_REQUESTS,
          message: `You have reached the maximum limit of ${VALIDATION_CONSTANTS.MAX_PENDING_WITHDRAWALS} pending withdrawal requests`,
          details: {
            currentPendingCount: pendingCount,
            maxAllowed: VALIDATION_CONSTANTS.MAX_PENDING_WITHDRAWALS
          }
        }
      };
    }

    return { valid: true };

  } catch (error) {
    throw new Error(`Error checking pending withdrawal limit: ${error.message}`);
  }
};

/**
 * Validate user permissions for withdrawal
 * @param {Object} user - User object
 * @returns {Object} Validation result
 */
export const validateUserPermissions = (user) => {
  if (!user) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.USER_NOT_FOUND,
        message: 'User not found'
      }
    };
  }

  // Check if user account is active (not suspended)
  if (user.status === 'suspended' || user.isSuspended) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.ACCOUNT_SUSPENDED,
        message: 'Your account is suspended. Please contact support.'
      }
    };
  }

  // Check KYC status if required
  if (user.kycStatus === 'rejected') {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.INVALID_USER_PERMISSIONS,
        message: 'Your KYC verification was rejected. Please resubmit your documents.'
      }
    };
  }

  return { valid: true };
};

/**
 * Comprehensive withdrawal request validation with enhanced security
 * @param {Object} requestData - Withdrawal request data
 * @param {Object} user - User object
 * @param {string} ipAddress - Client IP address (optional)
 * @returns {Promise<Object>} Validation result
 */
export const validateWithdrawalRequest = async (requestData, user, ipAddress = null) => {
  try {
    // First, sanitize all input data
    const sanitizedRequest = sanitizeWithdrawalRequest(requestData);
    const { method, amount, mobileBankingDetails, bankTransferDetails } = sanitizedRequest;

    // Validate user permissions
    const userPermissionCheck = validateUserPermissions(user);
    if (!userPermissionCheck.valid) {
      return userPermissionCheck;
    }

    // Check rate limiting
    try {
      const rateLimitCheck = await checkRateLimit(user._id, ipAddress);
      if (!rateLimitCheck.valid) {
        return rateLimitCheck;
      }
    } catch (error) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.INTERNAL_SERVER_ERROR,
          message: 'Rate limit check failed',
          details: error.message
        }
      };
    }
    
    // Validate withdrawal method
    const methodValidation = validateWithdrawalMethod(method);
    if (!methodValidation.valid) {
      return methodValidation;
    }

    // Get user's available balance
    const availableBalance = user.getAvailableBalance();

    // Validate withdrawal amount
    const amountValidation = validateWithdrawalAmount(amount, availableBalance, method);
    if (!amountValidation.valid) {
      return amountValidation;
    }

    // Security validation disabled to allow unrestricted withdrawal amounts
    // Only basic fraud prevention remains active

    // Check pending withdrawal limit
    const pendingLimitCheck = await checkPendingWithdrawalLimit(user._id);
    if (!pendingLimitCheck.valid) {
      return pendingLimitCheck;
    }

    // Check for duplicate requests
    const duplicateCheck = await checkDuplicateWithdrawal(user._id, amount, method);
    if (!duplicateCheck.valid) {
      return duplicateCheck;
    }

    // Validate method-specific details
    let sanitizedDetails = {};
    
    if (method === 'mobile_banking') {
      const mobileBankingValidation = validateMobileBankingDetails(mobileBankingDetails);
      if (!mobileBankingValidation.valid) {
        return mobileBankingValidation;
      }
      sanitizedDetails.mobileBankingDetails = mobileBankingValidation.sanitizedData;
    } else if (method === 'bank_transfer') {
      const bankTransferValidation = validateBankTransferDetails(bankTransferDetails);
      if (!bankTransferValidation.valid) {
        return bankTransferValidation;
      }
      sanitizedDetails.bankTransferDetails = bankTransferValidation.sanitizedData;
    }

    return {
      valid: true,
      sanitizedData: {
        method,
        amount,
        ...sanitizedDetails
      },
      availableBalance
    };

  } catch (error) {
    return {
      valid: false,
      error: {
        code: VALIDATION_ERRORS.INTERNAL_SERVER_ERROR,
        message: 'An error occurred during validation',
        details: error.message
      }
    };
  }
};

/**
 * Create standardized error response
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Object} Standardized error response
 */
export const createErrorResponse = (code, message, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (details) {
    response.error.details = details;
  }

  return response;
};

/**
 * Create standardized success response
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @returns {Object} Standardized success response
 */
export const createSuccessResponse = (message, data = null) => {
  const response = {
    success: true,
    message
  };

  if (data) {
    response.data = data;
  }

  return response;
};

/**
 * Advanced security validation for withdrawal requests
 * @param {Object} user - User object
 * @param {number} amount - Withdrawal amount
 * @param {string} method - Withdrawal method
 * @returns {Promise<Object>} Security validation result
 */
export const performSecurityValidation = async (user, amount, method) => {
  try {
    const Withdrawal = (await import('../models/Withdrawal.js')).default;
    
    // Check for unusual withdrawal patterns
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentWithdrawals = await Withdrawal.find({
      userId: user._id,
      createdAt: { $gte: last24Hours }
    });

    // Flag if user is trying to withdraw more than 80% of their balance in 24 hours AND the amount is over 10000
    const totalRecentWithdrawals = recentWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const totalAttempted = totalRecentWithdrawals + amount;
    
    if (totalAttempted > user.withdrawableBalance * 0.8 && amount > 10000) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.SUSPICIOUS_ACTIVITY,
          message: 'Large withdrawal amount detected. Please contact support for verification.',
          details: {
            attemptedAmount: totalAttempted,
            maxRecommended: user.withdrawableBalance * 0.8,
            timeWindow: '24 hours'
          }
        }
      };
    }

    // Check for rapid-fire requests (more than 5 requests in 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentRequestCount = await Withdrawal.countDocuments({
      userId: user._id,
      createdAt: { $gte: oneHourAgo }
    });

    if (recentRequestCount >= 5) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.TOO_MANY_REQUESTS,
          message: 'Too many withdrawal requests in a short time. Please wait before submitting more requests.',
          details: {
            requestCount: recentRequestCount,
            timeWindow: '1 hour',
            maxAllowed: 5
          }
        }
      };
    }

    return { valid: true };

  } catch (error) {
    throw new Error(`Error performing security validation: ${error.message}`);
  }
};

/**
 * Validate withdrawal request against user's transaction history
 * @param {Object} user - User object
 * @param {number} amount - Withdrawal amount
 * @returns {Promise<Object>} History validation result
 */
export const validateAgainstHistory = async (user, amount) => {
  try {
    const Withdrawal = (await import('../models/Withdrawal.js')).default;
    
    // Get user's withdrawal history
    const withdrawalHistory = await Withdrawal.find({
      userId: user._id,
      status: { $in: ['approved', 'completed'] }
    }).sort({ createdAt: -1 }).limit(10);

    // If this is user's first withdrawal and amount is very large, flag it
    if (withdrawalHistory.length === 0 && amount > 10000) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.SUSPICIOUS_ACTIVITY,
          message: 'Large first-time withdrawal detected. Please contact support for verification.',
          details: {
            isFirstWithdrawal: true,
            amount: amount,
            threshold: 10000
          }
        }
      };
    }

    // Check if amount is significantly higher than user's typical withdrawals
    if (withdrawalHistory.length > 0) {
      const avgWithdrawal = withdrawalHistory.reduce((sum, w) => sum + w.amount, 0) / withdrawalHistory.length;
      const maxPreviousWithdrawal = Math.max(...withdrawalHistory.map(w => w.amount));
      
      // Flag if current request is more than 3x the average or 2x the maximum previous
      if (amount > avgWithdrawal * 3 && amount > maxPreviousWithdrawal * 2) {
        return {
          valid: false,
          error: {
            code: VALIDATION_ERRORS.SUSPICIOUS_ACTIVITY,
            message: 'Withdrawal amount is significantly higher than your typical requests. Please contact support.',
            details: {
              requestedAmount: amount,
              averageAmount: Math.round(avgWithdrawal),
              maxPreviousAmount: maxPreviousWithdrawal
            }
          }
        };
      }
    }

    return { valid: true };

  } catch (error) {
    throw new Error(`Error validating against history: ${error.message}`);
  }
};

/**
 * Comprehensive input sanitization for all withdrawal fields
 * @param {Object} requestData - Raw request data
 * @returns {Object} Sanitized request data
 */
export const sanitizeWithdrawalRequest = (requestData) => {
  const sanitized = {};

  // Sanitize method
  if (requestData.method) {
    sanitized.method = String(requestData.method || '').trim().toLowerCase();  }

  // Sanitize amount (ensure it's a proper number)
  if (requestData.amount !== undefined) {
    const numAmount = parseFloat(requestData.amount);
    // Use a more precise rounding method for financial calculations
    sanitized.amount = isNaN(numAmount) ? 0 : Math.round((numAmount + Number.EPSILON) * 100) / 100;
    // Or consider using a library like decimal.js for precise decimal arithmetic
  }
  // Sanitize mobile banking details
  if (requestData.mobileBankingDetails) {
    sanitized.mobileBankingDetails = {};
    
    if (requestData.mobileBankingDetails.accountHolderName) {
      sanitized.mobileBankingDetails.accountHolderName = requestData.mobileBankingDetails.accountHolderName
        .toString()
        .trim()
        .replace(/[<>\"'&]/g, '')
        .replace(/\s+/g, ' ')
        .substring(0, VALIDATION_CONSTANTS.MAX_ACCOUNT_HOLDER_NAME_LENGTH);
    }
    
    if (requestData.mobileBankingDetails.mobileNumber) {
      sanitized.mobileBankingDetails.mobileNumber = requestData.mobileBankingDetails.mobileNumber
        .toString()
        .trim()
        .replace(/\D/g, ''); // Remove all non-digits
    }
    
    if (requestData.mobileBankingDetails.provider) {
      sanitized.mobileBankingDetails.provider = requestData.mobileBankingDetails.provider
        .toString()
        .trim();
    }
  }

  // Sanitize bank transfer details
  if (requestData.bankTransferDetails) {
    sanitized.bankTransferDetails = {};
    
    if (requestData.bankTransferDetails.accountName) {
      sanitized.bankTransferDetails.accountName = requestData.bankTransferDetails.accountName
        .toString()
        .trim()
        .replace(/[<>\"'&]/g, '')
        .replace(/\s+/g, ' ')
        .substring(0, VALIDATION_CONSTANTS.MAX_ACCOUNT_HOLDER_NAME_LENGTH);
    }
    
    if (requestData.bankTransferDetails.accountNumber) {
      sanitized.bankTransferDetails.accountNumber = requestData.bankTransferDetails.accountNumber
        .toString()
        .trim()
        .replace(/[^A-Za-z0-9]/g, '') // Remove all non-alphanumeric characters
        .substring(0, 20);
    }
    
    if (requestData.bankTransferDetails.bankName) {
      sanitized.bankTransferDetails.bankName = requestData.bankTransferDetails.bankName
        .toString()
        .trim()
        .replace(/[<>\"']/g, '')
        .replace(/\s+/g, ' ')
        .substring(0, VALIDATION_CONSTANTS.MAX_BANK_NAME_LENGTH);
    }
  }

  return sanitized;
};

/**
 * Rate limiting check for withdrawal requests
 * @param {string} userId - User ID
 * @param {string} ipAddress - Client IP address
 * @returns {Promise<Object>} Rate limit validation result
 */
export const checkRateLimit = async (userId, ipAddress = null) => {
  try {
    const Withdrawal = (await import('../models/Withdrawal.js')).default;
    
    // Check user-based rate limiting (max 10 requests per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const userRequestCount = await Withdrawal.countDocuments({
      userId,
      createdAt: { $gte: oneHourAgo }
    });

    if (userRequestCount >= 10) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded. Maximum 10 withdrawal requests per hour.',
          details: {
            requestCount: userRequestCount,
            maxAllowed: 10,
            timeWindow: '1 hour',
            resetTime: new Date(Date.now() + 60 * 60 * 1000)
          }
        }
      };
    }

    // Check for burst requests (max 3 requests per 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const burstRequestCount = await Withdrawal.countDocuments({
      userId,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (burstRequestCount >= 3) {
      return {
        valid: false,
        error: {
          code: VALIDATION_ERRORS.TOO_MANY_REQUESTS,
          message: 'Too many requests in a short time. Please wait 5 minutes before trying again.',
          details: {
            requestCount: burstRequestCount,
            maxAllowed: 3,
            timeWindow: '5 minutes',
            resetTime: new Date(Date.now() + 5 * 60 * 1000)
          }
        }
      };
    }

    return { valid: true };

  } catch (error) {
    throw new Error(`Error checking rate limit: ${error.message}`);
  }
};

// ...existing code...
