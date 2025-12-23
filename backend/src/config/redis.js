const Redis = require('ioredis');

// Configuración de Redis para caching
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redis.on('ready', () => {
  console.log('🚀 Redis is ready to accept commands');
});

// Helper functions para caching
const cacheHelper = {
  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Parsed data or null
   */
  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Set cache data with expiration
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   * @param {number} ttl - Time to live in seconds (default: 5 minutes)
   */
  async set(key, value, ttl = 300) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  /**
   * Delete cache key
   * @param {string} key - Cache key
   */
  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  /**
   * Delete multiple keys by pattern
   * @param {string} pattern - Redis key pattern (e.g., 'restaurants:*')
   */
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  },

  /**
   * Cache middleware for Express routes
   * @param {number} ttl - Time to live in seconds
   */
  middleware(ttl = 300) {
    return async (req, res, next) => {
      // Solo cachear GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const key = `cache:${req.originalUrl || req.url}`;
      
      try {
        const cachedData = await this.get(key);
        
        if (cachedData) {
          return res.json(cachedData);
        }

        // Sobrescribir res.json para cachear la respuesta
        const originalJson = res.json.bind(res);
        res.json = (data) => {
          // Cachear solo respuestas exitosas
          if (res.statusCode === 200) {
            this.set(key, data, ttl);
          }
          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }
};

module.exports = { redis, cacheHelper };
