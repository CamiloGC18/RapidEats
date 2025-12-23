const express = require('express');
const {
  createPaymentIntent,
  confirmPaymentCompletion,
  processRefund,
  handleStripeWebhook,
} = require('../controllers/paymentController');
const { verifyToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// Create payment intent (authenticated customers)
router.post('/create-intent', verifyToken, createPaymentIntent);

// Confirm payment (authenticated customers)
router.post('/confirm', verifyToken, confirmPaymentCompletion);

// Process refund (admin or restaurant)
router.post('/refund', verifyToken, authorize('admin', 'restaurant'), processRefund);

// Stripe webhook (public, but verified by Stripe signature)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

module.exports = router;
