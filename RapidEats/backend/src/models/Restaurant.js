const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Comida Rápida',
        'Asiática',
        'Italiana',
        'Saludable',
        'Mexicana',
        'Postres',
        'Bebidas',
        'Otro',
      ],
    },
    logo: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    schedule: {
      monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    },
    zone: {
      type: String,
      default: '',
    },
    estimatedDeliveryTime: {
      type: String,
      default: '30-45 min',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
      food: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      delivery: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      distribution: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 },
      },
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },
    deliveryCosts: [
      {
        fromZone: String,
        toZone: String,
        cost: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

);

// Índices optimizados para búsqueda y queries frecuentes
restaurantSchema.index({ slug: 1 }, { unique: true });
restaurantSchema.index({ category: 1, isActive: 1 });
restaurantSchema.index({ isActive: 1, isFeatured: 1 });
restaurantSchema.index({ ownerId: 1 });
restaurantSchema.index({ 'ratings.average': -1 }); // Para ordenar por rating
restaurantSchema.index({ totalOrders: -1 }); // Para ordenar por popularidad
restaurantSchema.index({ name: 'text', description: 'text' }); // Full-text search
restaurantSchema.index({ createdAt: -1 }); // Para ordenar por recientes
restaurantSchema.index({ zone: 1, isActive: 1 }); // Búsqueda por zona

// Índice compuesto para queries comunes
restaurantSchema.index({ 
  isActive: 1, 
  category: 1, 
  'ratings.average': -1 
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
