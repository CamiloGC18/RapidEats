const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hasToppings: {
      type: Boolean,
      default: false,
    },
    toppings: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

);

// Índices optimizados para queries frecuentes
productSchema.index({ restaurantId: 1, isActive: 1, category: 1 }); // Listar productos
productSchema.index({ restaurantId: 1, order: 1 }); // Ordenar productos
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 }); // Filtrar por precio
productSchema.index({ name: 'text', description: 'text' }); // Búsqueda full-text
productSchema.index({ createdAt: -1 }); // Productos nuevos

module.exports = mongoose.model('Product', productSchema);
