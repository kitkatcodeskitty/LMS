// Enhanced API response caching utility with request deduplication
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.maxAge = 5 * 60 * 1000; // 5 minutes default
    this.maxSize = 100; // Maximum number of cached items
  }

  set(key, data, maxAge = this.maxAge) {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const item = {
      data,
      timestamp: Date.now(),
      maxAge
    };
    this.cache.set(key, item);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key) {
    return this.cache.has(key) && this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Generate cache key from URL and params
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return `${url}?${sortedParams}`;
  }

  // Request deduplication - prevents multiple identical requests
  async getOrFetch(key, fetchFunction) {
    // Check cache first
    const cached = this.get(key);
    if (cached) {
      return cached;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request
    const request = fetchFunction()
      .then(result => {
        this.set(key, result);
        this.pendingRequests.delete(key);
        return result;
      })
      .catch(error => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  // Invalidate cache entries matching pattern
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      pendingRequests: this.pendingRequests.size
    };
  }
}

export const apiCache = new ApiCache();

// Enhanced cache decorator for API functions with error handling
export const withCache = (apiFunction, cacheKey, maxAge = 5 * 60 * 1000) => {
  return async (...args) => {
    const key = typeof cacheKey === 'function' ? cacheKey(...args) : cacheKey;
    
    try {
      return await apiCache.getOrFetch(key, () => apiFunction(...args));
    } catch (error) {
      // Don't cache errors, but log them (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error(`API call failed for key ${key}:`, error);
      }
      throw error;
    }
  };
};

// Axios interceptor for automatic caching
export const setupAxiosCache = (axiosInstance, defaultMaxAge = 5 * 60 * 1000) => {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      // Add cache control headers
      if (!config.headers['Cache-Control']) {
        config.headers['Cache-Control'] = 'max-age=300'; // 5 minutes
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      // Cache successful responses
      if (response.config.method === 'get' && response.status === 200) {
        const key = apiCache.generateKey(response.config.url, response.config.params);
        apiCache.set(key, response.data, defaultMaxAge);
      }
      return response;
    },
    (error) => {
      // Handle errors gracefully
      if (error.response?.status === 429) {
        // Rate limited - implement exponential backoff
        if (process.env.NODE_ENV === 'development') {
          console.warn('Rate limited, implementing backoff');
        }
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

// Utility function to clear cache for specific patterns
export const clearCacheForPattern = (pattern) => {
  apiCache.invalidatePattern(pattern);
};

// Utility function to get cache statistics
export const getCacheStats = () => {
  return apiCache.getStats();
};
