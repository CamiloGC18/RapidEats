const winston = require('winston');
const path = require('path');

// Configuración de Winston Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'rapideats-backend' },
  transports: [
    // Error logs
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Si no estamos en producción, también log a consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Helper functions para logging estructurado
const logHelper = {
  /**
   * Log info message
   */
  info(message, meta = {}) {
    logger.info(message, meta);
  },

  /**
   * Log error message
   */
  error(message, error = null, meta = {}) {
    logger.error(message, {
      ...meta,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    });
  },

  /**
   * Log warning message
   */
  warn(message, meta = {}) {
    logger.warn(message, meta);
  },

  /**
   * Log debug message
   */
  debug(message, meta = {}) {
    logger.debug(message, meta);
  },

  /**
   * Log HTTP request
   */
  logRequest(req, res, duration) {
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id
    });
  },

  /**
   * Log authentication event
   */
  logAuth(action, userId, meta = {}) {
    logger.info('Authentication Event', {
      action,
      userId,
      ...meta
    });
  },

  /**
   * Log payment event
   */
  logPayment(action, orderId, amount, meta = {}) {
    logger.info('Payment Event', {
      action,
      orderId,
      amount,
      ...meta
    });
  },

  /**
   * Log database operation
   */
  logDB(operation, collection, duration, meta = {}) {
    logger.debug('Database Operation', {
      operation,
      collection,
      duration: `${duration}ms`,
      ...meta
    });
  }
};

module.exports = { logger, logHelper };
