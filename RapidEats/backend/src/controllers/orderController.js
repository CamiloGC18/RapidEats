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

const reorder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the original order
    const originalOrder = await Order.findById(orderId).populate('items.productId');

    if (!originalOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify order belongs to user
    if (originalOrder.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if restaurant is still active
    const Restaurant = require('../models/Restaurant');
    const restaurant = await Restaurant.findById(originalOrder.restaurantId);
    
    if (!restaurant || !restaurant.isActive) {
      return res.status(400).json({ 
        message: 'Restaurant is not available',
        restaurantActive: false,
      });
    }

    // Get current product data
    const Product = require('../models/Product');
    const productIds = originalOrder.items.map(item => item.productId._id);
    const currentProducts = await Product.find({
      _id: { $in: productIds },
      isAvailable: true,
    });

    // Map products for quick lookup
    const productMap = new Map(
      currentProducts.map(p => [p._id.toString(), p])
    );

    // Check which items are still available
    const availableItems = [];
    const unavailableItems = [];

    originalOrder.items.forEach(item => {
      const currentProduct = productMap.get(item.productId._id.toString());
      
      if (currentProduct) {
        availableItems.push({
          productId: currentProduct._id,
          name: currentProduct.name,
          price: currentProduct.price, // Use current price
          quantity: item.quantity,
          toppings: item.toppings,
          image: currentProduct.image,
        });
      } else {
        unavailableItems.push({
          name: item.name,
          reason: 'Product no longer available',
        });
      }
    });

    if (availableItems.length === 0) {
      return res.status(400).json({
        message: 'No items from this order are currently available',
        unavailableItems,
      });
    }

    // Return cart data for frontend to process
    res.json({
      success: true,
      data: {
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
        },
        items: availableItems,
        customer: originalOrder.customer,
        unavailableItems,
      },
      message: unavailableItems.length > 0 
        ? `${availableItems.length} items added to cart. ${unavailableItems.length} items are no longer available.`
        : 'All items added to cart successfully',
    });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ message: 'Error processing reorder' });
  }
};

module.exports = {
  placeOrder,
  getOrderById,
  getUserOrders,
  getOrderTracking,
  reorder,
};

