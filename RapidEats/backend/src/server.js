require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { createServer } = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/database');
const { redis, cacheHelper } = require('./config/redis');
const { logger, logHelper } = require('./config/logger');
const passport = require('./config/oauth');
const { initTelegramBot } = require('./config/telegram');
const { initEmailService } = require('./services/emailService');
const { initFirebase } = require('./services/notificationService');
const { setupTelegramHandlers } = require('./services/telegramService');
const setupSockets = require('./sockets/namespaces');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Conectar servicios
connectDB();

// Conectar Redis con manejo de errores
redis.connect().catch(err => {
  logHelper.error('Failed to connect to Redis', err);
  console.log('⚠️  Redis not available, caching disabled');
});

initTelegramBot();
initEmailService();
initFirebase();

// ===== MIDDLEWARES DE SEGURIDAD =====
// Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Compression para respuestas
app.use(compression());

// Sanitize MongoDB queries para prevenir NoSQL injection
app.use(mongoSanitize());

// HPP para prevenir HTTP Parameter Pollution
app.use(hpp());

// ===== LOGGING =====
// Morgan para HTTP request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Custom request logger
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logHelper.logRequest(req, res, duration);
  });
  
  next();
});

// ===== CORS =====
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ===== PARSERS =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ===== PASSPORT =====
app.use(passport.initialize());

// ===== RATE LIMITING =====
// Aplicar rate limiting general a todas las rutas
app.use('/api/', generalLimiter);

// ===== SOCKET.IO SETUP =====
const socketHelpers = setupSockets(io);
app.set('io', io);
app.set('socketHelpers', socketHelpers);
setupTelegramHandlers(io);

// ===== HEALTH CHECK =====
app.get('/health', asyncHandler(async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    services: {
      database: 'connected',
      redis: redis.status === 'ready' ? 'connected' : 'disconnected',
      socketio: socketHelpers.getConnectionStats()
    }
  };
  
  res.json(health);
}));

// ===== ROOT ENDPOINT =====
app.get('/', (req, res) => {
  res.json({
    name: 'RapidEats API',
    version: '2.0.0',
    message: '🚀 RapidEats Premium API is running',
    documentation: `${process.env.FRONTEND_URL}/api-docs`,
    endpoints: {
      auth: '/api/auth',
      restaurants: '/api/restaurants',
      orders: '/api/orders',
      coupons: '/api/coupons',
      payments: '/api/payments',
      reviews: '/api/reviews',
      favorites: '/api/favorites',
      notifications: '/api/notifications',
    },
    features: {
      rateLimit: 'enabled',
      caching: redis.status === 'ready' ? 'enabled' : 'disabled',
      realtime: 'enabled',
      authentication: 'OAuth2 + JWT',
      payments: 'Stripe',
    }
  });
});

// ===== API ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);

// ===== ERROR HANDLING =====
// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===== GRACEFUL SHUTDOWN =====
const gracefulShutdown = async () => {
  logHelper.info('Received shutdown signal, closing gracefully...');
  
  // Cerrar server HTTP
  httpServer.close(() => {
    logHelper.info('HTTP server closed');
  });

  // Cerrar Socket.io
  io.close(() => {
    logHelper.info('Socket.io closed');
  });

  // Cerrar conexión Redis
  try {
    await redis.quit();
    logHelper.info('Redis connection closed');
  } catch (error) {
    logHelper.error('Error closing Redis', error);
  }

  // Cerrar conexión MongoDB
  try {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    logHelper.info('MongoDB connection closed');
  } catch (error) {
    logHelper.error('Error closing MongoDB', error);
  }

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logHelper.error('Unhandled Rejection', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logHelper.error('Uncaught Exception', error);
  gracefulShutdown();
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 RapidEats Premium Server Running             ║
║                                                   ║
║   Port: ${PORT.toString().padEnd(44)}║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(38)}║
║   Frontend: ${(process.env.FRONTEND_URL || 'http://localhost:3000').padEnd(36)}║
║                                                   ║
║   Features:                                       ║
║   ✅ Rate Limiting                                ║
║   ✅ Redis Caching                                ║
║   ✅ Socket.io Namespaces                         ║
║   ✅ Advanced Error Handling                      ║
║   ✅ Request Validation                           ║
║   ✅ Security Middleware                          ║
║   ✅ Stripe Payments                              ║
║   ✅ PDF Invoices                                 ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
  
  logHelper.info('Server started successfully', { port: PORT });
});

module.exports = { app, io, socketHelpers };
