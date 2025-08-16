/**
 * Rate limiting middleware for withdrawal endpoints
 */

import { createErrorResponse, VALIDATION_ERRORS } from '../utils/withdrawalValidation.js';

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map();

/**
 * Clean up expired entries from rate limit store
 */
const cleanupExpiredEntries = () => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }
};

// Clean up expired entries every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Create rate limiter middleware
 * @param {Object} options - Rate limiting options
 * @returns {Function} Middleware function
 */
export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 60 * 1000, // 1 hour
    maxRequests = 10,
    keyGenerator = (req) => req.ip,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Too many requests from this IP, please try again later.'
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Get or create rate limit data for this key
    let rateLimitData = rateLimitStore.get(key);
    
    if (!rateLimitData || rateLimitData.resetTime <= now) {
      // Create new rate limit window
      rateLimitData = {
        count: 0,
        resetTime: now + windowMs,
        firstRequest: now
      };
      rateLimitStore.set(key, rateLimitData);
    }

    // Check if limit exceeded
    if (rateLimitData.count >= maxRequests) {
      const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000);
      
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString(),
        'Retry-After': retryAfter
      });

      return res.status(429).json(createErrorResponse(
        VALIDATION_ERRORS.TOO_MANY_REQUESTS,
        message,
        {
          limit: maxRequests,
          remaining: 0,
          resetTime: rateLimitData.resetTime,
          retryAfter
        }
      ));
    }

    // Increment request count
    rateLimitData.count++;

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - rateLimitData.count),
      'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString()
    });

    // Add rate limit info to request for logging
    req.rateLimit = {
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - rateLimitData.count),
      resetTime: rateLimitData.resetTime,
      used: rateLimitData.count
    };

    // Handle response to potentially skip counting
    const originalSend = res.send;
    res.send = function(body) {
      const statusCode = res.statusCode;
      
      // Skip counting based on options
      if ((skipSuccessfulRequests && statusCode < 400) ||
          (skipFailedRequests && statusCode >= 400)) {
        rateLimitData.count--;
      }
      
      return originalSend.call(this, body);
    };

    next();
  };
};


export const withdrawalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes (was 1 hour)
  maxRequests: 50, // allow 50 requests per window (was 10)
  message: 'Too many withdrawal requests. Please wait before submitting more requests.',
  keyGenerator: (req) => {
    // Use user ID if available, otherwise IP
    return req.user?.id || req.ip;
  }
});


export const withdrawalHistoryRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 50,
  message: 'Too many history requests. Please wait before requesting more data.',
  keyGenerator: (req) => req.user?.id || req.ip,
  skipSuccessfulRequests: true // Don't count successful requests
});

export const balanceCheckRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 30,
  message: 'Too many balance check requests. Please wait before checking again.',
  keyGenerator: (req) => req.user?.id || req.ip,
  skipSuccessfulRequests: true
});


export const burstRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute (was 5 minutes)
  maxRequests: 10, // allow 10 requests per minute (was 3 per 5 min)
  message: 'Too many requests in a short time. Please wait a minute before trying again.',
  keyGenerator: (req) => req.user?.id || req.ip
});

/**
 * Admin rate limiter (higher limits for admin operations)
 */
export const adminRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100,
  message: 'Admin rate limit exceeded. Please contact system administrator.',
  keyGenerator: (req) => req.user?.id || req.ip
});

/**
 * IP-based rate limiter for suspicious activity detection
 */
export const ipRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50,
  message: 'Too many requests from this IP address. Please try again later.',
  keyGenerator: (req) => req.ip
});

/**
 * Composite rate limiter that applies multiple limits
 * @param {Array} limiters - Array of rate limiter middlewares
 * @returns {Function} Composite middleware function
 */
export const compositeRateLimiter = (limiters) => {
  return async (req, res, next) => {
    for (const limiter of limiters) {
      await new Promise((resolve, reject) => {
        limiter(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      }).catch((err) => {
        throw err;
      });
    }
    next();
  };
};

/**
 * Dynamic rate limiter based on user behavior
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const dynamicRateLimiter = (req, res, next) => {
  const userId = req.user?.id;
  const userKey = `user:${userId}`;
  
  // Get user's recent activity
  const userActivity = rateLimitStore.get(userKey) || { 
    suspiciousActivity: 0, 
    lastSuspiciousTime: 0 
  };
  
  // Determine rate limit based on user behavior
  let maxRequests = 10; // Default
  let windowMs = 60 * 60 * 1000; // 1 hour
  
  // Reduce limits for users with suspicious activity
  if (userActivity.suspiciousActivity > 3) {
    maxRequests = 3;
    windowMs = 2 * 60 * 60 * 1000; // 2 hours
  } else if (userActivity.suspiciousActivity > 1) {
    maxRequests = 5;
    windowMs = 90 * 60 * 1000; // 1.5 hours
  }
  
  // Apply dynamic rate limiter
  const dynamicLimiter = createRateLimiter({
    windowMs,
    maxRequests,
    message: `Rate limit adjusted based on account activity. Limit: ${maxRequests} requests per ${Math.ceil(windowMs / 60000)} minutes.`,
    keyGenerator: (req) => userId || req.ip
  });
  
  dynamicLimiter(req, res, next);
};

/**
 * Mark suspicious activity for a user
 * @param {string} userId - User ID
 * @param {string} reason - Reason for marking as suspicious
 */
export const markSuspiciousActivity = (userId, reason = 'Unknown') => {
  if (!userId) return;
  
  const userKey = `user:${userId}`;
  const userActivity = rateLimitStore.get(userKey) || { 
    suspiciousActivity: 0, 
    lastSuspiciousTime: 0,
    reasons: []
  };
  
  userActivity.suspiciousActivity++;
  userActivity.lastSuspiciousTime = Date.now();
  userActivity.reasons.push({
    reason,
    timestamp: Date.now()
  });
  
  // Keep only last 10 reasons
  if (userActivity.reasons.length > 10) {
    userActivity.reasons = userActivity.reasons.slice(-10);
  }
  
  rateLimitStore.set(userKey, userActivity);
  
  // Log suspicious activity
  console.warn(`🚨 Suspicious Activity - User: ${userId}, Reason: ${reason}, Count: ${userActivity.suspiciousActivity}`);
};

/**
 * Clear suspicious activity for a user (admin function)
 * @param {string} userId - User ID
 */
export const clearSuspiciousActivity = (userId) => {
  if (!userId) return;
  
  const userKey = `user:${userId}`;
  rateLimitStore.delete(userKey);
  
  console.log(`✅ Cleared suspicious activity for user: ${userId}`);
};

/**
 * Get rate limit statistics
 * @returns {Object} Rate limit statistics
 */
export const getRateLimitStats = () => {
  const stats = {
    totalKeys: rateLimitStore.size,
    activeWindows: 0,
    expiredWindows: 0,
    suspiciousUsers: 0
  };
  
  const now = Date.now();
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime > now) {
      stats.activeWindows++;
    } else {
      stats.expiredWindows++;
    }
    
    if (key.startsWith('user:') && data.suspiciousActivity > 0) {
      stats.suspiciousUsers++;
    }
  }
  
  return stats;
};