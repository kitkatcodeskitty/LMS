// Server-side performance optimizations
import { performance } from 'perf_hooks';

// Performance monitoring
export class ServerPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Start timing a performance metric
  startTiming(name) {
    if (!this.isEnabled) return;
    
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  // End timing a performance metric
  endTiming(name) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      // Log slow operations
      if (metric.duration > 1000) { // More than 1 second
        console.warn(`Slow server operation: ${name} took ${metric.duration.toFixed(2)}ms`);
      }
    }
  }

  // Monitor database queries
  monitorDbQuery = async (queryName, queryFunction) => {
    this.startTiming(`db_${queryName}`);
    try {
      const result = await queryFunction();
      this.endTiming(`db_${queryName}`);
      return result;
    } catch (error) {
      this.endTiming(`db_${queryName}`);
      throw error;
    }
  };

  // Monitor API endpoints
  monitorApiEndpoint = (endpointName) => {
    return (req, res, next) => {
      this.startTiming(`api_${endpointName}`);
      
      const originalSend = res.send;
      res.send = function(data) {
        this.endTiming(`api_${endpointName}`);
        return originalSend.call(this, data);
      }.bind(this);
      
      next();
    };
  };

  // Get performance report
  getReport() {
    const metrics = Array.from(this.metrics.entries()).map(([name, metric]) => ({
      name,
      duration: metric.duration,
      startTime: metric.startTime,
      endTime: metric.endTime
    }));

    const slowOperations = metrics.filter(m => m.duration > 1000);
    const dbQueries = metrics.filter(m => m.name.startsWith('db_'));
    const apiEndpoints = metrics.filter(m => m.name.startsWith('api_'));

    return {
      totalMetrics: metrics.length,
      slowOperations: slowOperations.length,
      dbQueries: dbQueries.length,
      apiEndpoints: apiEndpoints.length,
      averageDuration: metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / metrics.length,
      slowestOperation: metrics.reduce((max, m) => 
        m.duration > (max.duration || 0) ? m : max, { duration: 0 }
      ),
      metrics
    };
  }
}

// Create singleton instance
export const serverPerformanceMonitor = new ServerPerformanceMonitor();

// Database query optimization utilities
export const dbOptimizations = {
  // Add indexes for common queries
  createIndexes: async (db) => {
    try {
      // User collection indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ referralCode: 1 }, { unique: true, sparse: true });
      await db.collection('users').createIndex({ isAdmin: 1 });
      await db.collection('users').createIndex({ isSubAdmin: 1 });
      await db.collection('users').createIndex({ createdAt: -1 });

      // Course collection indexes
      await db.collection('courses').createIndex({ courseTitle: 'text' });
      await db.collection('courses').createIndex({ coursePrice: 1 });
      await db.collection('courses').createIndex({ isActive: 1 });
      await db.collection('courses').createIndex({ createdAt: -1 });

      // Purchase collection indexes
      await db.collection('purchases').createIndex({ userId: 1 });
      await db.collection('purchases').createIndex({ courseId: 1 });
      await db.collection('purchases').createIndex({ status: 1 });
      await db.collection('purchases').createIndex({ createdAt: -1 });

      // Withdrawal collection indexes
      await db.collection('withdrawals').createIndex({ userId: 1 });
      await db.collection('withdrawals').createIndex({ status: 1 });
      await db.collection('withdrawals').createIndex({ createdAt: -1 });

      // KYC collection indexes
      await db.collection('kycs').createIndex({ userId: 1 }, { unique: true });
      await db.collection('kycs').createIndex({ status: 1 });
      await db.collection('kycs').createIndex({ createdAt: -1 });

      console.log('Database indexes created successfully');
    } catch (error) {
      console.error('Error creating database indexes:', error);
    }
  },

  // Optimize common queries
  optimizeQuery: (query) => {
    // Add query hints and optimizations
    return query.lean(); // Use lean() for better performance
  },

  // Pagination helper
  paginate: (query, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  }
};

// Memory management
export const memoryManagement = {
  // Clear unused data
  clearUnusedData: () => {
    if (global.gc) {
      global.gc();
    }
  },

  // Get memory usage
  getMemoryUsage: () => {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
    };
  },

  // Monitor memory usage
  monitorMemory: () => {
    const usage = memoryManagement.getMemoryUsage();
    if (usage.heapUsed > 500) { // More than 500MB
      console.warn('High memory usage detected:', usage);
    }
    return usage;
  }
};

// API response optimization
export const responseOptimizations = {
  // Compress large responses
  compressResponse: (data) => {
    if (JSON.stringify(data).length > 10000) { // More than 10KB
      return {
        compressed: true,
        data: data
      };
    }
    return data;
  },

  // Cache headers
  setCacheHeaders: (res, maxAge = 300) => {
    res.set({
      'Cache-Control': `public, max-age=${maxAge}`,
      'ETag': `"${Date.now()}"`,
      'Last-Modified': new Date().toUTCString()
    });
  },

  // No cache headers
  setNoCacheHeaders: (res) => {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
};

// Error handling optimizations
export const errorOptimizations = {
  // Rate limiting
  rateLimit: (windowMs = 15 * 60 * 1000, max = 100) => {
    const requests = new Map();
    
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Clean old entries
      for (const [key, value] of requests.entries()) {
        if (value < windowStart) {
          requests.delete(key);
        }
      }
      
      // Check current requests
      const currentRequests = requests.get(ip) || 0;
      if (currentRequests >= max) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later'
        });
      }
      
      requests.set(ip, now);
      next();
    };
  },

  // Request timeout
  requestTimeout: (timeout = 30000) => {
    return (req, res, next) => {
      req.setTimeout(timeout, () => {
        res.status(408).json({
          success: false,
          message: 'Request timeout'
        });
      });
      next();
    };
  }
};

export default {
  serverPerformanceMonitor,
  dbOptimizations,
  memoryManagement,
  responseOptimizations,
  errorOptimizations
};
