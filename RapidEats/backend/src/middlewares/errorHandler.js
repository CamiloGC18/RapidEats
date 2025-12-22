const { logHelper } = require('../config/logger');
const {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  PaymentError,
  ExternalServiceError
} = require('../utils/errors');

// Error handler mejorado con logging y clasificación
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error
  logHelper.error('Error occurred', err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    error = new ValidationError('Mongoose validation failed', errors);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error = new ValidationError(`Invalid ${err.path}: ${err.value}`);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];
    error = new ConflictError(`${field} '${value}' already exists`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired');
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new ValidationError('File size too large');
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error = new ValidationError('Too many files');
    } else {
      error = new ValidationError('File upload error');
    }
  }

  // Stripe errors
  if (err.type === 'StripeCardError') {
    error = new PaymentError(err.message);
  }

  if (err.type === 'StripeInvalidRequestError') {
    error = new PaymentError('Invalid payment request');
  }

  // Default to AppError si no es operacional
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || 'Internal server error',
      error.statusCode || 500,
      false // No operacional
    );
  }

  // Preparar response
  const response = {
    status: error.status,
    message: error.message
  };

  // Agregar detalles adicionales en desarrollo
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.error = error;
  }

  // Agregar errores de validación
  if (error instanceof ValidationError && error.errors) {
    response.errors = error.errors;
  }

  // Rate limit headers
  if (error instanceof RateLimitError) {
    res.setHeader('Retry-After', '900'); // 15 minutos
  }

  // Log crítico para errores no operacionales
  if (!error.isOperational) {
    logHelper.error('CRITICAL: Non-operational error', error, {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query
    });

    // En producción, enviar a servicio de monitoreo (Sentry)
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      // TODO: Integrar Sentry
      // Sentry.captureException(error);
    }
  }

  // Enviar response
  res.status(error.statusCode).json(response);
};

// Handler para rutas no encontradas
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

// Async handler wrapper para evitar try-catch en controllers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
