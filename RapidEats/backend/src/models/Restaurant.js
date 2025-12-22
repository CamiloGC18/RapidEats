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
    totalOrders: {
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

restaurantSchema.index({ slug: 1 });
restaurantSchema.index({ category: 1 });
restaurantSchema.index({ isActive: 1, isFeatured: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
