const { 
  createPaymentIntent, 
  confirmPayment, 
  createRefund,
  handleWebhookEvent 
} = require('../services/paymentService');
const Order = require('../models/Order');

/**
 * Create payment intent for order
 */
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and amount are required',
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order',
      });
    }

    // Create payment intent
    const payment = await createPaymentIntent(
      amount,
      'usd',
      {
        orderId: orderId,
        customerId: req.user._id.toString(),
        customerEmail: req.user.email,
      }
    );

    // Update order with payment info
    order.payment = {
      method: 'stripe',
      status: 'pending',
      transactionId: payment.paymentIntentId,
    };
    await order.save();

    res.json({
      success: true,
      data: {
        clientSecret: payment.clientSecret,
        paymentIntentId: payment.paymentIntentId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm payment completion
 */
exports.confirmPaymentCompletion = async (req, res, next) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and order ID are required',
      });
    }

    // Verify payment with Stripe
    const paymentStatus = await confirmPayment(paymentIntentId);

    // Update order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (paymentStatus.status === 'succeeded') {
      order.payment.status = 'completed';
      order.payment.paidAt = new Date();
      order.status = 'confirmed';
      await order.save();

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: { order },
      });
    } else {
      order.payment.status = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Payment not completed',
        data: { status: paymentStatus.status },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Process refund
 */
exports.processRefund = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization (admin or restaurant owner)
    const isAuthorized = 
      req.user.role === 'admin' || 
      (req.user.role === 'restaurant' && order.restaurant.toString() === req.user.restaurant.toString());

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to refund this order',
      });
    }

    if (order.payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund unpaid order',
      });
    }

    // Process refund
    const refund = await createRefund(order.payment.transactionId);

    // Update order
    order.payment.refunded = true;
    order.payment.refundId = refund.refundId;
    order.payment.refundedAt = new Date();
    order.status = 'refunded';
    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: { refund, order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Stripe webhook handler
 */
exports.handleStripeWebhook = async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  const result = await handleWebhookEvent(event);

  if (result.type === 'payment_success') {
    // Update order status
    const order = await Order.findOne({ 
      'payment.transactionId': result.data.id 
    });
    
    if (order) {
      order.payment.status = 'completed';
      order.payment.paidAt = new Date();
      order.status = 'confirmed';
      await order.save();
    }
  }

  res.json({ received: true });
};
