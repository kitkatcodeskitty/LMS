// Simple API response caching utility
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.maxAge = 5 * 60 * 1000; // 5 minutes default
  }

  set(key, data, maxAge = this.maxAge) {
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
  }

  clear() {
    this.cache.clear();
  }

  // Generate cache key from URL and params
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return `${url}?${sortedParams}`;
  }
}

export const apiCache = new ApiCache();

// Cache decorator for API functions
export const withCache = (apiFunction, cacheKey, maxAge = 5 * 60 * 1000) => {
  return async (...args) => {
    const key = typeof cacheKey === 'function' ? cacheKey(...args) : cacheKey;
    
    // Check cache first
    const cached = apiCache.get(key);
    if (cached) {
      return cached;
    }

    // Call API and cache result
    const result = await apiFunction(...args);
    apiCache.set(key, result, maxAge);
    
    return result;
  };
};
