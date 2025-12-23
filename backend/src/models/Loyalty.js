const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  tier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  lifetimePoints: {
    type: Number,
    default: 0,
    min: 0
  },
  pointsHistory: [{
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'bonus', 'expired'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  challenges: [{
    challengeId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    target: Number,
    current: {
      type: Number,
      default: 0
    },
    reward: Number,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    expiresAt: Date
  }],
  rewards: [{
    rewardId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    type: {
      type: String,
      enum: ['discount', 'free_delivery', 'voucher'],
      required: true
    },
    value: Number,
    used: {
      type: Boolean,
      default: false
    },
    usedAt: Date,
    expiresAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  statistics: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    favoriteRestaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    lastOrderDate: Date,
    joinedDate: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Índices
loyaltySchema.index({ user: 1 });
loyaltySchema.index({ tier: 1 });
loyaltySchema.index({ 'challenges.expiresAt': 1 });

// Método para actualizar tier basado en puntos lifetime
loyaltySchema.methods.updateTier = function() {
  const points = this.lifetimePoints;
  
  if (points >= 6000) {
    this.tier = 'Platinum';
  } else if (points >= 3000) {
    this.tier = 'Gold';
  } else if (points >= 1000) {
    this.tier = 'Silver';
  } else {
    this.tier = 'Bronze';
  }
};

// Método para agregar puntos
loyaltySchema.methods.addPoints = function(amount, reason, orderId = null) {
  this.points += amount;
  this.lifetimePoints += amount;
  
  this.pointsHistory.push({
    type: 'earned',
    amount,
    reason,
    order: orderId
  });
  
  this.updateTier();
};

// Método para agregar puntos bonus
loyaltySchema.methods.addBonusPoints = function(amount, reason) {
  this.points += amount;
  this.lifetimePoints += amount;
  
  this.pointsHistory.push({
    type: 'bonus',
    amount,
    reason
  });
  
  this.updateTier();
};

// Método para redimir puntos
loyaltySchema.methods.redeemPoints = function(amount, reason) {
  if (this.points < amount) {
    throw new Error('Puntos insuficientes');
  }
  
  this.points -= amount;
  
  this.pointsHistory.push({
    type: 'redeemed',
    amount: -amount,
    reason
  });
};

// Método para obtener descuento según tier
loyaltySchema.methods.getTierDiscount = function() {
  const discounts = {
    Bronze: 0,
    Silver: 0.05, // 5%
    Gold: 0.10,   // 10%
    Platinum: 0.15 // 15%
  };
  
  return discounts[this.tier] || 0;
};

// Método para verificar si tiene envío gratis
loyaltySchema.methods.hasFreeDelivery = function() {
  return this.tier === 'Platinum';
};

// Método para actualizar progreso de challenge
loyaltySchema.methods.updateChallengeProgress = function(challengeId, increment = 1) {
  const challenge = this.challenges.find(c => c.challengeId === challengeId && !c.completed);
  
  if (challenge) {
    challenge.current += increment;
    
    if (challenge.current >= challenge.target) {
      challenge.completed = true;
      challenge.completedAt = new Date();
      
      // Agregar reward points
      if (challenge.reward) {
        this.addBonusPoints(challenge.reward, `Completar desafío: ${challenge.name}`);
      }
      
      return true;
    }
  }
  
  return false;
};

// Método para agregar challenge
loyaltySchema.methods.addChallenge = function(challengeData) {
  // Verificar si ya existe
  const exists = this.challenges.find(
    c => c.challengeId === challengeData.challengeId && !c.completed
  );
  
  if (!exists) {
    this.challenges.push(challengeData);
  }
};

// Método para agregar reward
loyaltySchema.methods.addReward = function(rewardData) {
  this.rewards.push(rewardData);
};

// Método para usar reward
loyaltySchema.methods.useReward = function(rewardId) {
  const reward = this.rewards.find(r => r.rewardId === rewardId && !r.used);
  
  if (!reward) {
    throw new Error('Reward no encontrado o ya usado');
  }
  
  if (reward.expiresAt && reward.expiresAt < new Date()) {
    throw new Error('Reward expirado');
  }
  
  reward.used = true;
  reward.usedAt = new Date();
  
  return reward;
};

// Método para actualizar estadísticas
loyaltySchema.methods.updateStatistics = function(order) {
  this.statistics.totalOrders += 1;
  this.statistics.totalSpent += order.totals.grandTotal;
  this.statistics.lastOrderDate = new Date();
};

// Hook pre-save para limpiar challenges y rewards expirados
loyaltySchema.pre('save', function(next) {
  const now = new Date();
  
  // Filtrar challenges expirados
  this.challenges = this.challenges.filter(c => {
    return !c.expiresAt || c.expiresAt > now || c.completed;
  });
  
  // Filtrar rewards expirados no usados
  this.rewards = this.rewards.filter(r => {
    return !r.expiresAt || r.expiresAt > now || r.used;
  });
  
  next();
});

// Virtual para obtener puntos próximos a expirar
loyaltySchema.virtual('nextTierProgress').get(function() {
  const tiers = {
    Bronze: { next: 'Silver', required: 1000 },
    Silver: { next: 'Gold', required: 3000 },
    Gold: { next: 'Platinum', required: 6000 },
    Platinum: { next: null, required: null }
  };
  
  const tierInfo = tiers[this.tier];
  
  if (!tierInfo.next) {
    return { nextTier: null, pointsNeeded: 0, progress: 100 };
  }
  
  const pointsNeeded = tierInfo.required - this.lifetimePoints;
  const progress = (this.lifetimePoints / tierInfo.required) * 100;
  
  return {
    nextTier: tierInfo.next,
    pointsNeeded: Math.max(0, pointsNeeded),
    progress: Math.min(100, progress)
  };
});

loyaltySchema.set('toJSON', { virtuals: true });
loyaltySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Loyalty', loyaltySchema);
