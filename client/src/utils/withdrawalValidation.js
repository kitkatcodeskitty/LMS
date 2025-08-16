/**
 * Client-side validation utilities for withdrawal system
 */

// Validation constants
export const VALIDATION_CONSTANTS = {
  MIN_WITHDRAWAL_AMOUNT: 1,
  MAX_WITHDRAWAL_AMOUNT: 100000,
  MIN_ACCOUNT_HOLDER_NAME_LENGTH: 2,
  MAX_ACCOUNT_HOLDER_NAME_LENGTH: 100,
  MIN_BANK_NAME_LENGTH: 2,
  MAX_BANK_NAME_LENGTH: 100,
  MOBILE_NUMBER_REGEX: /^(98|97)\d{8}$/,
  ACCOUNT_NUMBER_REGEX: /^[A-Za-z0-9]{8,20}$/,
  NAME_REGEX: /^[a-zA-Z\s.'-]+$/,
  BANK_NAME_REGEX: /^[a-zA-Z\s&.-]+$/,
  VALID_MOBILE_PROVIDERS: ['eSewa', 'Khalti', 'IME Pay', 'ConnectIPS', 'Other'],
  VALID_WITHDRAWAL_METHODS: ['mobile_banking', 'bank_transfer']
};

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_AMOUNT: 'Please enter a valid amount',
  AMOUNT_TOO_LOW: `Minimum withdrawal amount is ${VALIDATION_CONSTANTS.MIN_WITHDRAWAL_AMOUNT}`,
  AMOUNT_TOO_HIGH: `Maximum withdrawal amount is ${VALIDATION_CONSTANTS.MAX_WITHDRAWAL_AMOUNT}`,
  INSUFFICIENT_BALANCE: 'Withdrawal amount exceeds available balance',
  INVALID_MOBILE_NUMBER: 'Please enter a valid Nepali mobile number (98XXXXXXXX or 97XXXXXXXX)',
  INVALID_ACCOUNT_NUMBER: 'Account number must be 8-20 alphanumeric characters',
  INVALID_NAME_FORMAT: 'Name can only contain letters, spaces, dots, apostrophes, and hyphens',
  NAME_TOO_SHORT: `Name must be at least ${VALIDATION_CONSTANTS.MIN_ACCOUNT_HOLDER_NAME_LENGTH} characters`,
  NAME_TOO_LONG: `Name must not exceed ${VALIDATION_CONSTANTS.MAX_ACCOUNT_HOLDER_NAME_LENGTH} characters`,
  BANK_NAME_TOO_SHORT: `Bank name must be at least ${VALIDATION_CONSTANTS.MIN_BANK_NAME_LENGTH} characters`,
  BANK_NAME_TOO_LONG: `Bank name must not exceed ${VALIDATION_CONSTANTS.MAX_BANK_NAME_LENGTH} characters`,
  INVALID_BANK_NAME_FORMAT: 'Bank name can only contain letters, spaces, ampersands, dots, and hyphens',
  INVALID_PROVIDER: `Please select a valid provider: ${VALIDATION_CONSTANTS.VALID_MOBILE_PROVIDERS.join(', ')}`,
  INVALID_METHOD: `Please select a valid withdrawal method: ${VALIDATION_CONSTANTS.VALID_WITHDRAWAL_METHODS.join(', ')}`
};

/**
 * Sanitize input string by removing dangerous characters and trimming
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

/**
 * Validate withdrawal amount
 * @param {number|string} amount - Amount to validate
 * @param {number} availableBalance - User's available balance
 * @returns {Object} Validation result
 */
export const validateAmount = (amount, availableBalance = null) => {
  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Check if amount is provided
  if (!amount && amount !== 0) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }
  
  // Check if amount is a valid number
  if (isNaN(numAmount) || !isFinite(numAmount)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_AMOUNT
    };
  }
  
  // Check minimum amount
  if (numAmount < VALIDATION_CONSTANTS.MIN_WITHDRAWAL_AMOUNT) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.AMOUNT_TOO_LOW
    };
  }
  
  // Check maximum amount
  if (numAmount > VALIDATION_CONSTANTS.MAX_WITHDRAWAL_AMOUNT) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.AMOUNT_TOO_HIGH
    };
  }
  
  // Check against available balance if provided
  if (availableBalance !== null && numAmount > availableBalance) {
    return {
      isValid: false,
      error: `${ERROR_MESSAGES.INSUFFICIENT_BALANCE}. Available: ${availableBalance}`
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: numAmount
  };
};

