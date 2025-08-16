import {
  parseServerError,
  handleWithdrawalError,
  getToastType,
  showErrorToast,
  mapServerErrorsToFields,
  requiresUserAction,
  getSuggestedAction,
  logError,
  createErrorBoundaryProps,
  SERVER_ERROR_CODES,
  ERROR_MESSAGES,
  ERROR_SEVERITY,
  ERROR_SEVERITY_MAP
} from '../../utils/errorHandler';

import { vi } from 'vitest';

// Mock console methods for testing
const originalConsole = console;
beforeAll(() => {
  console.group = vi.fn();
  console.error = vi.fn();
  console.groupEnd = vi.fn();
});

afterAll(() => {
  console.group = originalConsole.group;
  console.error = originalConsole.error;
  console.groupEnd = originalConsole.groupEnd;
});

describe('Error Handler Utils', () => {
  describe('parseServerError', () => {
    test('should parse network error', () => {
      const networkError = { response: null };
      const result = parseServerError(networkError);
      
      expect(result.code).toBe('NETWORK_ERROR');
      expect(result.message).toContain('Network error');
      expect(result.severity).toBe(ERROR_SEVERITY.CRITICAL);
      expect(result.statusCode).toBe(500);
    });

    test('should parse server error with proper structure', () => {
      const serverError = {
        response: {
          status: 400,
          data: {
            error: {
              code: SERVER_ERROR_CODES.INVALID_AMOUNT,
              message: 'Invalid amount provided',
              details: { requestedAmount: 1000, availableBalance: 500 }
            }
          }
        }
      };

      const result = parseServerError(serverError);
      
      expect(result.code).toBe(SERVER_ERROR_CODES.INVALID_AMOUNT);
      expect(result.message).toBe('Invalid amount provided');
      expect(result.details).toEqual({ requestedAmount: 1000, availableBalance: 500 });
      expect(result.severity).toBe(ERROR_SEVERITY_MAP[SERVER_ERROR_CODES.INVALID_AMOUNT]);
      expect(result.statusCode).toBe(400);
      expect(result.userFriendlyMessage).toBe(ERROR_MESSAGES[SERVER_ERROR_CODES.INVALID_AMOUNT]);
    });

    test('should handle non-JSON response', () => {
      const serverError = {
        response: {
          status: 500,
          data: 'Internal Server Error'
        }
      };

      const result = parseServerError(serverError);
      
      expect(result.code).toBe(SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR);
      expect(result.statusCode).toBe(500);
      expect(result.message).toContain('Server error (500)');
    });

    test('should handle missing error structure', () => {
      const serverError = {
        response: {
          status: 400,
          data: {
            message: 'Simple error message'
          }
        }
      };

      const result = parseServerError(serverError);
      
      expect(result.code).toBe(SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('Simple error message');
      expect(result.statusCode).toBe(400);
    });
  });

  describe('handleWithdrawalError', () => {
    test('should enhance insufficient balance error', () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: {
              code: SERVER_ERROR_CODES.INSUFFICIENT_BALANCE,
              message: 'Insufficient balance',
              details: { availableBalance: 500 }
            }
          }
        }
      };

      const result = handleWithdrawalError(error);
      
      expect(result.userFriendlyMessage).toContain('You have 500 available');
    });

    test('should enhance duplicate request error', () => {
      const submittedTime = new Date('2023-01-01T10:30:00Z');
      const error = {
        response: {
          status: 409,
          data: {
            error: {
              code: SERVER_ERROR_CODES.DUPLICATE_REQUEST,
              message: 'Duplicate request',
              details: { submittedAt: submittedTime.toISOString() }
            }
          }
        }
      };

      const result = handleWithdrawalError(error);
      
      expect(result.userFriendlyMessage).toContain('submitted at');
    });

    test('should enhance too many requests error', () => {
      const error = {
        response: {
          status: 429,
          data: {
            error: {
              code: SERVER_ERROR_CODES.TOO_MANY_REQUESTS,
              message: 'Too many requests',
              details: { currentPendingCount: 5, maxAllowed: 5 }
            }
          }
        }
      };

      const result = handleWithdrawalError(error);
      
      expect(result.userFriendlyMessage).toContain('You have 5 pending requests');
      expect(result.userFriendlyMessage).toContain('Maximum allowed is 5');
    });

    test('should enhance validation error with details array', () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: {
              code: SERVER_ERROR_CODES.VALIDATION_ERROR,
              message: 'Validation failed',
              details: ['Field 1 is invalid', 'Field 2 is required']
            }
          }
        }
      };

      const result = handleWithdrawalError(error);
      
      expect(result.userFriendlyMessage).toBe('Field 1 is invalid Field 2 is required');
    });
  });

  describe('getToastType', () => {
    test('should return warning for low severity', () => {
      const result = getToastType(ERROR_SEVERITY.LOW);
      expect(result).toBe('warning');
    });

    test('should return error for medium severity', () => {
      const result = getToastType(ERROR_SEVERITY.MEDIUM);
      expect(result).toBe('error');
    });

    test('should return error for high severity', () => {
      const result = getToastType(ERROR_SEVERITY.HIGH);
      expect(result).toBe('error');
    });

    test('should return error for critical severity', () => {
      const result = getToastType(ERROR_SEVERITY.CRITICAL);
      expect(result).toBe('error');
    });

    test('should return error for unknown severity', () => {
      const result = getToastType('unknown');
      expect(result).toBe('error');
    });
  });

  describe('showErrorToast', () => {
    const mockToast = {
      warning: vi.fn(),
      error: vi.fn()
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('should show warning toast for low severity error', () => {
      const error = {
        message: 'Test error',
        severity: ERROR_SEVERITY.LOW,
        userFriendlyMessage: 'User friendly message'
      };

      showErrorToast(mockToast, error);
      
      expect(mockToast.warning).toHaveBeenCalledWith(
        'User friendly message',
        expect.objectContaining({
          position: 'top-right',
          autoClose: 5000
        })
      );
    });

    test('should show error toast for critical severity with longer duration', () => {
      const error = {
        message: 'Critical error',
        severity: ERROR_SEVERITY.CRITICAL,
        userFriendlyMessage: 'Critical user message'
      };

      showErrorToast(mockToast, error);
      
      expect(mockToast.error).toHaveBeenCalledWith(
        'Critical user message',
        expect.objectContaining({
          autoClose: 8000
        })
      );
    });

    test('should handle string error', () => {
      showErrorToast(mockToast, 'Simple error message');
      
      expect(mockToast.error).toHaveBeenCalledWith(
        'Simple error message',
        expect.any(Object)
      );
    });

    test('should use custom options', () => {
      const error = {
        message: 'Test error',
        severity: ERROR_SEVERITY.LOW,
        userFriendlyMessage: 'User message'
      };

      const customOptions = {
        position: 'bottom-left',
        autoClose: 3000
      };

      showErrorToast(mockToast, error, customOptions);
      
      expect(mockToast.warning).toHaveBeenCalledWith(
        'User message',
        expect.objectContaining({
          position: 'bottom-left',
          autoClose: 3000
        })
      );
    });
  });

  describe('mapServerErrorsToFields', () => {
    test('should map validation errors array to fields', () => {
      const error = {
        code: SERVER_ERROR_CODES.VALIDATION_ERROR,
        details: [
          'mobile number is invalid',
          'account number format is wrong',
          'account holder name is required',
          'bank name is too short',
          'amount is insufficient',
          'provider is not supported'
        ]
      };

      const result = mapServerErrorsToFields(error);
      
      expect(result.mobileNumber).toContain('mobile number');
      expect(result.accountNumber).toContain('account number');
      expect(result.accountHolderName).toContain('account holder');
      expect(result.bankName).toContain('bank name');
      expect(result.amount).toContain('amount');
      expect(result.provider).toContain('provider');
    });

    test('should map specific error codes to fields', () => {
      const testCases = [
        { code: SERVER_ERROR_CODES.INVALID_MOBILE_NUMBER, expectedField: 'mobileNumber' },
        { code: SERVER_ERROR_CODES.INVALID_ACCOUNT_NUMBER, expectedField: 'accountNumber' },
        { code: SERVER_ERROR_CODES.INVALID_ACCOUNT_HOLDER_NAME, expectedField: 'accountHolderName' },
        { code: SERVER_ERROR_CODES.INVALID_ACCOUNT_NAME, expectedField: 'accountName' },
        { code: SERVER_ERROR_CODES.INVALID_BANK_NAME, expectedField: 'bankName' },
        { code: SERVER_ERROR_CODES.INVALID_AMOUNT, expectedField: 'amount' },
        { code: SERVER_ERROR_CODES.INSUFFICIENT_BALANCE, expectedField: 'amount' },
        { code: SERVER_ERROR_CODES.INVALID_PROVIDER, expectedField: 'provider' }
      ];

      testCases.forEach(({ code, expectedField }) => {
        const error = {
          code,
          message: 'Test error message'
        };

        const result = mapServerErrorsToFields(error);
        expect(result[expectedField]).toBe('Test error message');
      });
    });

    test('should return empty object for error without details', () => {
      const error = {
        code: SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'Server error'
      };

      const result = mapServerErrorsToFields(error);
      expect(result).toEqual({});
    });
  });

  describe('requiresUserAction', () => {
    test('should return true for errors requiring user action', () => {
      const actionRequiredCodes = [
        SERVER_ERROR_CODES.ACCOUNT_SUSPENDED,
        SERVER_ERROR_CODES.INVALID_USER_PERMISSIONS,
        SERVER_ERROR_CODES.UNAUTHORIZED_ACCESS,
        SERVER_ERROR_CODES.SUSPICIOUS_ACTIVITY
      ];

      actionRequiredCodes.forEach(code => {
        const result = requiresUserAction({ code });
        expect(result).toBe(true);
      });
    });

    test('should return false for errors not requiring user action', () => {
      const noActionCodes = [
        SERVER_ERROR_CODES.INVALID_AMOUNT,
        SERVER_ERROR_CODES.VALIDATION_ERROR,
        SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR
      ];

      noActionCodes.forEach(code => {
        const result = requiresUserAction({ code });
        expect(result).toBe(false);
      });
    });
  });

  describe('getSuggestedAction', () => {
    test('should return appropriate suggestions for different error codes', () => {
      const testCases = [
        {
          code: SERVER_ERROR_CODES.ACCOUNT_SUSPENDED,
          expectedAction: 'contact our support team'
        },
        {
          code: SERVER_ERROR_CODES.INVALID_USER_PERMISSIONS,
          expectedAction: 'complete your KYC verification'
        },
        {
          code: SERVER_ERROR_CODES.UNAUTHORIZED_ACCESS,
          expectedAction: 'log out and log back in'
        },
        {
          code: SERVER_ERROR_CODES.SUSPICIOUS_ACTIVITY,
          expectedAction: 'contact our support team'
        },
        {
          code: SERVER_ERROR_CODES.TOO_MANY_REQUESTS,
          expectedAction: 'wait for your pending requests'
        },
        {
          code: SERVER_ERROR_CODES.DUPLICATE_REQUEST,
          expectedAction: 'wait a few minutes'
        },
        {
          code: SERVER_ERROR_CODES.INSUFFICIENT_BALANCE,
          expectedAction: 'check your available balance'
        }
      ];

      testCases.forEach(({ code, expectedAction }) => {
        const result = getSuggestedAction({ code });
        expect(result).toContain(expectedAction);
      });
    });

    test('should return null for errors without specific actions', () => {
      const result = getSuggestedAction({ code: SERVER_ERROR_CODES.VALIDATION_ERROR });
      expect(result).toBeNull();
    });
  });

  describe('logError', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      vi.clearAllMocks();
    });

    test('should log error in development environment', () => {
      process.env.NODE_ENV = 'development';
      
      const error = {
        code: 'TEST_ERROR',
        message: 'Test message',
        details: { field: 'value' },
        severity: ERROR_SEVERITY.HIGH,
        statusCode: 400
      };

      logError(error, 'Test Context');

      expect(console.group).toHaveBeenCalledWith('🚨 Withdrawal Error - Test Context');
      expect(console.error).toHaveBeenCalledWith('Error Code:', 'TEST_ERROR');
      expect(console.error).toHaveBeenCalledWith('Message:', 'Test message');
      expect(console.error).toHaveBeenCalledWith('Details:', { field: 'value' });
      expect(console.error).toHaveBeenCalledWith('Severity:', ERROR_SEVERITY.HIGH);
      expect(console.error).toHaveBeenCalledWith('Status Code:', 400);
      expect(console.groupEnd).toHaveBeenCalled();
    });

    test('should not log error in production environment', () => {
      process.env.NODE_ENV = 'production';
      
      const error = {
        code: 'TEST_ERROR',
        message: 'Test message'
      };

      logError(error, 'Test Context');

      expect(console.group).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
      expect(console.groupEnd).not.toHaveBeenCalled();
    });
  });

  describe('createErrorBoundaryProps', () => {
    test('should create props with all error information', () => {
      const error = {
        code: SERVER_ERROR_CODES.ACCOUNT_SUSPENDED,
        message: 'Account suspended',
        userFriendlyMessage: 'Your account is suspended',
        severity: ERROR_SEVERITY.CRITICAL
      };

      const result = createErrorBoundaryProps(error);

      expect(result.title).toBe('Something went wrong');
      expect(result.message).toBe('Your account is suspended');
      expect(result.action).toContain('contact our support team');
      expect(result.severity).toBe(ERROR_SEVERITY.CRITICAL);
    });

    test('should handle error without user friendly message', () => {
      const error = {
        code: 'TEST_ERROR',
        message: 'Technical error message'
      };

      const result = createErrorBoundaryProps(error);

      expect(result.message).toBe('Technical error message');
      expect(result.severity).toBe(ERROR_SEVERITY.MEDIUM);
    });

    test('should handle minimal error object', () => {
      const error = {};

      const result = createErrorBoundaryProps(error);

      expect(result.title).toBe('Something went wrong');
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.severity).toBe(ERROR_SEVERITY.MEDIUM);
    });
  });
});