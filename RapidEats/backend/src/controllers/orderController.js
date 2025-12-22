const Order = require('../models/Order');
const { createOrder, updateOrderStatus } = require('../services/orderService');

const placeOrder = async (req, res) => {
  try {
    const order = await createOrder(req.body, req.user._id);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name logo zone')
      .populate('customerId', 'name email phone')
      .populate('deliveryId', 'name phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (
      order.customerId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      (req.user.role !== 'restaurant' || order.restaurantId._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const filter = { customerId: req.user._id };

    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('restaurantId', 'name logo')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name logo zone')
      .populate('deliveryId', 'name phone picture')
      .select('orderNumber status statusHistory estimatedDeliveryTime customer deliveryId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tracking info' });
  }
};

module.exports = {
  placeOrder,
  getOrderById,
  getUserOrders,
  getOrderTracking,
};