/**
 * Validate account holder name or account name
 * @param {string} name - Name to validate
 * @returns {Object} Validation result
 */
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }
  
  const sanitizedName = sanitizeInput(name);
  
  if (sanitizedName.length < VALIDATION_CONSTANTS.MIN_ACCOUNT_HOLDER_NAME_LENGTH) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.NAME_TOO_SHORT
    };
  }
  
  if (sanitizedName.length > VALIDATION_CONSTANTS.MAX_ACCOUNT_HOLDER_NAME_LENGTH) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.NAME_TOO_LONG
    };
  }
  
  if (!VALIDATION_CONSTANTS.NAME_REGEX.test(sanitizedName)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_NAME_FORMAT
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: sanitizedName
  };
};

/**
 * Validate mobile number
 * @param {string} mobileNumber - Mobile number to validate
 * @returns {Object} Validation result
 */
export const validateMobileNumber = (mobileNumber) => {
  if (!mobileNumber || !mobileNumber.trim()) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }
  
  const sanitizedNumber = mobileNumber.trim().replace(/\s+/g, '');
  
  if (!VALIDATION_CONSTANTS.MOBILE_NUMBER_REGEX.test(sanitizedNumber)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_MOBILE_NUMBER
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: sanitizedNumber
  };
};

/**
 * Validate mobile banking provider
 * @param {string} provider - Provider to validate
 * @returns {Object} Validation result
 */
export const validateProvider = (provider) => {
  if (!provider || !provider.trim()) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }
  
  const sanitizedProvider = provider.trim();
  
  if (!VALIDATION_CONSTANTS.VALID_MOBILE_PROVIDERS.includes(sanitizedProvider)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_PROVIDER
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: sanitizedProvider
  };
};

/**
 * Validate account number
 * @param {string} accountNumber - Account number to validate
 * @returns {Object} Validation result
 */
export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber || !accountNumber.trim()) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }
  
  const sanitizedNumber = accountNumber.trim().replace(/\s+/g, '');
  
  if (!VALIDATION_CONSTANTS.ACCOUNT_NUMBER_REGEX.test(sanitizedNumber)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_ACCOUNT_NUMBER
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: sanitizedNumber
  };
};

/**
 * Validate bank name
 * @param {string} bankName - Bank name to validate
 * @returns {Object} Validation result
 */
export const validateBankName = (bankName) => {
  if (!bankName || !bankName.trim()) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }
  
  const sanitizedName = sanitizeInput(bankName);
  
  if (sanitizedName.length < VALIDATION_CONSTANTS.MIN_BANK_NAME_LENGTH) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.BANK_NAME_TOO_SHORT
    };
  }
  
  if (sanitizedName.length > VALIDATION_CONSTANTS.MAX_BANK_NAME_LENGTH) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.BANK_NAME_TOO_LONG
    };
  }
  
  if (!VALIDATION_CONSTANTS.BANK_NAME_REGEX.test(sanitizedName)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_BANK_NAME_FORMAT
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: sanitizedName
  };
};

/**
 * Validate withdrawal method
 * @param {string} method - Withdrawal method to validate
 * @returns {Object} Validation result
 */
export const validateWithdrawalMethod = (method) => {
  if (!method || !method.trim()) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }
  
  if (!VALIDATION_CONSTANTS.VALID_WITHDRAWAL_METHODS.includes(method)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_METHOD
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: method
  };
};

/**
 * Validate mobile banking form data
 * @param {Object} formData - Mobile banking form data
 * @param {number} availableBalance - User's available balance
 * @returns {Object} Validation result
 */
