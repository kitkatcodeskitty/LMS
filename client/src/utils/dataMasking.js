/**
 * Utility functions for masking sensitive data in the UI
 */

/**
 * Masks a phone number, showing only first 2 and last 2 digits
 * @param {string} phoneNumber - The phone number to mask
 * @returns {string} - Masked phone number
 */
export const maskPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return '******';
  
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return '******';
  
  const firstTwo = cleaned.slice(0, 2);
  const lastTwo = cleaned.slice(-2);
  const maskedLength = cleaned.length - 4;
  const masked = 'x'.repeat(Math.max(maskedLength, 3));
  
  return `${firstTwo}${masked}${lastTwo}`;
};

/**
 * Masks an account number, showing only first 2 and last 2 digits
 * @param {string} accountNumber - The account number to mask
 * @returns {string} - Masked account number
 */
export const maskAccountNumber = (accountNumber) => {
  if (!accountNumber || typeof accountNumber !== 'string') return '******';
  
  const cleaned = accountNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return '******';
  
  const firstTwo = cleaned.slice(0, 2);
  const lastTwo = cleaned.slice(-2);
  const maskedLength = cleaned.length - 4;
  const masked = 'x'.repeat(Math.max(maskedLength, 3));
  
  return `${firstTwo}${masked}${lastTwo}`;
};

/**
 * Masks an email address, showing only first character and domain
 * @param {string} email - The email to mask
 * @returns {string} - Masked email
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '******';
  
  const [localPart, domain] = email.split('@');
  if (!domain) return '******';
  
  if (localPart.length <= 1) return `${localPart}***@${domain}`;
  
  const firstChar = localPart[0];
  const maskedLocal = firstChar + 'x'.repeat(localPart.length - 1);
  
  return `${maskedLocal}@${domain}`;
};

/**
 * Masks a name, showing only first and last character
 * @param {string} name - The name to mask
 * @returns {string} - Masked name
 */
export const maskName = (name) => {
  if (!name || typeof name !== 'string') return '******';
  
  const trimmed = name.trim();
  if (trimmed.length <= 2) return '******';
  
  const firstChar = trimmed[0];
  const lastChar = trimmed[trimmed.length - 1];
  const maskedMiddle = 'x'.repeat(trimmed.length - 2);
  
  return `${firstChar}${maskedMiddle}${lastChar}`;
};

/**
 * Masks any sensitive text, showing only first and last character
 * @param {string} text - The text to mask
 * @param {number} minLength - Minimum length before masking (default: 3)
 * @returns {string} - Masked text
 */
export const maskSensitiveText = (text, minLength = 3) => {
  if (!text || typeof text !== 'string') return '******';
  
  const trimmed = text.trim();
  if (trimmed.length <= minLength) return 'x'.repeat(Math.max(trimmed.length, 3));
  
  const firstChar = trimmed[0];
  const lastChar = trimmed[trimmed.length - 1];
  const maskedMiddle = 'x'.repeat(trimmed.length - 2);
  
  return `${firstChar}${maskedMiddle}${lastChar}`;
};

/**
 * Masks a bank name or provider name, showing only first few characters
 * @param {string} name - The bank/provider name to mask
 * @returns {string} - Masked name
 */
export const maskBankName = (name) => {
  if (!name || typeof name !== 'string') return '******';
  
  const trimmed = name.trim();
  if (trimmed.length <= 3) return '******';
  
  const firstThree = trimmed.slice(0, 3);
  const masked = 'x'.repeat(Math.max(trimmed.length - 3, 2));
  
  return `${firstThree}${masked}`;
};
