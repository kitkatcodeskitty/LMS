import { describe, test, expect } from 'vitest';
import {
  validateAmount,
  validateName,
  validateMobileNumber,
  ERROR_MESSAGES
} from '../utils/withdrawalValidation';

describe('Basic Withdrawal Validation', () => {
  describe('validateAmount', () => {
    test('should validate valid amount', () => {
      const result = validateAmount(100, 500);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(100);
    });

    test('should reject empty amount', () => {
      const result = validateAmount('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.REQUIRED_FIELD);
    });

    test('should reject amount exceeding balance', () => {
      const result = validateAmount(600, 500);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds available balance');
    });
  });

  describe('validateName', () => {
    test('should validate valid name', () => {
      const result = validateName('John Doe');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('John Doe');
    });

    test('should reject empty name', () => {
      const result = validateName('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.REQUIRED_FIELD);
    });
  });

  describe('validateMobileNumber', () => {
    test('should validate valid mobile number', () => {
      const result = validateMobileNumber('9812345678');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('9812345678');
    });

    test('should reject invalid mobile number', () => {
      const result = validateMobileNumber('1234567890');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_MOBILE_NUMBER);
    });
  });
});