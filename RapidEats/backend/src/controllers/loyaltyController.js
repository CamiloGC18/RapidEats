const loyaltyService = require('../services/loyaltyService');
const { AppError } = require('../utils/errors');

/**
 * Obtener perfil de loyalty del usuario
 */
exports.getLoyaltyProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const loyalty = await loyaltyService.getOrCreateLoyalty(userId);
    
    const benefits = loyaltyService.getTierBenefits(loyalty.tier);
    
    res.json({
      success: true,
      data: {
        loyalty,
        benefits
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener historial de puntos
 */
exports.getPointsHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { limit = 50 } = req.query;
    
    const history = await loyaltyService.getPointsHistory(userId, parseInt(limit));
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Redimir puntos por descuento
 */
exports.redeemPoints = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { points } = req.body;
    
    if (!points || points <= 0) {
      throw new AppError('Cantidad de puntos inválida', 400);
    }
    
    const result = await loyaltyService.redeemPoints(userId, points);
    
    res.json({
      success: true,
      message: 'Puntos redimidos exitosamente',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener challenges activos
 */
exports.getChallenges = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const loyalty = await loyaltyService.getOrCreateLoyalty(userId);
    
    const activeChallenges = loyalty.challenges.filter(c => !c.completed);
    const completedChallenges = loyalty.challenges.filter(c => c.completed);
    
    res.json({
      success: true,
      data: {
        active: activeChallenges,
        completed: completedChallenges
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener rewards disponibles
 */
exports.getRewards = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const loyalty = await loyaltyService.getOrCreateLoyalty(userId);
    
    const availableRewards = loyalty.rewards.filter(r => !r.used && (!r.expiresAt || r.expiresAt > new Date()));
    const usedRewards = loyalty.rewards.filter(r => r.used);
    
    res.json({
      success: true,
      data: {
        available: availableRewards,
        used: usedRewards
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Usar reward
 */
exports.useReward = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { rewardId } = req.params;
    
    const reward = await loyaltyService.useReward(userId, rewardId);
    
    res.json({
      success: true,
      message: 'Reward usado exitosamente',
      data: reward
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener beneficios del tier
 */
exports.getTierBenefits = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const loyalty = await loyaltyService.getOrCreateLoyalty(userId);
    const benefits = loyaltyService.getTierBenefits(loyalty.tier);
    
    // Información de todos los tiers
    const allTiers = ['Bronze', 'Silver', 'Gold', 'Platinum'].map(tier => ({
      tier,
      benefits: loyaltyService.getTierBenefits(tier),
      required: tier === 'Bronze' ? 0 : tier === 'Silver' ? 1000 : tier === 'Gold' ? 3000 : 6000,
      current: loyalty.tier === tier
    }));
    
    res.json({
      success: true,
      data: {
        currentTier: loyalty.tier,
        currentBenefits: benefits,
        allTiers
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Obtener estadísticas del programa de lealtad
 */
exports.getLoyaltyStats = async (req, res, next) => {
  try {
    const stats = await loyaltyService.getLoyaltyStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Agregar puntos bonus a usuario
 */
exports.addBonusPoints = async (req, res, next) => {
  try {
    const { userId, points, reason } = req.body;
    
    if (!userId || !points || !reason) {
      throw new AppError('userId, points y reason son requeridos', 400);
    }
    
    const loyalty = await loyaltyService.getOrCreateLoyalty(userId);
    loyalty.addBonusPoints(points, reason);
    await loyalty.save();
    
    res.json({
      success: true,
      message: 'Puntos bonus agregados exitosamente',
      data: loyalty
    });
  } catch (error) {
    next(error);
  }
};
