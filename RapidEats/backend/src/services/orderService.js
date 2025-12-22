const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Coupon = require('../models/Coupon');
const { generateOrderNumber, calculateDiscount } = require('../utils/helpers');
const { notifyNewOrder } = require('./telegramService');
const { sendOrderConfirmation } = require('./emailService');

const createOrder = async (orderData, userId) => {
  const {
    restaurantId,
    items,
    customer,
    pricing,
    coupon,
    paymentMethod,
  } = orderData;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || !restaurant.isActive) {
    throw new Error('Restaurant not found or inactive');
  }

  if (coupon && coupon.code) {
    const couponDoc = await Coupon.findOne({ code: coupon.code.toUpperCase() });
    if (!couponDoc || !couponDoc.isActive) {
      throw new Error('Invalid or inactive coupon');
    }

    if (couponDoc.expiresAt && new Date(couponDoc.expiresAt) < new Date()) {
      throw new Error('Coupon has expired');
    }

    if (couponDoc.maxUses && couponDoc.currentUses >= couponDoc.maxUses) {
      throw new Error('Coupon usage limit reached');
    }

    if (pricing.subtotal < couponDoc.minOrderAmount) {
      throw new Error(`Minimum order amount is ${couponDoc.minOrderAmount}`);
    }

    await Coupon.findByIdAndUpdate(couponDoc._id, {
      $inc: { currentUses: 1 }
    });
  }

  const orderNumber = generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    customerId: userId,
    restaurantId,
    items,
    customer,
    pricing,
    coupon,
    paymentMethod,
    status: 'pending_confirmation',
    statusHistory: [{
      status: 'pending_confirmation',
      timestamp: new Date(),
      updatedBy: userId,
    }],
    estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
  });

  await Restaurant.findByIdAndUpdate(restaurantId, {
    $inc: { totalOrders: 1 }
  });

  const populatedOrder = await Order.findById(order._id)
    .populate('restaurantId')
    .populate('customerId');

  await sendOrderConfirmation(populatedOrder);

  return populatedOrder;
};

const updateOrderStatus = async (orderId, newStatus, userId, io) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      status: newStatus,
      $push: {
        statusHistory: {
          status: newStatus,
          timestamp: new Date(),
          updatedBy: userId,
        }
      },
      ...(newStatus === 'delivered' && { deliveredAt: new Date() })
    },
    { new: true }
  ).populate('restaurantId customerId deliveryId');

  if (!order) {
    throw new Error('Order not found');
  }

  if (newStatus === 'confirmed' && io) {
    await notifyNewOrder(order);
  }

  if (io) {
    io.to(`order_${orderId}`).emit('orderStatusUpdate', {
      orderId,
      status: newStatus,
      timestamp: new Date(),
    });

    io.to(`restaurant_${order.restaurantId._id}`).emit('orderUpdate', {
      orderId,
      status: newStatus,
    });
  }

  return order;
};

module.exports = {
  createOrder,
  updateOrderStatus,
};
