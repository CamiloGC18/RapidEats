/**
 * Middleware de optimización de performance
 */

const compression = require('compression');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

/**
 * Configurar compression
 */
const setupCompression = (app) => {
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, // Balance entre compresión y CPU
    threshold: 1024 // Solo comprimir si > 1KB
  }));
};

/**
 * Configurar security headers con Helmet
 */
const setupSecurity = (app) => {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", process.env.API_URL]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Prevenir ataques NoSQL injection
  app.use(mongoSanitize());

  // Prevenir HTTP Parameter Pollution
  app.use(hpp({
    whitelist: ['sort', 'fields', 'page', 'limit']
  }));
};

/**
 * Request sanitization
 */
const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Trim whitespace
        req.body[key] = req.body[key].trim();
        
        // Remove null bytes
        req.body[key] = req.body[key].replace(/\0/g, '');
      }
    });
  }
  next();
};

/**
 * Response time tracking
 */
const trackResponseTime = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests (> 1 segundo)
    if (duration > 1000) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`);
    }

    res.set('X-Response-Time', `${duration}ms`);
  });

  next();
};

/**
 * Memory usage monitor
 */
const monitorMemory = () => {
  const used = process.memoryUsage();
  const formatMemory = (bytes) => (bytes / 1024 / 1024).toFixed(2);

  console.log(`
📊 Memory Usage:
  - RSS: ${formatMemory(used.rss)} MB
  - Heap Total: ${formatMemory(used.heapTotal)} MB
  - Heap Used: ${formatMemory(used.heapUsed)} MB
  - External: ${formatMemory(used.external)} MB
  `);

  // Alertar si el uso de heap es muy alto
  const heapUsedPercentage = (used.heapUsed / used.heapTotal) * 100;
  if (heapUsedPercentage > 90) {
    console.warn('⚠️  High memory usage detected!');
  }
};

/**
 * Graceful shutdown
 */
const setupGracefulShutdown = (server, mongoose) => {
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    // Dejar de aceptar nuevas conexiones
    server.close(async () => {
      console.log('✅ HTTP server closed');

      try {
        // Cerrar conexión a MongoDB
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');

        // Cerrar Redis si existe
        const redis = require('./cache').initRedis();
        if (redis) {
          await redis.quit();
          console.log('✅ Redis connection closed');
        }

        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force close después de 30 segundos
    setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

/**
 * Error handling para procesos no capturados
 */
const setupErrorHandlers = () => {
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
};

/**
 * Database query optimization helper
 */
const optimizedQuery = {
  /**
   * Paginación eficiente con cursor
   */
  paginate: (query, { page = 1, limit = 20, sort = '-createdAt' }) => {
    const skip = (page - 1) * limit;
    return query
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(); // lean() para mejor performance
  },

  /**
   * Select fields específicos
   */
  selectFields: (query, fields) => {
    if (fields) {
      return query.select(fields.split(',').join(' '));
    }
    return query;
  },

  /**
   * Populate con límites
   */
  populateOptimized: (query, populate) => {
    if (populate) {
      const populateArray = populate.split(',');
      populateArray.forEach(field => {
        query.populate({
          path: field.trim(),
          select: '-__v' // Excluir __v
        });
      });
    }
    return query;
  }
};

/**
 * Response format helper
 */
const sendResponse = {
  success: (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },

  error: (res, message, statusCode = 500, errors = null) => {
    const response = {
      success: false,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    res.status(statusCode).json(response);
  },

  paginated: (res, data, pagination, message = 'Success') => {
    res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        pages: Math.ceil(pagination.total / pagination.limit)
      }
    });
  }
};

/**
 * Performance metrics middleware
 */
const performanceMetrics = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const time = diff[0] * 1e3 + diff[1] * 1e-6; // Convert to milliseconds

    // Log to analytics service
    if (global.analyticsService) {
      global.analyticsService.track('api_request', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: time,
        timestamp: new Date()
      });
    }
  });

  next();
};

module.exports = {
  setupCompression,
  setupSecurity,
  sanitizeRequest,
  trackResponseTime,
  monitorMemory,
  setupGracefulShutdown,
  setupErrorHandlers,
  optimizedQuery,
  sendResponse,
  performanceMetrics
};
