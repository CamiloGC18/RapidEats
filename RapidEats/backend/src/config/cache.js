/**
 * Configuración de Cache con Redis
 * Estrategias de caching para optimizar performance
 */

const Redis = require('ioredis');

// Cliente Redis
let redisClient = null;

// Inicializar Redis
const initRedis = () => {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
  }

  return redisClient;
};

/**
 * Middleware de cache para Express
 */
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const redis = initRedis();
      const key = `cache:${req.originalUrl}`;
      
      // Buscar en cache
      const cachedData = await redis.get(key);
      
      if (cachedData) {
        console.log(`✅ Cache hit: ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      // Si no está en cache, continuar y cachear la respuesta
      console.log(`❌ Cache miss: ${key}`);
      
      // Guardar la función send original
      const originalSend = res.json.bind(res);
      
      // Override res.json
      res.json = (body) => {
        // Cachear la respuesta
        redis.setex(key, duration, JSON.stringify(body)).catch(err => {
          console.error('Error caching data:', err);
        });
        
        // Enviar respuesta original
        return originalSend(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Cache helper functions
 */
const cache = {
  /**
   * Obtener valor del cache
   */
  get: async (key) => {
    try {
      const redis = initRedis();
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Guardar en cache con TTL
   */
  set: async (key, value, ttl = 300) => {
    try {
      const redis = initRedis();
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  /**
   * Eliminar del cache
   */
  delete: async (key) => {
    try {
      const redis = initRedis();
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  /**
   * Eliminar múltiples keys que coincidan con un patrón
   */
  deletePattern: async (pattern) => {
    try {
      const redis = initRedis();
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`🗑️  Deleted ${keys.length} cache keys matching: ${pattern}`);
      }
      
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  },

  /**
   * Incrementar contador
   */
  increment: async (key, amount = 1) => {
    try {
      const redis = initRedis();
      return await redis.incrby(key, amount);
    } catch (error) {
      console.error('Cache increment error:', error);
      return null;
    }
  },

  /**
   * Obtener TTL de una key
   */
  getTTL: async (key) => {
    try {
      const redis = initRedis();
      return await redis.ttl(key);
    } catch (error) {
      console.error('Cache getTTL error:', error);
      return null;
    }
  },

  /**
   * Verificar si existe una key
   */
  exists: async (key) => {
    try {
      const redis = initRedis();
      return await redis.exists(key) === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }
};

/**
 * Estrategias de invalidación de cache
 */
const cacheInvalidation = {
  /**
   * Invalidar cache de restaurantes
   */
  restaurants: async () => {
    await cache.deletePattern('cache:/api/restaurants*');
  },

  /**
   * Invalidar cache de un restaurante específico
   */
  restaurant: async (restaurantId) => {
    await cache.deletePattern(`cache:/api/restaurants/${restaurantId}*`);
    await cache.deletePattern('cache:/api/restaurants*');
  },

  /**
   * Invalidar cache de productos
   */
  products: async (restaurantId) => {
    await cache.deletePattern(`cache:/api/restaurants/${restaurantId}/menu*`);
  },

  /**
   * Invalidar cache de órdenes de un usuario
   */
  userOrders: async (userId) => {
    await cache.deletePattern(`cache:/api/orders*user=${userId}*`);
  },

  /**
   * Invalidar todo el cache
   */
  all: async () => {
    await cache.deletePattern('cache:*');
  }
};

/**
 * Cache warming - Precalentar cache con data frecuente
 */
const warmCache = async () => {
  try {
    console.log('🔥 Warming cache...');

    const Restaurant = require('../models/Restaurant');
    
    // Cachear restaurantes populares
    const popularRestaurants = await Restaurant.find({ isActive: true })
      .sort({ 'analytics.totalOrders': -1 })
      .limit(20)
      .lean();

    await cache.set('cache:popular-restaurants', popularRestaurants, 600);

    console.log('✅ Cache warmed');
  } catch (error) {
    console.error('Error warming cache:', error);
  }
};

/**
 * Rate limiting con Redis
 */
const createRateLimiter = (windowMs = 900000, max = 100) => {
  return async (req, res, next) => {
    try {
      const redis = initRedis();
      const identifier = req.ip || req.connection.remoteAddress;
      const key = `ratelimit:${identifier}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      if (current > max) {
        const ttl = await redis.ttl(key);
        res.set('X-RateLimit-Limit', max);
        res.set('X-RateLimit-Remaining', 0);
        res.set('X-RateLimit-Reset', Date.now() + ttl * 1000);

        return res.status(429).json({
          success: false,
          message: 'Demasiadas solicitudes. Por favor, intenta más tarde.'
        });
      }

      res.set('X-RateLimit-Limit', max);
      res.set('X-RateLimit-Remaining', max - current);

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next();
    }
  };
};

module.exports = {
  initRedis,
  cacheMiddleware,
  cache,
  cacheInvalidation,
  warmCache,
  createRateLimiter
};
