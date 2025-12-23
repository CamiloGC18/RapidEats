const rateLimit = require('express-rate-limit');
const { RateLimitError } = require('../utils/errors');

// Rate limiter general - 100 requests por 15 minutos
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw new RateLimitError('Too many requests, please try again later');
  },
  skip: (req) => {
    // Skip rate limiting para admin
    return req.user && req.user.role === 'admin';
  }
});

// Rate limiter para autenticación - 5 requests por 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    throw new RateLimitError('Too many login attempts, please try again in 15 minutes');
  }
});

// Rate limiter para registro - 3 requests por hora
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  message: 'Too many accounts created from this IP, please try again later',
  handler: (req, res) => {
    throw new RateLimitError('Too many registration attempts, please try again in 1 hour');
  }
});

// Rate limiter para creación de órdenes - 10 por hora
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many orders created, please try again later',
  keyGenerator: (req) => {
    // Use user ID si está autenticado, sino IP
    return req.user ? req.user.id : req.ip;
  },
  handler: (req, res) => {
    throw new RateLimitError('Order limit reached, please try again in 1 hour');
  }
});

// Rate limiter para búsqueda - 30 por minuto
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30,
  message: 'Too many search requests',
  handler: (req, res) => {
    throw new RateLimitError('Search rate limit exceeded, please slow down');
  }
});

// Rate limiter para uploads - 10 por hora
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many file uploads',
  keyGenerator: (req) => req.user ? req.user.id : req.ip,
  handler: (req, res) => {
    throw new RateLimitError('Upload limit reached, please try again in 1 hour');
  }
});

// Rate limiter para password reset - 3 por hora
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset requests',
  handler: (req, res) => {
    throw new RateLimitError('Password reset limit reached, please try again in 1 hour');
  }
});

// Rate limiter para review creation - 5 por día
const reviewLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 5,
  message: 'Too many reviews created',
  keyGenerator: (req) => req.user ? req.user.id : req.ip,
  handler: (req, res) => {
    throw new RateLimitError('Review limit reached, please try again tomorrow');
  }
});

// Rate limiter flexible para API endpoints específicos
const createCustomLimiter = (windowMinutes, maxRequests) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      throw new RateLimitError(`Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMinutes} minutes`);
    }
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  registerLimiter,
  orderLimiter,
  searchLimiter,
  uploadLimiter,
  passwordResetLimiter,
  reviewLimiter,
  createCustomLimiter
};
