const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Payment Service - Handles Stripe payment processing
 */

/**
 * Create a payment intent for order
 */
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    throw new Error(`Payment creation failed: ${error.message}`);
  }
};

/**
 * Confirm payment status
 */
const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    };
  } catch (error) {
    throw new Error(`Payment confirmation failed: ${error.message}`);
  }
};

/**
 * Create a refund
 */
const createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundData = { payment_intent: paymentIntentId };
    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundData);
    return {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
    };
  } catch (error) {
    throw new Error(`Refund failed: ${error.message}`);
  }
};

/**
 * Handle Stripe webhook events
 */
const handleWebhookEvent = async (event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      return { type: 'payment_success', data: event.data.object };
    
    case 'payment_intent.payment_failed':
      return { type: 'payment_failed', data: event.data.object };
    
    case 'charge.refunded':
      return { type: 'refund_completed', data: event.data.object };
    
    default:
      return { type: 'unknown', data: event.data.object };
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  createRefund,
  handleWebhookEvent,
};
