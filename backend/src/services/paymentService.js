const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PaymentError } = require('../utils/errors');
const { logHelper } = require('../config/logger');
const Order = require('../models/Order');

/**
 * Payment Service - Handles Stripe payment processing con características premium
 */

/**
 * Create a payment intent for order con metadata completa
 * @param {Object} options - Payment options
 */
const createPaymentIntent = async (options) => {
  const {
    amount,
    currency = 'cop', // Colombia - Peso
    orderId,
    customerId,
    restaurantId,
    description,
    metadata = {}
  } = options;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      description: description || `RapidEats Order #${orderId}`,
      metadata: {
        orderId,
        customerId,
        restaurantId,
        platform: 'rapideats',
        environment: process.env.NODE_ENV,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Configuración de receipt
      receipt_email: metadata.customerEmail,
      statement_descriptor: 'RAPIDEATS',
      statement_descriptor_suffix: orderId?.slice(-10),
    });

    logHelper.logPayment('payment_intent_created', orderId, amount, {
      paymentIntentId: paymentIntent.id,
      currency
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status
    };
  } catch (error) {
    logHelper.error('Payment intent creation failed', error, { orderId, amount });
    throw new PaymentError(`Payment creation failed: ${error.message}`);
  }
};

/**
 * Confirm payment status
 */
const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    logHelper.logPayment('payment_confirmed', paymentIntent.metadata?.orderId, 
      paymentIntent.amount / 100, {
      paymentIntentId,
      status: paymentIntent.status
    });

    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      charges: paymentIntent.charges.data,
      metadata: paymentIntent.metadata
    };
  } catch (error) {
    logHelper.error('Payment confirmation failed', error, { paymentIntentId });
    throw new PaymentError(`Payment confirmation failed: ${error.message}`);
  }
};

/**
 * Create a refund con razón
 */
const createRefund = async (paymentIntentId, options = {}) => {
  const { amount = null, reason = 'requested_by_customer', orderId } = options;

  try {
    const refundData = { 
      payment_intent: paymentIntentId,
      reason
    };
    
    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundData);
    
    logHelper.logPayment('refund_created', orderId, refund.amount / 100, {
      refundId: refund.id,
      reason,
      status: refund.status
    });

    // Actualizar orden
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        $set: {
          'payment.refund': {
            id: refund.id,
            amount: refund.amount / 100,
            status: refund.status,
            reason,
            createdAt: new Date()
          }
        }
      });
    }

    return {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
      currency: refund.currency
    };
  } catch (error) {
    logHelper.error('Refund failed', error, { paymentIntentId, orderId });
    throw new PaymentError(`Refund failed: ${error.message}`);
  }
};

/**
 * Partial refund
 */
const createPartialRefund = async (paymentIntentId, amount, orderId) => {
  return createRefund(paymentIntentId, { 
    amount, 
    reason: 'requested_by_customer',
    orderId 
  });
};

/**
 * Create customer for saved payment methods
 */
const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        platform: 'rapideats',
        ...metadata
      }
    });

    logHelper.info('Stripe customer created', {
      customerId: customer.id,
      email
    });

    return {
      customerId: customer.id,
      email: customer.email
    };
  } catch (error) {
    logHelper.error('Customer creation failed', error, { email });
    throw new PaymentError(`Customer creation failed: ${error.message}`);
  }
};

/**
 * Attach payment method to customer
 */
const attachPaymentMethod = async (paymentMethodId, customerId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    logHelper.info('Payment method attached', {
      paymentMethodId,
      customerId
    });

    return paymentMethod;
  } catch (error) {
    logHelper.error('Payment method attachment failed', error, { 
      paymentMethodId, 
      customerId 
    });
    throw new PaymentError(`Payment method attachment failed: ${error.message}`);
  }
};

/**
 * List customer payment methods
 */
const listPaymentMethods = async (customerId) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
      isDefault: pm.id === customerId.invoice_settings?.default_payment_method
    }));
  } catch (error) {
    logHelper.error('Failed to list payment methods', error, { customerId });
    throw new PaymentError(`Failed to list payment methods: ${error.message}`);
  }
};

/**
 * Detach payment method
 */
const detachPaymentMethod = async (paymentMethodId) => {
  try {
    await stripe.paymentMethods.detach(paymentMethodId);
    
    logHelper.info('Payment method detached', { paymentMethodId });
    
    return { success: true };
  } catch (error) {
    logHelper.error('Payment method detachment failed', error, { paymentMethodId });
    throw new PaymentError(`Payment method detachment failed: ${error.message}`);
  }
};

/**
 * Handle Stripe webhook events
 */
const handleWebhookEvent = async (event) => {
  const eventType = event.type;
  const eventData = event.data.object;

  logHelper.info('Stripe webhook received', {
    type: eventType,
    id: event.id
  });

  try {
    switch (eventType) {
      case 'payment_intent.succeeded':
        // Actualizar orden como pagada
        if (eventData.metadata?.orderId) {
          await Order.findByIdAndUpdate(eventData.metadata.orderId, {
            $set: {
              'payment.status': 'succeeded',
              'payment.paidAt': new Date()
            }
          });
        }
        return { type: 'payment_success', data: eventData };
      
      case 'payment_intent.payment_failed':
        // Marcar orden como fallida
        if (eventData.metadata?.orderId) {
          await Order.findByIdAndUpdate(eventData.metadata.orderId, {
            $set: {
              'payment.status': 'failed',
              'payment.error': eventData.last_payment_error?.message
            }
          });
        }
        return { type: 'payment_failed', data: eventData };
      
      case 'charge.refunded':
        // Actualizar orden con refund
        return { type: 'refund_completed', data: eventData };

      case 'payment_intent.canceled':
        if (eventData.metadata?.orderId) {
          await Order.findByIdAndUpdate(eventData.metadata.orderId, {
            $set: { 'payment.status': 'canceled' }
          });
        }
        return { type: 'payment_canceled', data: eventData };

      case 'payment_method.attached':
        return { type: 'payment_method_attached', data: eventData };

      case 'customer.created':
        return { type: 'customer_created', data: eventData };
      
      default:
        logHelper.warn('Unhandled webhook event', { type: eventType });
        return { type: 'unknown', data: eventData };
    }
  } catch (error) {
    logHelper.error('Webhook handler error', error, { eventType, eventId: event.id });
    throw error;
  }
};

/**
 * Calcular fee de Stripe (para mostrar al usuario)
 */
const calculateStripeFee = (amount) => {
  // Stripe fee en Colombia: 2.9% + $0.30 USD (aproximado)
  const percentageFee = amount * 0.029;
  const fixedFee = 0.30;
  return Math.round((percentageFee + fixedFee) * 100) / 100;
};

/**
 * Verify webhook signature
 */
const verifyWebhookSignature = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    logHelper.error('Webhook signature verification failed', error);
    throw new PaymentError('Invalid webhook signature');
  }
};

/**
 * Get payment intent details
 */
const getPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['charges', 'payment_method']
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      created: new Date(paymentIntent.created * 1000),
      metadata: paymentIntent.metadata,
      charges: paymentIntent.charges.data,
      paymentMethod: paymentIntent.payment_method
    };
  } catch (error) {
    logHelper.error('Failed to get payment intent', error, { paymentIntentId });
    throw new PaymentError(`Failed to get payment intent: ${error.message}`);
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  createRefund,
  createPartialRefund,
  createCustomer,
  attachPaymentMethod,
  listPaymentMethods,
  detachPaymentMethod,
  handleWebhookEvent,
  calculateStripeFee,
  verifyWebhookSignature,
  getPaymentIntent
};
