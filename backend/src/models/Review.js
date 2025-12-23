const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant is required'],
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must not exceed 5'],
  },
  foodRating: {
    type: Number,
    min: [1, 'Food rating must be at least 1'],
    max: [5, 'Food rating must not exceed 5'],
  },
  deliveryRating: {
    type: Number,
    min: [1, 'Delivery rating must be at least 1'],
    max: [5, 'Delivery rating must not exceed 5'],
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  images: [{
    type: String,
  }],
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  response: {
    text: {
      type: String,
      trim: true,
      maxlength: [500, 'Response cannot exceed 500 characters'],
    },
    date: {
      type: Date,
    },
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ user: 1, restaurant: 1 }, { unique: true });
reviewSchema.index({ rating: 1 });

// Update restaurant average rating when review is saved
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const Restaurant = mongoose.model('Restaurant');
  
  const stats = await Review.aggregate([
    { $match: { restaurant: this.restaurant, status: 'approved' } },
    {
      $group: {
        _id: '$restaurant',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        avgFoodRating: { $avg: '$foodRating' },
        avgDeliveryRating: { $avg: '$deliveryRating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Restaurant.findByIdAndUpdate(this.restaurant, {
      'ratings.average': Math.round(stats[0].averageRating * 10) / 10,
      'ratings.count': stats[0].totalReviews,
      'ratings.food': stats[0].avgFoodRating ? Math.round(stats[0].avgFoodRating * 10) / 10 : 0,
      'ratings.delivery': stats[0].avgDeliveryRating ? Math.round(stats[0].avgDeliveryRating * 10) / 10 : 0,
    });
  }
});

// Update restaurant rating when review is deleted
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const Review = mongoose.model('Review');
    const Restaurant = mongoose.model('Restaurant');
    
    const stats = await Review.aggregate([
      { $match: { restaurant: doc.restaurant, status: 'approved' } },
      {
        $group: {
          _id: '$restaurant',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          avgFoodRating: { $avg: '$foodRating' },
          avgDeliveryRating: { $avg: '$deliveryRating' },
        },
      },
    ]);

    if (stats.length > 0) {
      await Restaurant.findByIdAndUpdate(doc.restaurant, {
        'ratings.average': Math.round(stats[0].averageRating * 10) / 10,
        'ratings.count': stats[0].totalReviews,
        'ratings.food': stats[0].avgFoodRating ? Math.round(stats[0].avgFoodRating * 10) / 10 : 0,
        'ratings.delivery': stats[0].avgDeliveryRating ? Math.round(stats[0].avgDeliveryRating * 10) / 10 : 0,
      });
    } else {
      await Restaurant.findByIdAndUpdate(doc.restaurant, {
        'ratings.average': 0,
        'ratings.count': 0,
        'ratings.food': 0,
        'ratings.delivery': 0,
      });
    }
  }
});

// Virtual for helpful count
reviewSchema.virtual('helpfulCount').get(function() {
  return this.helpful ? this.helpful.length : 0;
});

reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema);
