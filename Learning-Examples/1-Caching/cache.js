// Simple in-memory cache implementation
const cache = new Map();

/**
 * Cache middleware for Express.js
 * @param {number} duration - Cache duration in seconds (default: 300 = 5 minutes)
 * @returns {Function} Express middleware function
 */
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);

    // Check if cached data exists and hasn't expired
    if (cached && Date.now() - cached.timestamp < duration * 1000) {
      console.log("Cache hit for:", key);
      return res.json(cached.data);
    }

    // Store original res.json method
    const originalJson = res.json;

    // Override res.json to cache responses
    res.json = function (data) {
      // Cache the response
      cache.set(key, {
        data: data,
        timestamp: Date.now(),
      });

      // Call original json method
      originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Clear cache for specific routes
 * @param {string} pattern - Pattern to match cache keys
 */
const clearCache = (pattern) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      console.log("Cache cleared for:", key);
    }
  }
};

/**
 * Clear all cache
 */
const clearAllCache = () => {
  cache.clear();
  console.log("All cache cleared");
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearAllCache,
  getCacheStats,
};
