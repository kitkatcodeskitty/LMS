// Performance optimization middleware
import compression from 'compression';

export const performanceMiddleware = (app) => {
  // Enable gzip compression
  app.use(compression());
  
  // Add performance headers
  app.use((req, res, next) => {
    // Cache static assets for 1 hour
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
    
    // Cache API responses for 5 minutes
    if (req.url.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'private, max-age=300');
    }
    
    // Add timing header
    res.setHeader('X-Response-Time', '0ms');
    
    const start = Date.now();
    
    // Override the end method to capture response time
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const duration = Date.now() - start;
      // Only set header if response hasn't been sent yet
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${duration}ms`);
      }
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  });
};

// Rate limiting for API endpoints
export const rateLimiter = (req, res, next) => {
  // Simple rate limiting - can be enhanced with Redis
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!req.app.locals.rateLimit) {
    req.app.locals.rateLimit = new Map();
  }
  
  const rateLimit = req.app.locals.rateLimit;
  const clientData = rateLimit.get(clientIP) || { count: 0, resetTime: now + 60000 };
  
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + 60000;
  } else {
    clientData.count++;
  }
  
  if (clientData.count > 100) { // 100 requests per minute
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }
  
  rateLimit.set(clientIP, clientData);
  next();
};
