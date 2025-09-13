// Production optimizations and utilities
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// Disable console logs in production
if (isProduction) {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// Performance monitoring (only in development)
export const performanceConfig = {
  enabled: isDevelopment,
  logSlowOperations: isDevelopment,
  logSlowRenders: isDevelopment,
  logApiCalls: isDevelopment,
};

// Cache configuration
export const cacheConfig = {
  defaultMaxAge: isProduction ? 300000 : 60000, // 5 minutes in production, 1 minute in dev
  maxCacheSize: isProduction ? 100 : 50,
  enableRequestDeduplication: true,
};

// Bundle optimization
export const bundleConfig = {
  enableCodeSplitting: true,
  enableTreeShaking: true,
  enableMinification: isProduction,
  enableSourceMaps: isDevelopment,
};

// API configuration
export const apiConfig = {
  timeout: isProduction ? 10000 : 5000,
  retryAttempts: isProduction ? 3 : 1,
  enableCaching: true,
  enableRequestDeduplication: true,
};

// Image optimization
export const imageConfig = {
  enableLazyLoading: true,
  enableWebP: true,
  quality: isProduction ? 80 : 90,
  enableProgressiveLoading: true,
};

// Error handling
export const errorConfig = {
  enableErrorReporting: isProduction,
  enableErrorBoundaries: true,
  logErrorsToConsole: isDevelopment,
  enableRetryMechanisms: isProduction,
};

// Development helpers
export const devHelpers = {
  log: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[DEV] ${message}`, ...args);
    }
  },
  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(`[DEV] ${message}`, ...args);
    }
  },
  error: (message, ...args) => {
    if (isDevelopment) {
      console.error(`[DEV] ${message}`, ...args);
    }
  },
};

// Performance utilities
export const performanceUtils = {
  measureTime: (name, fn) => {
    if (!performanceConfig.enabled) return fn();
    
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (end - start > 100) {
      devHelpers.warn(`Slow operation: ${name} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  },
  
  measureAsync: async (name, fn) => {
    if (!performanceConfig.enabled) return await fn();
    
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    if (end - start > 100) {
      devHelpers.warn(`Slow async operation: ${name} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  },
};

// Memory management
export const memoryUtils = {
  clearCache: () => {
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  },
  
  getMemoryUsage: () => {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }
    return null;
  },
};

export default {
  isProduction,
  isDevelopment,
  performanceConfig,
  cacheConfig,
  bundleConfig,
  apiConfig,
  imageConfig,
  errorConfig,
  devHelpers,
  performanceUtils,
  memoryUtils,
};
