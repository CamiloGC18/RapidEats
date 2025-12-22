const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const { AppError } = require('../middlewares/errorHandler');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Customer)
exports.createReview = async (req, res, next) => {
  try {
    const { restaurantId, orderId, rating, foodRating, deliveryRating, comment, images } = req.body;

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only review your own orders', 403));
    }

    if (order.restaurant.toString() !== restaurantId) {
      return next(new AppError('Restaurant does not match order', 400));
    }

    if (order.status !== 'delivered' && order.status !== 'completed') {
      return next(new AppError('You can only review completed orders', 400));
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: req.user._id,
      restaurant: restaurantId,
    });

    if (existingReview) {
      return next(new AppError('You have already reviewed this restaurant', 400));
    }

    const review = await Review.create({
      user: req.user._id,
      restaurant: restaurantId,
      order: orderId,
      rating,
      foodRating,
      deliveryRating,
      comment,
      images,
      isVerifiedPurchase: true,
    });

    await review.populate('user', 'name picture');

    // Update order with review
    order.review = review._id;
    await order.save();

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
exports.getRestaurantReviews = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = '-createdAt' } = req.query;

    const query = {
      restaurant: restaurantId,
      status: 'approved',
    };

    if (rating) {
      query.rating = parseInt(rating);
    }

    const reviews = await Review.find(query)
      .populate('user', 'name picture')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    // Get rating distribution
    const distribution = await Review.aggregate([
      { $match: { restaurant: restaurantId, status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    distribution.forEach(item => {
      ratingDistribution[item._id] = item.count;
    });

    // Get restaurant stats
    const restaurant = await Restaurant.findById(restaurantId);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        average: restaurant.ratings.average,
        count: restaurant.ratings.count,
        distribution: ratingDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user reviews
// @route   GET /api/reviews/user
// @access  Private
exports.getUserReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ user: req.user._id })
      .populate('restaurant', 'name logo slug')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Customer)
exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, foodRating, deliveryRating, comment, images } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only update your own reviews', 403));
    }

    // Update fields
    if (rating) review.rating = rating;
    if (foodRating) review.foodRating = foodRating;
    if (deliveryRating) review.deliveryRating = deliveryRating;
    if (comment !== undefined) review.comment = comment;
    if (images) review.images = images;

    await review.save();
    await review.populate('user', 'name picture');

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Customer/Admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this review', 403));
    }

    await Review.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markReviewHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    const userId = req.user._id.toString();
    const helpfulIndex = review.helpful.findIndex(id => id.toString() === userId);

    if (helpfulIndex > -1) {
      // Remove if already marked as helpful
      review.helpful.splice(helpfulIndex, 1);
    } else {
      // Add to helpful
      review.helpful.push(req.user._id);
    }

    await review.save();

    res.json({
      success: true,
      data: {
        helpful: review.helpful.length,
        isHelpful: helpfulIndex === -1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restaurant responds to review
// @route   POST /api/reviews/:id/respond
// @access  Private (Restaurant)
exports.respondToReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const review = await Review.findById(id).populate('restaurant');

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // Check if user owns the restaurant
    if (review.restaurant.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to respond to this review', 403));
    }

    review.response = {
      text,
      date: new Date(),
    };

    await review.save();

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get review statistics for restaurant
// @route   GET /api/reviews/restaurant/:restaurantId/stats
// @access  Public
exports.getReviewStats = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const stats = await Review.aggregate([
      { $match: { restaurant: restaurantId, status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          averageFoodRating: { $avg: '$foodRating' },
          averageDeliveryRating: { $avg: '$deliveryRating' },
          totalReviews: { $sum: 1 },
          fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    if (stats.length === 0) {
      return res.json({
        success: true,
        data: {
          averageRating: 0,
          averageFoodRating: 0,
          averageDeliveryRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      });
    }

    const result = stats[0];

    res.json({
      success: true,
      data: {
        averageRating: Math.round(result.averageRating * 10) / 10,
        averageFoodRating: result.averageFoodRating ? Math.round(result.averageFoodRating * 10) / 10 : 0,
        averageDeliveryRating: result.averageDeliveryRating ? Math.round(result.averageDeliveryRating * 10) / 10 : 0,
        totalReviews: result.totalReviews,
        distribution: {
          5: result.fiveStars,
          4: result.fourStars,
          3: result.threeStars,
          2: result.twoStars,
          1: result.oneStar,
        },
        percentages: {
          5: Math.round((result.fiveStars / result.totalReviews) * 100),
          4: Math.round((result.fourStars / result.totalReviews) * 100),
          3: Math.round((result.threeStars / result.totalReviews) * 100),
          2: Math.round((result.twoStars / result.totalReviews) * 100),
          1: Math.round((result.oneStar / result.totalReviews) * 100),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if user can review order
// @route   GET /api/reviews/can-review/:orderId
// @access  Private
exports.canReviewOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    const canReview = (order.status === 'delivered' || order.status === 'completed') && !order.review;

    res.json({
      success: true,
      data: {
        canReview,
        hasReview: !!order.review,
        orderStatus: order.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
