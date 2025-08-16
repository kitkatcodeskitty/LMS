import { 
  validateWithdrawalRequest,
  validateWithdrawalMethod,
  validateWithdrawalAmount,
  validateMobileBankingDetails,
  validateBankTransferDetails,
  validateUserPermissions,
  checkDuplicateWithdrawal,
  checkPendingWithdrawalLimit,
  performSecurityValidation,
  validateAgainstHistory,
  sanitizeWithdrawalRequest,
  checkRateLimit,
  sanitizeInput,
  createErrorResponse,
  createSuccessResponse,
  VALIDATION_ERRORS,
  VALIDATION_CONSTANTS
} from '../../utils/withdrawalValidation.js';
import User from '../../models/User.js';
import Withdrawal from '../../models/Withdrawal.js';

// Mock the models
jest.mock('../../models/User.js');
jest.mock('../../models/Withdrawal.js');

describe('Withdrawal Validation Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sanitizeInput', () => {
    test('should sanitize basic string input', () => {
      const result = sanitizeInput('  Test String  ', {
        minLength: 2,
        maxLength: 20
      });
      
      expect(result.sanitized).toBe('Test String');
      expect(result.valid).toBe(true);
    });

    test('should remove dangerous characters', () => {
      const result = sanitizeInput('<script>alert("xss")</script>', {
        removeDangerous: true,
        maxLength: 50
      });
      
      expect(result.sanitized).toBe('scriptalert(xss)/script');
      expect(result.valid).toBe(true);
    });

    test('should validate minimum length', () => {
      const result = sanitizeInput('a', {
        minLength: 2
      });
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 2 characters');
    });

    test('should validate maximum length', () => {
      const result = sanitizeInput('very long string', {
        maxLength: 5
      });
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not exceed 5 characters');
    });

    test('should validate pattern', () => {
      const result = sanitizeInput('123abc', {
        pattern: /^\d+$/,
        patternError: 'Only numbers allowed'
      });
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Only numbers allowed');
    });
  });

  describe('validateWithdrawalMethod', () => {
    test('should validate valid mobile banking method', () => {
      const result = validateWithdrawalMethod('mobile_banking');
      expect(result.valid).toBe(true);
    });

    test('should validate valid bank transfer method', () => {
      const result = validateWithdrawalMethod('bank_transfer');
      expect(result.valid).toBe(true);
    });

    test('should reject invalid method', () => {
      const result = validateWithdrawalMethod('invalid_method');
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.INVALID_METHOD);
    });

    test('should reject empty method', () => {
      const result = validateWithdrawalMethod('');
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.MISSING_REQUIRED_FIELDS);
    });
  });

  describe('validateWithdrawalAmount', () => {
    test('should validate valid amount', () => {
      const result = validateWithdrawalAmount(100, 500);
      expect(result.valid).toBe(true);
    });

    test('should reject amount below minimum', () => {
      const result = validateWithdrawalAmount(0.5);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.INVALID_AMOUNT);
    });

    test('should reject amount above maximum', () => {
      const result = validateWithdrawalAmount(200000);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.INVALID_AMOUNT);
    });

    test('should reject amount exceeding available balance', () => {
      const result = validateWithdrawalAmount(600, 500);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.INSUFFICIENT_BALANCE);
      expect(result.error.details.requestedAmount).toBe(600);
      expect(result.error.details.availableBalance).toBe(500);
    });

    test('should reject non-numeric amount', () => {
      const result = validateWithdrawalAmount('not a number');
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.INVALID_AMOUNT);
    });

    test('should reject infinite amount', () => {
      const result = validateWithdrawalAmount(Infinity);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.INVALID_AMOUNT);
    });
  });

  describe('validateMobileBankingDetails', () => {
    const validDetails = {
      accountHolderName: 'John Doe',
      mobileNumber: '9812345678',
      provider: 'eSewa'
    };

    test('should validate valid mobile banking details', () => {
      const result = validateMobileBankingDetails(validDetails);
      expect(result.valid).toBe(true);
      expect(result.sanitizedData.accountHolderName).toBe('John Doe');
      expect(result.sanitizedData.mobileNumber).toBe('9812345678');
      expect(result.sanitizedData.provider).toBe('eSewa');
    });

    test('should reject missing details object', () => {
      const result = validateMobileBankingDetails(null);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.MISSING_MOBILE_BANKING_DETAILS);
    });

    test('should reject missing account holder name', () => {
      const details = { ...validDetails, accountHolderName: '' };
      const result = validateMobileBankingDetails(details);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.MISSING_MOBILE_BANKING_DETAILS);
    });

    test('should reject invalid mobile number format', () => {
      const details = { ...validDetails, mobileNumber: '1234567890' };
      const result = validateMobileBankingDetails(details);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.INVALID_MOBILE_NUMBER);
    });

    test('should reject invalid provider', () => {
      const details = { ...validDetails, provider: 'InvalidProvider' };
      const result = validateMobileBankingDetails(details);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.INVALID_PROVIDER);
    });

    test('should sanitize account holder name with dangerous characters', () => {
      const details = { ...validDetails, accountHolderName: 'John<script>Doe' };
      const result = validateMobileBankingDetails(details);
      expect(result.valid).toBe(true);
      expect(result.sanitizedData.accountHolderName).toBe('JohnscriptDoe');
    });
  });

  describe('validateBankTransferDetails', () => {
    const validDetails = {
      accountName: 'John Doe',
      accountNumber: 'ABC123456789',
      bankName: 'Test Bank'
    };

    test('should validate valid bank transfer details', () => {
      const result = validateBankTransferDetails(validDetails);
      expect(result.valid).toBe(true);
      expect(result.sanitizedData.accountName).toBe('John Doe');
      expect(result.sanitizedData.accountNumber).toBe('ABC123456789');
      expect(result.sanitizedData.bankName).toBe('Test Bank');
    });

    test('should reject missing details object', () => {
      const result = validateBankTransferDetails(null);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.MISSING_BANK_TRANSFER_DETAILS);
    });

    test('should reject invalid account number format', () => {
      const details = { ...validDetails, accountNumber: '123-456-789' };
      const result = validateBankTransferDetails(details);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.INVALID_ACCOUNT_NUMBER);
    });

    test('should reject account number too short', () => {
      const details = { ...validDetails, accountNumber: '1234567' };
      const result = validateBankTransferDetails(details);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.INVALID_ACCOUNT_NUMBER);
    });

    test('should reject account number too long', () => {
      const details = { ...validDetails, accountNumber: '123456789012345678901' };
      const result = validateBankTransferDetails(details);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.INVALID_ACCOUNT_NUMBER);
    });
  });

  describe('validateUserPermissions', () => {
    test('should validate active user', () => {
      const user = {
        status: 'active',
        kycStatus: 'verified'
      };
      const result = validateUserPermissions(user);
      expect(result.valid).toBe(true);
    });

    test('should reject suspended user', () => {
      const user = {
        status: 'suspended',
        kycStatus: 'verified'
      };
      const result = validateUserPermissions(user);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.ACCOUNT_SUSPENDED);
    });

    test('should reject user with rejected KYC', () => {
      const user = {
        status: 'active',
        kycStatus: 'rejected'
      };
      const result = validateUserPermissions(user);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.INVALID_USER_PERMISSIONS);
    });

    test('should reject null user', () => {
      const result = validateUserPermissions(null);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.USER_NOT_FOUND);
    });
  });

  describe('sanitizeWithdrawalRequest', () => {
    test('should sanitize mobile banking request', () => {
      const requestData = {
        method: 'MOBILE_BANKING',
        amount: '100.555',
        mobileBankingDetails: {
          accountHolderName: '  John<script>Doe  ',
          mobileNumber: '98-123-45678',
          provider: 'eSewa'
        }
      };

      const result = sanitizeWithdrawalRequest(requestData);
      
      expect(result.method).toBe('mobile_banking');
      expect(result.amount).toBe(100.56); // Rounded to 2 decimal places
      expect(result.mobileBankingDetails.accountHolderName).toBe('JohnscriptDoe');
      expect(result.mobileBankingDetails.mobileNumber).toBe('9812345678');
    });

    test('should sanitize bank transfer request', () => {
      const requestData = {
        method: 'bank_transfer',
        amount: 200,
        bankTransferDetails: {
          accountName: '  Jane<>Doe  ',
          accountNumber: 'ABC-123-456',
          bankName: 'Test & Bank'
        }
      };

      const result = sanitizeWithdrawalRequest(requestData);
      
      expect(result.bankTransferDetails.accountName).toBe('JaneDoe');
      expect(result.bankTransferDetails.accountNumber).toBe('ABC123456');
      expect(result.bankTransferDetails.bankName).toBe('Test & Bank');
    });
  });

  describe('checkDuplicateWithdrawal', () => {
    test('should pass when no duplicate found', async () => {
      Withdrawal.findOne.mockResolvedValue(null);
      Withdrawal.countDocuments.mockResolvedValue(0);

      const result = await checkDuplicateWithdrawal('userId', 100, 'mobile_banking');
      expect(result.valid).toBe(true);
    });

    test('should reject when duplicate found', async () => {
      const duplicateRequest = {
        _id: 'requestId',
        createdAt: new Date()
      };
      Withdrawal.findOne.mockResolvedValue(duplicateRequest);

      const result = await checkDuplicateWithdrawal('userId', 100, 'mobile_banking');
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.DUPLICATE_REQUEST);
    });

    test('should reject when suspicious activity detected', async () => {
      Withdrawal.findOne.mockResolvedValue(null);
      Withdrawal.countDocuments.mockResolvedValue(3);

      const result = await checkDuplicateWithdrawal('userId', 100, 'mobile_banking');
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.SUSPICIOUS_ACTIVITY);
    });
  });

  describe('checkPendingWithdrawalLimit', () => {
    test('should pass when under limit', async () => {
      Withdrawal.countDocuments.mockResolvedValue(2);

      const result = await checkPendingWithdrawalLimit('userId');
      expect(result.valid).toBe(true);
    });

    test('should reject when over limit', async () => {
      Withdrawal.countDocuments.mockResolvedValue(5);

      const result = await checkPendingWithdrawalLimit('userId');
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.TOO_MANY_REQUESTS);
    });
  });

  describe('performSecurityValidation', () => {
    const mockUser = {
      _id: 'userId',
      withdrawableBalance: 1000
    };

    test('should pass normal withdrawal', async () => {
      Withdrawal.find.mockResolvedValue([]);
      Withdrawal.countDocuments.mockResolvedValue(2);

      const result = await performSecurityValidation(mockUser, 100, 'mobile_banking');
      expect(result.valid).toBe(true);
    });

    test('should reject large withdrawal in 24 hours', async () => {
      const recentWithdrawals = [
        { amount: 300 },
        { amount: 200 }
      ];
      Withdrawal.find.mockResolvedValue(recentWithdrawals);
      Withdrawal.countDocuments.mockResolvedValue(2);

      const result = await performSecurityValidation(mockUser, 400, 'mobile_banking');
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.SUSPICIOUS_ACTIVITY);
    });

    test('should reject too many requests in 1 hour', async () => {
      Withdrawal.find.mockResolvedValue([]);
      Withdrawal.countDocuments.mockResolvedValue(5);

      const result = await performSecurityValidation(mockUser, 100, 'mobile_banking');
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.TOO_MANY_REQUESTS);
    });
  });

  describe('validateAgainstHistory', () => {
    const mockUser = {
      _id: 'userId'
    };

    test('should pass normal first withdrawal', async () => {
      Withdrawal.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      });

      const result = await validateAgainstHistory(mockUser, 5000);
      expect(result.valid).toBe(true);
    });

    test('should reject large first withdrawal', async () => {
      Withdrawal.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      });

      const result = await validateAgainstHistory(mockUser, 15000);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.SUSPICIOUS_ACTIVITY);
    });

    test('should reject unusually large withdrawal compared to history', async () => {
      const withdrawalHistory = [
        { amount: 100 },
        { amount: 150 },
        { amount: 200 }
      ];
      Withdrawal.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(withdrawalHistory)
        })
      });

      const result = await validateAgainstHistory(mockUser, 1000);
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.SUSPICIOUS_ACTIVITY);
    });
  });

  describe('checkRateLimit', () => {
    test('should pass when under rate limit', async () => {
      Withdrawal.countDocuments
        .mockResolvedValueOnce(5) // hourly count
        .mockResolvedValueOnce(1); // burst count

      const result = await checkRateLimit('userId', '127.0.0.1');
      expect(result.valid).toBe(true);
    });

    test('should reject when hourly limit exceeded', async () => {
      Withdrawal.countDocuments
        .mockResolvedValueOnce(10) // hourly count
        .mockResolvedValueOnce(1); // burst count

      const result = await checkRateLimit('userId', '127.0.0.1');
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.TOO_MANY_REQUESTS);
    });

    test('should reject when burst limit exceeded', async () => {
      Withdrawal.countDocuments
        .mockResolvedValueOnce(5) // hourly count
        .mockResolvedValueOnce(3); // burst count

      const result = await checkRateLimit('userId', '127.0.0.1');
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.TOO_MANY_REQUESTS);
    });
  });

  describe('createErrorResponse', () => {
    test('should create error response without details', () => {
      const response = createErrorResponse('TEST_ERROR', 'Test error message');
      
      expect(response.success).toBe(false);
      expect(response.error.code).toBe('TEST_ERROR');
      expect(response.error.message).toBe('Test error message');
      expect(response.error.details).toBeUndefined();
    });

    test('should create error response with details', () => {
      const details = { field: 'value' };
      const response = createErrorResponse('TEST_ERROR', 'Test error message', details);
      
      expect(response.success).toBe(false);
      expect(response.error.code).toBe('TEST_ERROR');
      expect(response.error.message).toBe('Test error message');
      expect(response.error.details).toEqual(details);
    });
  });

  describe('createSuccessResponse', () => {
    test('should create success response without data', () => {
      const response = createSuccessResponse('Success message');
      
      expect(response.success).toBe(true);
      expect(response.message).toBe('Success message');
      expect(response.data).toBeUndefined();
    });

    test('should create success response with data', () => {
      const data = { field: 'value' };
      const response = createSuccessResponse('Success message', data);
      
      expect(response.success).toBe(true);
      expect(response.message).toBe('Success message');
      expect(response.data).toEqual(data);
    });
  });

  describe('validateWithdrawalRequest - Integration', () => {
    const mockUser = {
      _id: 'userId',
      status: 'active',
      kycStatus: 'verified',
      withdrawableBalance: 1000,
      getAvailableBalance: jest.fn().mockReturnValue(800)
    };

    const validMobileBankingRequest = {
      method: 'mobile_banking',
      amount: 100,
      mobileBankingDetails: {
        accountHolderName: 'John Doe',
        mobileNumber: '9812345678',
        provider: 'eSewa'
      }
    };

    beforeEach(() => {
      // Reset all mocks
      Withdrawal.countDocuments.mockResolvedValue(0);
      Withdrawal.findOne.mockResolvedValue(null);
      Withdrawal.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      });
    });

    test('should validate complete valid request', async () => {
      const result = await validateWithdrawalRequest(validMobileBankingRequest, mockUser, '127.0.0.1');
      
      expect(result.valid).toBe(true);
      expect(result.sanitizedData.method).toBe('mobile_banking');
      expect(result.sanitizedData.amount).toBe(100);
      expect(result.sanitizedData.mobileBankingDetails).toBeDefined();
      expect(result.availableBalance).toBe(800);
    });

    test('should reject request from suspended user', async () => {
      const suspendedUser = { ...mockUser, status: 'suspended' };
      
      const result = await validateWithdrawalRequest(validMobileBankingRequest, suspendedUser, '127.0.0.1');
      
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.ACCOUNT_SUSPENDED);
    });

    test('should reject request exceeding rate limit', async () => {
      Withdrawal.countDocuments.mockResolvedValueOnce(10); // hourly limit exceeded
      
      const result = await validateWithdrawalRequest(validMobileBankingRequest, mockUser, '127.0.0.1');
      
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.TOO_MANY_REQUESTS);
    });

    test('should handle validation errors gracefully', async () => {
      Withdrawal.countDocuments.mockRejectedValue(new Error('Database error'));
      
      const result = await validateWithdrawalRequest(validMobileBankingRequest, mockUser, '127.0.0.1');
      
      expect(result.valid).toBe(false);
      expect(result.error.code).toBe(VALIDATION_ERRORS.INTERNAL_SERVER_ERROR);
    });
  });
});