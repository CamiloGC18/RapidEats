const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    picture: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['customer', 'restaurant', 'admin', 'delivery'],
      default: 'customer',
    },
    addresses: [
      {
        label: String,
        address: String,
        zone: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    telegramUserId: {
      type: Number,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
