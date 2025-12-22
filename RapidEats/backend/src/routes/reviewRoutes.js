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
const { reviewLimiter } = require('../middlewares/rateLimiter');
const { validate, schemas } = require('../utils/validation');
const { cacheHelper } = require('../config/redis');

// Public routes (con cache)
router.get('/restaurant/:restaurantId', 
  cacheHelper.middleware(300), 
  getRestaurantReviews
);
router.get('/restaurant/:restaurantId/stats', 
  cacheHelper.middleware(600), 
  getReviewStats
);

// Protected routes (any authenticated user)
router.use(authenticate);

router.get('/user', getUserReviews);
router.get('/can-review/:orderId', canReviewOrder);
router.post('/:id/helpful', markReviewHelpful);

// Customer routes
router.post('/', 
  authorize('customer'), 
  reviewLimiter,
  validate(schemas.createReview), 
  createReview
);
router.put('/:id', 
  authorize('customer'), 
  validate(schemas.createReview), 
  updateReview
);
router.delete('/:id', authorize('customer', 'admin'), deleteReview);

// Restaurant owner routes
router.post('/:id/respond', authorize('restaurant', 'admin'), respondToReview);

module.exports = router;
