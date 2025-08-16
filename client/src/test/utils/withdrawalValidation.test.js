import { vi } from 'vitest';
import {
  validateAmount,
  validateName,
  validateMobileNumber,
  validateProvider,
  validateAccountNumber,
  validateBankName,
  validateWithdrawalMethod,
  validateMobileBankingForm,
  validateBankTransferForm,
  validateField,
  sanitizeInput,
  formatErrorMessage,
  hasFormErrors,
  getFirstError,
  debounce,
  VALIDATION_CONSTANTS,
  ERROR_MESSAGES
} from '../../utils/withdrawalValidation';

describe('Client-side Withdrawal Validation', () => {
  describe('sanitizeInput', () => {
    test('should trim whitespace', () => {
      const result = sanitizeInput('  test string  ');
      expect(result).toBe('test string');
    });

    test('should remove dangerous characters', () => {
      const result = sanitizeInput('<script>alert("xss")</script>');
      expect(result).toBe('scriptalert(xss)/script');
    });

    test('should replace multiple spaces with single space', () => {
      const result = sanitizeInput('test    multiple    spaces');
      expect(result).toBe('test multiple spaces');
    });

    test('should handle non-string input', () => {
      const result = sanitizeInput(123);
      expect(result).toBe('');
    });
  });

  describe('validateAmount', () => {
    test('should validate valid amount', () => {
      const result = validateAmount(100, 500);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(100);
    });

    test('should validate string amount', () => {
      const result = validateAmount('150.50', 500);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(150.5);
    });

    test('should reject empty amount', () => {
      const result = validateAmount('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.REQUIRED_FIELD);
    });

    test('should reject invalid amount', () => {
      const result = validateAmount('not a number');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_AMOUNT);
    });

    test('should reject amount below minimum', () => {
      const result = validateAmount(0.5);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.AMOUNT_TOO_LOW);
    });

    test('should reject amount above maximum', () => {
      const result = validateAmount(200000);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.AMOUNT_TOO_HIGH);
    });

    test('should reject amount exceeding available balance', () => {
      const result = validateAmount(600, 500);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds available balance');
    });

    test('should handle infinite values', () => {
      const result = validateAmount(Infinity);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_AMOUNT);
    });
  });

  describe('validateName', () => {
    test('should validate valid name', () => {
      const result = validateName('John Doe');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('John Doe');
    });

    test('should validate name with special characters', () => {
      const result = validateName("O'Connor-Smith Jr.");
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe("O'Connor-Smith Jr.");
    });

    test('should reject empty name', () => {
      const result = validateName('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.REQUIRED_FIELD);
    });

    test('should reject name too short', () => {
      const result = validateName('A');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.NAME_TOO_SHORT);
    });

    test('should reject name too long', () => {
      const longName = 'A'.repeat(101);
      const result = validateName(longName);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.NAME_TOO_LONG);
    });

    test('should reject name with invalid characters', () => {
      const result = validateName('John123Doe');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_NAME_FORMAT);
    });

    test('should sanitize name with dangerous characters', () => {
      const result = validateName('John<script>Doe');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('JohnscriptDoe');
    });
  });

  describe('validateMobileNumber', () => {
    test('should validate valid mobile number starting with 98', () => {
      const result = validateMobileNumber('9812345678');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('9812345678');
    });

    test('should validate valid mobile number starting with 97', () => {
      const result = validateMobileNumber('9712345678');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('9712345678');
    });

    test('should reject empty mobile number', () => {
      const result = validateMobileNumber('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.REQUIRED_FIELD);
    });

    test('should reject invalid mobile number format', () => {
      const result = validateMobileNumber('1234567890');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_MOBILE_NUMBER);
    });

    test('should reject mobile number with wrong length', () => {
      const result = validateMobileNumber('981234567');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_MOBILE_NUMBER);
    });

    test('should sanitize mobile number with spaces', () => {
      const result = validateMobileNumber('98 123 45 678');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('9812345678');
    });
  });

  describe('validateProvider', () => {
    test('should validate valid provider', () => {
      const result = validateProvider('eSewa');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('eSewa');
    });

    test('should validate all valid providers', () => {
      const validProviders = ['eSewa', 'Khalti', 'IME Pay', 'ConnectIPS', 'Other'];
      
      validProviders.forEach(provider => {
        const result = validateProvider(provider);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedValue).toBe(provider);
      });
    });

    test('should reject empty provider', () => {
      const result = validateProvider('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.REQUIRED_FIELD);
    });

    test('should reject invalid provider', () => {
      const result = validateProvider('InvalidProvider');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_PROVIDER);
    });
  });

  describe('validateAccountNumber', () => {
    test('should validate valid account number', () => {
      const result = validateAccountNumber('ABC123456789');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('ABC123456789');
    });

    test('should validate numeric account number', () => {
      const result = validateAccountNumber('1234567890123456');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('1234567890123456');
    });

    test('should reject empty account number', () => {
      const result = validateAccountNumber('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.REQUIRED_FIELD);
    });

    test('should reject account number too short', () => {
      const result = validateAccountNumber('1234567');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_ACCOUNT_NUMBER);
    });

    test('should reject account number too long', () => {
      const result = validateAccountNumber('123456789012345678901');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_ACCOUNT_NUMBER);
    });

    test('should reject account number with special characters', () => {
      const result = validateAccountNumber('ABC-123-456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_ACCOUNT_NUMBER);
    });

    test('should sanitize account number with spaces', () => {
      const result = validateAccountNumber('ABC 123 456 789');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('ABC123456789');
    });
  });

  describe('validateBankName', () => {
    test('should validate valid bank name', () => {
      const result = validateBankName('Nepal Investment Bank');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('Nepal Investment Bank');
    });

    test('should validate bank name with ampersand', () => {
      const result = validateBankName('Standard Chartered Bank & Co.');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('Standard Chartered Bank & Co.');
    });

    test('should reject empty bank name', () => {
      const result = validateBankName('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.REQUIRED_FIELD);
    });

    test('should reject bank name too short', () => {
      const result = validateBankName('A');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.BANK_NAME_TOO_SHORT);
    });

    test('should reject bank name too long', () => {
      const longName = 'A'.repeat(101);
      const result = validateBankName(longName);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.BANK_NAME_TOO_LONG);
    });

    test('should reject bank name with invalid characters', () => {
      const result = validateBankName('Bank@123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_BANK_NAME_FORMAT);
    });
  });

  describe('validateWithdrawalMethod', () => {
    test('should validate mobile banking method', () => {
      const result = validateWithdrawalMethod('mobile_banking');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('mobile_banking');
    });

    test('should validate bank transfer method', () => {
      const result = validateWithdrawalMethod('bank_transfer');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('bank_transfer');
    });

    test('should reject empty method', () => {
      const result = validateWithdrawalMethod('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.REQUIRED_FIELD);
    });

    test('should reject invalid method', () => {
      const result = validateWithdrawalMethod('invalid_method');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_METHOD);
    });
  });

  describe('validateMobileBankingForm', () => {
    const validFormData = {
      amount: 100,
      accountHolderName: 'John Doe',
      mobileNumber: '9812345678',
      provider: 'eSewa'
    };

    test('should validate complete valid form', () => {
      const result = validateMobileBankingForm(validFormData, 500);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.sanitizedData).toBeDefined();
      expect(result.sanitizedData.amount).toBe(100);
      expect(result.sanitizedData.accountHolderName).toBe('John Doe');
      expect(result.sanitizedData.mobileNumber).toBe('9812345678');
      expect(result.sanitizedData.provider).toBe('eSewa');
    });

    test('should return errors for invalid form', () => {
      const invalidFormData = {
        amount: '',
        accountHolderName: '',
        mobileNumber: '1234567890',
        provider: 'InvalidProvider'
      };

      const result = validateMobileBankingForm(invalidFormData, 500);
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe(ERROR_MESSAGES.REQUIRED_FIELD);
      expect(result.errors.accountHolderName).toBe(ERROR_MESSAGES.REQUIRED_FIELD);
      expect(result.errors.mobileNumber).toBe(ERROR_MESSAGES.INVALID_MOBILE_NUMBER);
      expect(result.errors.provider).toBe(ERROR_MESSAGES.INVALID_PROVIDER);
      expect(result.sanitizedData).toBeNull();
    });

    test('should validate amount against available balance', () => {
      const formData = { ...validFormData, amount: 600 };
      const result = validateMobileBankingForm(formData, 500);
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toContain('exceeds available balance');
    });
  });

  describe('validateBankTransferForm', () => {
    const validFormData = {
      amount: 200,
      accountName: 'Jane Doe',
      accountNumber: 'ABC123456789',
      bankName: 'Test Bank'
    };

    test('should validate complete valid form', () => {
      const result = validateBankTransferForm(validFormData, 500);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.sanitizedData).toBeDefined();
      expect(result.sanitizedData.amount).toBe(200);
      expect(result.sanitizedData.accountName).toBe('Jane Doe');
      expect(result.sanitizedData.accountNumber).toBe('ABC123456789');
      expect(result.sanitizedData.bankName).toBe('Test Bank');
    });

    test('should return errors for invalid form', () => {
      const invalidFormData = {
        amount: -100,
        accountName: 'A',
        accountNumber: '123',
        bankName: ''
      };

      const result = validateBankTransferForm(invalidFormData, 500);
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe(ERROR_MESSAGES.AMOUNT_TOO_LOW);
      expect(result.errors.accountName).toBe(ERROR_MESSAGES.NAME_TOO_SHORT);
      expect(result.errors.accountNumber).toBe(ERROR_MESSAGES.INVALID_ACCOUNT_NUMBER);
      expect(result.errors.bankName).toBe(ERROR_MESSAGES.REQUIRED_FIELD);
      expect(result.sanitizedData).toBeNull();
    });
  });

  describe('validateField', () => {
    test('should validate amount field', () => {
      const result = validateField('amount', 100, { availableBalance: 500 });
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(100);
    });

    test('should validate mobile number field', () => {
      const result = validateField('mobileNumber', '9812345678');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('9812345678');
    });

    test('should return valid for unknown field', () => {
      const result = validateField('unknownField', 'value');
      expect(result.isValid).toBe(true);
    });
  });

  describe('formatErrorMessage', () => {
    test('should capitalize first letter', () => {
      const result = formatErrorMessage('this is an error');
      expect(result).toBe('This is an error.');
    });

    test('should not add period if already present', () => {
      const result = formatErrorMessage('This is an error.');
      expect(result).toBe('This is an error.');
    });

    test('should handle empty error', () => {
      const result = formatErrorMessage('');
      expect(result).toBe('');
    });

    test('should handle null error', () => {
      const result = formatErrorMessage(null);
      expect(result).toBe('');
    });
  });

  describe('hasFormErrors', () => {
    test('should return true when errors exist', () => {
      const errors = { amount: 'Error message', name: 'Another error' };
      const result = hasFormErrors(errors);
      expect(result).toBe(true);
    });

    test('should return false when no errors exist', () => {
      const errors = {};
      const result = hasFormErrors(errors);
      expect(result).toBe(false);
    });

    test('should return false when errors are empty strings', () => {
      const errors = { amount: '', name: '' };
      const result = hasFormErrors(errors);
      expect(result).toBe(false);
    });

    test('should return true when at least one error exists', () => {
      const errors = { amount: 'Error message', name: '' };
      const result = hasFormErrors(errors);
      expect(result).toBe(true);
    });
  });

  describe('getFirstError', () => {
    test('should return first error message', () => {
      const errors = { amount: 'Amount error', name: 'Name error' };
      const result = getFirstError(errors);
      expect(result).toBe('Amount error');
    });

    test('should return null when no errors', () => {
      const errors = {};
      const result = getFirstError(errors);
      expect(result).toBeNull();
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('should debounce function calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });

    test('should reset timer on new calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn('arg1');
      vi.advanceTimersByTime(200);
      
      debouncedFn('arg2');
      vi.advanceTimersByTime(200);
      
      expect(mockFn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(100);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg2');
    });
  });
});