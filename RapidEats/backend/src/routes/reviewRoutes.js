const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  createReview,
  getRestaurantReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  respondToReview,
  getReviewStats,
  canReviewOrder,
} = require('../controllers/reviewController');
const { validateReview } = require('../middlewares/validator');

// Public routes
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.get('/restaurant/:restaurantId/stats', getReviewStats);

// Protected routes (any authenticated user)
router.use(authenticate);

router.get('/user', getUserReviews);
router.get('/can-review/:orderId', canReviewOrder);
router.post('/:id/helpful', markReviewHelpful);

// Customer routes
router.post('/', authorize('customer'), validateReview, createReview);
router.put('/:id', authorize('customer'), validateReview, updateReview);
router.delete('/:id', authorize('customer', 'admin'), deleteReview);

// Restaurant owner routes
router.post('/:id/respond', authorize('restaurant', 'admin'), respondToReview);

module.exports = router;
