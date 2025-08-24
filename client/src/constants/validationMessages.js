// Centralized validation messages to eliminate duplicates
export const VALIDATION_MESSAGES = {
  // Common validation messages
  REQUIRED: {
    FIELD: 'This field is required',
    AMOUNT: 'Amount is required',
    ACCOUNT_HOLDER: 'Account holder name is required',
    MOBILE_NUMBER: 'Mobile number is required',
    PROVIDER: 'Provider is required',
    ACCOUNT_NAME: 'Account name is required',
    ACCOUNT_NUMBER: 'Account number is required',
    BANK_NAME: 'Bank name is required',
    FULL_NAME: 'Full name is required',
    ADDRESS: 'Address is required',
    CITY: 'City is required',
    STATE: 'State is required',
    POSTAL_CODE: 'Postal code is required',
    COUNTRY: 'Country is required',
    ID_NUMBER: 'ID number is required',
    DOB: 'Date of birth is required',
    PHONE_NUMBER: 'Phone number is required'
  },
  
  // Amount validation
  AMOUNT: {
    GREATER_THAN_ZERO: 'Please enter a valid amount greater than 0',
    WHOLE_NUMBER: 'Amount must be a whole number (no decimals)',
    VALID: 'Please enter a valid amount'
  },
  
  // Mobile/Phone validation
  MOBILE: {
    TEN_DIGIT: 'Please enter a valid 10-digit mobile number',
    VALID_PHONE: 'Please enter a valid phone number',
    NEPALI_FORMAT: 'Please enter a valid Nepali mobile number (98XXXXXXXX or 97XXXXXXXX)'
  },
  
  // Email validation
  EMAIL: {
    VALID: 'Please enter a valid email address'
  },
  
  // Age validation
  AGE: {
    MINIMUM_18: 'You must be at least 18 years old'
  },
  
  // Success messages
  SUCCESS: {
    KYC_SUBMITTED: 'KYC submitted successfully! We will review your application within 24-48 hours.',
    MESSAGE_SENT: 'Your message has been sent successfully! We\'ll get back to you within 24 hours.',
    PAYMENT_SUBMITTED: 'Your payment details have been submitted successfully. Our admin team will validate your payment within 24 hours.'
  },
  
  // Time frames
  TIME_FRAMES: {
    PAYMENT_VERIFICATION: 'Payment verification typically takes 24-48 hours. Our admin team reviews all payment screenshots and transaction details before approving course access.',
    KYC_REVIEW: 'Your KYC application is being reviewed. This usually takes 24-48 hours.',
    RESPONSE_TIME: 'We\'ll respond to your inquiry within 24 hours.',
    PAYMENT_VERIFICATION_TERMS: 'Payment verification typically takes 24-48 hours. All payments must be made through our approved payment methods with valid transaction documentation.'
  },
  
  // Referral messages
  REFERRAL: {
    SHARE_LINK: 'Share this link or code with others. If they purchase using your code or link, you\'ll earn affiliate rewards.',
    REFERRAL_EXPLANATION: 'Share your unique referral code or link with others. When they purchase a course using your code, you earn a commission. You need to purchase at least one course to access referral features.'
  }
};

// Helper function to get validation message
export const getValidationMessage = (category, type) => {
  return VALIDATION_MESSAGES[category]?.[type] || VALIDATION_MESSAGES.REQUIRED.FIELD;
};
