/**
 * Comprehensive error handling middleware for withdrawal system
 */

import { createErrorResponse, VALIDATION_ERRORS } from '../utils/withdrawalValidation.js';

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const globalErrorHandler = (err, req, res, next) => {
  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    // Silent error logging in production
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation errors
    const validationErrors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json(createErrorResponse(
      VALIDATION_ERRORS.VALIDATION_ERROR,
      'Validation failed',
      validationErrors
    ));
  }

  if (err.name === 'CastError') {
    // MongoDB cast errors (invalid ObjectId, etc.)
    return res.status(400).json(createErrorResponse(
      VALIDATION_ERRORS.VALIDATION_ERROR,
      'Invalid data format',
      { field: err.path, value: err.value }
    ));
  }

  if (err.code === 11000) {
    // MongoDB duplicate key errors
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json(createErrorResponse(
      VALIDATION_ERRORS.DUPLICATE_REQUEST,
      `Duplicate ${field} value`,
      { field, value: err.keyValue[field] }
    ));
  }

  if (err.name === 'JsonWebTokenError') {
    // JWT errors
    return res.status(401).json(createErrorResponse(
      VALIDATION_ERRORS.UNAUTHORIZED_ACCESS,
      'Invalid authentication token'
    ));
  }

  if (err.name === 'TokenExpiredError') {
    // JWT expiration errors
    return res.status(401).json(createErrorResponse(
      VALIDATION_ERRORS.UNAUTHORIZED_ACCESS,
      'Authentication token has expired'
    ));
  }

  // Handle rate limiting errors
  if (err.status === 429) {
    return res.status(429).json(createErrorResponse(
      VALIDATION_ERRORS.TOO_MANY_REQUESTS,
      'Too many requests. Please try again later.',
      { retryAfter: err.retryAfter }
    ));
  }

  // Default server error
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message;

  res.status(statusCode).json(createErrorResponse(
    VALIDATION_ERRORS.INTERNAL_SERVER_ERROR,
    message,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  ));
};

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async error wrapper to catch async errors in route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Request validation middleware
 * @param {Object} schema - Validation schema
 * @returns {Function} Middleware function
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body
      if (schema.body) {
        const { error, value } = schema.body.validate(req.body, { abortEarly: false });
        if (error) {
          const validationErrors = error.details.map(detail => detail.message);
          return res.status(400).json(createErrorResponse(
            VALIDATION_ERRORS.VALIDATION_ERROR,
            'Request validation failed',
            validationErrors
          ));
        }
        req.body = value; // Use sanitized values
      }

      // Validate query parameters
      if (schema.query) {
        const { error, value } = schema.query.validate(req.query, { abortEarly: false });
        if (error) {
          const validationErrors = error.details.map(detail => detail.message);
          return res.status(400).json(createErrorResponse(
            VALIDATION_ERRORS.VALIDATION_ERROR,
            'Query validation failed',
            validationErrors
          ));
        }
        req.query = value; // Use sanitized values
      }

      // Validate URL parameters
      if (schema.params) {
        const { error, value } = schema.params.validate(req.params, { abortEarly: false });
        if (error) {
          const validationErrors = error.details.map(detail => detail.message);
          return res.status(400).json(createErrorResponse(
            VALIDATION_ERRORS.VALIDATION_ERROR,
            'Parameter validation failed',
            validationErrors
          ));
        }
        req.params = value; // Use sanitized values
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Security headers middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const securityHeaders = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
};

/**
 * Request logging middleware for debugging
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requestLogger = (req, res, next) => {
  next();
};

/**
 * Rate limiting error handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const rateLimitHandler = (req, res, next) => {
  return res.status(429).json(createErrorResponse(
    VALIDATION_ERRORS.TOO_MANY_REQUESTS,
    'Too many requests from this IP. Please try again later.',
    {
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining
    }
  ));
};

/**
 * Input sanitization middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const sanitizeInput = (req, res, next) => {
  // Recursively sanitize object properties
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/[<>\"'&]/g, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

    // Only sanitize if writable (avoid mutating read-only properties)
    try {
      if (req.body && typeof req.body === 'object' && Object.getPrototypeOf(req.body) === Object.prototype) {
        req.body = sanitizeObject(req.body);
      }
      if (req.query && typeof req.query === 'object' && Object.getPrototypeOf(req.query) === Object.prototype) {
        req.query = sanitizeObject(req.query);
      }
    } catch (err) {
      // If sanitize fails, continue silently
    }

  next();
};

/**
 * CORS error handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const corsErrorHandler = (err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json(createErrorResponse(
      VALIDATION_ERRORS.UNAUTHORIZED_ACCESS,
      'CORS policy violation'
    ));
  }
  next(err);
};

/**
 * Database connection error handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const dbErrorHandler = (err, req, res, next) => {
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    return res.status(503).json(createErrorResponse(
      VALIDATION_ERRORS.INTERNAL_SERVER_ERROR,
      'Database service temporarily unavailable'
    ));
  }
  next(err);
};