export const validateMobileBankingForm = (formData, availableBalance = null) => {
  const errors = {};
  const sanitizedData = {};
  
  // Validate amount
  const amountValidation = validateAmount(formData.amount, availableBalance);
  if (!amountValidation.isValid) {
    errors.amount = amountValidation.error;
  } else {
    sanitizedData.amount = amountValidation.sanitizedValue;
  }
  
  // Validate account holder name
  const nameValidation = validateName(formData.accountHolderName);
  if (!nameValidation.isValid) {
    errors.accountHolderName = nameValidation.error;
  } else {
    sanitizedData.accountHolderName = nameValidation.sanitizedValue;
  }
  
  // Validate mobile number
  const mobileValidation = validateMobileNumber(formData.mobileNumber);
  if (!mobileValidation.isValid) {
    errors.mobileNumber = mobileValidation.error;
  } else {
    sanitizedData.mobileNumber = mobileValidation.sanitizedValue;
  }
  
  // Validate provider
  const providerValidation = validateProvider(formData.provider);
  if (!providerValidation.isValid) {
    errors.provider = providerValidation.error;
  } else {
    sanitizedData.provider = providerValidation.sanitizedValue;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: Object.keys(errors).length === 0 ? sanitizedData : null
  };
};

/**
 * Validate bank transfer form data
 * @param {Object} formData - Bank transfer form data
 * @param {number} availableBalance - User's available balance
 * @returns {Object} Validation result
 */
export const validateBankTransferForm = (formData, availableBalance = null) => {
  const errors = {};
  const sanitizedData = {};
  
  // Validate amount
  const amountValidation = validateAmount(formData.amount, availableBalance);
  if (!amountValidation.isValid) {
    errors.amount = amountValidation.error;
  } else {
    sanitizedData.amount = amountValidation.sanitizedValue;
  }
  
  // Validate account name
  const accountNameValidation = validateName(formData.accountName);
  if (!accountNameValidation.isValid) {
    errors.accountName = accountNameValidation.error;
  } else {
    sanitizedData.accountName = accountNameValidation.sanitizedValue;
  }
  
  // Validate account number
  const accountNumberValidation = validateAccountNumber(formData.accountNumber);
  if (!accountNumberValidation.isValid) {
    errors.accountNumber = accountNumberValidation.error;
  } else {
    sanitizedData.accountNumber = accountNumberValidation.sanitizedValue;
  }
  
  // Validate bank name
  const bankNameValidation = validateBankName(formData.bankName);
  if (!bankNameValidation.isValid) {
    errors.bankName = bankNameValidation.error;
  } else {
    sanitizedData.bankName = bankNameValidation.sanitizedValue;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: Object.keys(errors).length === 0 ? sanitizedData : null
  };
};

/**
 * Real-time field validation for better UX
 * @param {string} fieldName - Name of the field being validated
 * @param {any} value - Value to validate
 * @param {Object} options - Additional validation options
 * @returns {Object} Validation result
 */
export const validateField = (fieldName, value, options = {}) => {
  switch (fieldName) {
    case 'amount':
      return validateAmount(value, options.availableBalance);
    case 'accountHolderName':
    case 'accountName':
      return validateName(value);
    case 'mobileNumber':
      return validateMobileNumber(value);
    case 'provider':
      return validateProvider(value);
    case 'accountNumber':
      return validateAccountNumber(value);
    case 'bankName':
      return validateBankName(value);
    case 'method':
      return validateWithdrawalMethod(value);
    default:
      return { isValid: true };
  }
};

/**
 * Format error message for display
 * @param {string} error - Error message
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return '';
  
  // Capitalize first letter and ensure proper punctuation
  const formatted = error.charAt(0).toUpperCase() + error.slice(1);
  return formatted.endsWith('.') ? formatted : formatted + '.';
};

/**
 * Check if form has any validation errors
 * @param {Object} errors - Errors object
 * @returns {boolean} True if form has errors
 */
export const hasFormErrors = (errors) => {
  return Object.keys(errors).some(key => errors[key]);
};

/**
 * Get first error message from errors object
 * @param {Object} errors - Errors object
 * @returns {string|null} First error message or null
 */
export const getFirstError = (errors) => {
  const errorKeys = Object.keys(errors);
  if (errorKeys.length === 0) return null;
  
  const firstErrorKey = errorKeys[0];
  return errors[firstErrorKey];
};

/**
 * Debounce function for real-time validation
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};