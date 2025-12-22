const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

// Esquemas de validación comunes
const schemas = {
  // User schemas
  register: Joi.object({
    name: Joi.string().min(2).max(100).required().trim(),
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      }),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    role: Joi.string().valid('customer', 'restaurant', 'delivery', 'admin').default('customer')
  }),

  login: Joi.object({
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).trim(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/),
    avatar: Joi.string().uri()
  }).min(1),

  // Restaurant schemas
  createRestaurant: Joi.object({
    name: Joi.string().min(2).max(200).required().trim(),
    description: Joi.string().max(1000).required(),
    address: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    email: Joi.string().email().required().lowercase(),
    category: Joi.string().required(),
    cuisine: Joi.array().items(Joi.string()).min(1).required(),
    deliveryTime: Joi.number().min(10).max(120).required(),
    minimumOrder: Joi.number().min(0).required(),
    deliveryFee: Joi.number().min(0).required(),
    location: Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required(),
    openingHours: Joi.object({
      monday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      tuesday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      wednesday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      thursday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      friday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      saturday: Joi.object({ open: Joi.string(), close: Joi.string() }),
      sunday: Joi.object({ open: Joi.string(), close: Joi.string() })
    })
  }),

  updateRestaurant: Joi.object({
    name: Joi.string().min(2).max(200).trim(),
    description: Joi.string().max(1000),
    address: Joi.string(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/),
    category: Joi.string(),
    cuisine: Joi.array().items(Joi.string()).min(1),
    deliveryTime: Joi.number().min(10).max(120),
    minimumOrder: Joi.number().min(0),
    deliveryFee: Joi.number().min(0),
    isActive: Joi.boolean(),
    openingHours: Joi.object()
  }).min(1),

  // Product schemas
  createProduct: Joi.object({
    name: Joi.string().min(2).max(200).required().trim(),
    description: Joi.string().max(500).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().required(),
    image: Joi.string().uri(),
    isAvailable: Joi.boolean().default(true),
    preparationTime: Joi.number().min(1).max(60),
    tags: Joi.array().items(Joi.string()),
    dietary: Joi.object({
      vegetarian: Joi.boolean(),
      vegan: Joi.boolean(),
      glutenFree: Joi.boolean(),
      spicy: Joi.boolean()
    })
  }),

  updateProduct: Joi.object({
    name: Joi.string().min(2).max(200).trim(),
    description: Joi.string().max(500),
    price: Joi.number().min(0),
    category: Joi.string(),
    image: Joi.string().uri(),
    isAvailable: Joi.boolean(),
    preparationTime: Joi.number().min(1).max(60),
    tags: Joi.array().items(Joi.string()),
    dietary: Joi.object()
  }).min(1),

  // Order schemas
  createOrder: Joi.object({
    restaurant: Joi.string().hex().length(24).required(),
    items: Joi.array().items(
      Joi.object({
        product: Joi.string().hex().length(24).required(),
        quantity: Joi.number().integer().min(1).required(),
        specialInstructions: Joi.string().max(200)
      })
    ).min(1).required(),
    deliveryAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zipCode: Joi.string(),
      coordinates: Joi.array().items(Joi.number()).length(2),
      notes: Joi.string().max(200)
    }).required(),
    paymentMethod: Joi.string().valid('card', 'cash', 'wallet').required(),
    couponCode: Joi.string().uppercase(),
    scheduledFor: Joi.date().min('now')
  }),

  updateOrderStatus: Joi.object({
    status: Joi.string().valid(
      'pending', 
      'confirmed', 
      'preparing', 
      'ready', 
      'on_the_way', 
      'delivered', 
      'cancelled'
    ).required(),
    cancellationReason: Joi.string().when('status', {
      is: 'cancelled',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    })
  }),

  // Review schemas
  createReview: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(500),
    foodQuality: Joi.number().min(1).max(5),
    deliverySpeed: Joi.number().min(1).max(5),
    packaging: Joi.number().min(1).max(5)
  }),

  // Coupon schemas
  createCoupon: Joi.object({
    code: Joi.string().uppercase().min(3).max(20).required(),
    description: Joi.string().max(200).required(),
    discountType: Joi.string().valid('percentage', 'fixed').required(),
    discountValue: Joi.number().min(0).required(),
    minimumOrder: Joi.number().min(0),
    maxDiscount: Joi.number().min(0),
    validFrom: Joi.date().default(Date.now),
    validUntil: Joi.date().min(Joi.ref('validFrom')).required(),
    usageLimit: Joi.number().integer().min(1),
    userLimit: Joi.number().integer().min(1).default(1),
    applicableTo: Joi.object({
      restaurants: Joi.array().items(Joi.string().hex().length(24)),
      categories: Joi.array().items(Joi.string()),
      firstOrder: Joi.boolean()
    })
  }),

  // Payment schemas
  createPaymentIntent: Joi.object({
    orderId: Joi.string().hex().length(24).required(),
    amount: Joi.number().min(0).required()
  }),

  // Query schemas
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  searchRestaurants: Joi.object({
    query: Joi.string().trim(),
    category: Joi.string(),
    cuisine: Joi.string(),
    minRating: Joi.number().min(0).max(5),
    maxDeliveryFee: Joi.number().min(0),
    maxDeliveryTime: Joi.number().min(0),
    isOpen: Joi.boolean(),
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180),
    radius: Joi.number().min(0).max(50).default(10), // km
    ...schemas.pagination
  }).and('lat', 'lng')
};

// Middleware para validar request body
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      throw new ValidationError('Validation failed', errors);
    }

    req.body = value;
    next();
  };
};

// Middleware para validar query params
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      throw new ValidationError('Query validation failed', errors);
    }

    req.query = value;
    next();
  };
};

// Middleware para validar params
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      throw new ValidationError('Params validation failed', errors);
    }

    req.params = value;
    next();
  };
};

module.exports = {
  schemas,
  validate,
  validateQuery,
  validateParams
};
