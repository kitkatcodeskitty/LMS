import {
  maskPhoneNumber,
  maskAccountNumber,
  maskEmail,
  maskName,
  maskBankName,
  maskSensitiveText
} from '../dataMasking';

describe('Data Masking Functions', () => {
  describe('maskPhoneNumber', () => {
    test('should mask phone numbers correctly', () => {
      expect(maskPhoneNumber('9876543210')).toBe('98xxxxxx10');
      expect(maskPhoneNumber('+9779876543210')).toBe('98xxxxxx10');
      expect(maskPhoneNumber('1234567890')).toBe('12xxxxxx90');
    });

    test('should handle short numbers', () => {
      expect(maskPhoneNumber('123')).toBe('******');
      expect(maskPhoneNumber('12')).toBe('******');
    });

    test('should handle invalid input', () => {
      expect(maskPhoneNumber('')).toBe('******');
      expect(maskPhoneNumber(null)).toBe('******');
      expect(maskPhoneNumber(undefined)).toBe('******');
    });
  });

  describe('maskAccountNumber', () => {
    test('should mask account numbers correctly', () => {
      expect(maskAccountNumber('1234567890')).toBe('12xxxxxx90');
      expect(maskAccountNumber('ABCD123456')).toBe('ABxxxxxx56');
      expect(maskAccountNumber('123456789012345')).toBe('12xxxxxxxxxxxx45');
    });

    test('should handle short numbers', () => {
      expect(maskAccountNumber('123')).toBe('******');
      expect(maskAccountNumber('12')).toBe('******');
    });

    test('should handle invalid input', () => {
      expect(maskAccountNumber('')).toBe('******');
      expect(maskAccountNumber(null)).toBe('******');
      expect(maskAccountNumber(undefined)).toBe('******');
    });
  });

  describe('maskEmail', () => {
    test('should mask emails correctly', () => {
      expect(maskEmail('user@example.com')).toBe('uxxx@example.com');
      expect(maskEmail('john.doe@company.org')).toBe('jxxxxxxxxx@company.org');
      expect(maskEmail('a@test.com')).toBe('a***@test.com');
    });

    test('should handle invalid emails', () => {
      expect(maskEmail('invalid-email')).toBe('******');
      expect(maskEmail('@domain.com')).toBe('******');
    });

    test('should handle invalid input', () => {
      expect(maskEmail('')).toBe('******');
      expect(maskEmail(null)).toBe('******');
      expect(maskEmail(undefined)).toBe('******');
    });
  });

  describe('maskName', () => {
    test('should mask names correctly', () => {
      expect(maskName('John Doe')).toBe('Jxx Dxx');
      expect(maskName('Alice')).toBe('Axxx');
      expect(maskName('Bob')).toBe('Bxx');
    });

    test('should handle short names', () => {
      expect(maskName('Jo')).toBe('******');
      expect(maskName('A')).toBe('******');
    });

    test('should handle invalid input', () => {
      expect(maskName('')).toBe('******');
      expect(maskName(null)).toBe('******');
      expect(maskName(undefined)).toBe('******');
    });
  });

  describe('maskBankName', () => {
    test('should mask bank names correctly', () => {
      expect(maskBankName('Nepal Bank')).toBe('Nepxxxxx');
      expect(maskBankName('Standard Chartered')).toBe('Staxxxxxx');
      expect(maskBankName('ABC Bank')).toBe('ABCxxxxx');
    });

    test('should handle short names', () => {
      expect(maskBankName('AB')).toBe('******');
      expect(maskBankName('A')).toBe('******');
    });

    test('should handle invalid input', () => {
      expect(maskBankName('')).toBe('******');
      expect(maskBankName(null)).toBe('******');
      expect(maskBankName(undefined)).toBe('******');
    });
  });

  describe('maskSensitiveText', () => {
    test('should mask text correctly', () => {
      expect(maskSensitiveText('sensitive')).toBe('sxxxxxxxx');
      expect(maskSensitiveText('secret')).toBe('sxxxxx');
      expect(maskSensitiveText('confidential')).toBe('cxxxxxxxxxx');
    });

    test('should respect minimum length', () => {
      expect(maskSensitiveText('abc', 2)).toBe('axx');
      expect(maskSensitiveText('ab', 2)).toBe('******');
    });

    test('should handle invalid input', () => {
      expect(maskSensitiveText('')).toBe('******');
      expect(maskSensitiveText(null)).toBe('******');
      expect(maskSensitiveText(undefined)).toBe('******');
    });
  });
});
