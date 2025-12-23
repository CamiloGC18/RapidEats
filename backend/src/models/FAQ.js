const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      'general',
      'orders',
      'payments',
      'delivery',
      'restaurants',
      'account',
      'loyalty',
      'technical'
    ]
  },
  question: {
    type: String,
    required: true,
    maxlength: 300
  },
  answer: {
    type: String,
    required: true,
    maxlength: 2000
  },
  language: {
    type: String,
    default: 'es',
    enum: ['es', 'en']
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  views: {
    type: Number,
    default: 0
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQ'
  }]
}, {
  timestamps: true
});

// Índices
faqSchema.index({ category: 1, order: 1 });
faqSchema.index({ isActive: 1 });
faqSchema.index({ question: 'text', answer: 'text' });
faqSchema.index({ language: 1 });

module.exports = mongoose.model('FAQ', faqSchema);
