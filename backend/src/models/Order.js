const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        name: String,
        price: Number,
        quantity: Number,
        toppings: [
          {
            name: String,
            price: Number,
          },
        ],
        subtotal: Number,
      },
    ],
    customer: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: String,
      address: {
        type: String,
        required: true,
      },
      zone: {
        type: String,
        required: true,
      },
      notes: String,
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
      },
      deliveryCost: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    coupon: {
      code: String,
      type: String,
      value: Number,
      description: String,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Efectivo', 'Nequi', 'Tarjeta'],
    },
    status: {
      type: String,
      enum: [
        'pending_confirmation',
        'confirmed',
        'preparing',
        'on_the_way',
        'delivered',
        'cancelled',
      ],
      default: 'pending_confirmation',
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    estimatedDeliveryTime: String,
    deliveredAt: Date,
    cancelReason: String,
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  },
  {
    timestamps: true,
  }
);

);

// Índices optimizados para queries frecuentes
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ customerId: 1, createdAt: -1 }); // Historial del usuario
orderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 }); // Órdenes por restaurante
orderSchema.index({ deliveryId: 1, status: 1 }); // Órdenes del repartidor
orderSchema.index({ status: 1, createdAt: -1 }); // Todas las órdenes por status
orderSchema.index({ createdAt: -1 }); // Órdenes recientes
orderSchema.index({ deliveredAt: -1 }); // Órdenes entregadas

// Índice compuesto para analytics
orderSchema.index({
  restaurantId: 1,
  status: 1,
  createdAt: -1
});

// Índice para búsqueda de órdenes activas
orderSchema.index({
  status: 1,
  restaurantId: 1
}, {
  partialFilterExpression: {
    status: { $in: ['pending_confirmation', 'confirmed', 'preparing', 'on_the_way'] }
  }
});

module.exports = mongoose.model('Order', orderSchema);
