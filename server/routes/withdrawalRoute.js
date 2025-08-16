import express from "express";
import {
  createWithdrawalRequest,
  getUserWithdrawalHistory,
  getAvailableBalance
} from "../controllers/withdrawalController.js";
import { verify } from "../auth.js";
import {
  withdrawalRateLimiter,
  withdrawalHistoryRateLimiter,
  balanceCheckRateLimiter,
  burstRateLimiter,
  compositeRateLimiter
} from "../middleware/rateLimiter.js";
import {
  asyncHandler,
  sanitizeInput,
  securityHeaders
} from "../middleware/errorHandler.js";

const withdrawalRouter = express.Router();

// Apply security headers to all withdrawal routes
withdrawalRouter.use(securityHeaders);

// Apply input sanitization to all routes
withdrawalRouter.use(sanitizeInput);

// User withdrawal endpoints with comprehensive rate limiting and error handling
withdrawalRouter.post('/request', 
  verify,
  compositeRateLimiter([burstRateLimiter, withdrawalRateLimiter]),
  asyncHandler(createWithdrawalRequest)
);

withdrawalRouter.get('/history', 
  verify,
  withdrawalHistoryRateLimiter,
  asyncHandler(getUserWithdrawalHistory)
);

withdrawalRouter.get('/available-balance', 
  verify,
  balanceCheckRateLimiter,
  asyncHandler(getAvailableBalance)
);

export default withdrawalRouter;