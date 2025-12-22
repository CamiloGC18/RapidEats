const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
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
  addedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters'],
  },
}, {
  timestamps: true,
});

// Ensure a user can only favorite a restaurant once
favoriteSchema.index({ user: 1, restaurant: 1 }, { unique: true });
favoriteSchema.index({ user: 1, addedAt: -1 });

module.exports = mongoose.model('Favorite', favoriteSchema);
