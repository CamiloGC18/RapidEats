const referralService = require('../services/referralService');
const { AppError } = require('../utils/errors');

/**
 * Obtener código de referido del usuario
 */
exports.getReferralCode = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const referralCode = await referralService.getReferralCode(userId);
    const shareUrls = referralService.generateShareUrls(referralCode);
    
    res.json({
      success: true,
      data: shareUrls
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Aplicar código de referido
 */
exports.applyReferralCode = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { referralCode } = req.body;
    
    if (!referralCode) {
      throw new AppError('Código de referido requerido', 400);
    }
    
    const result = await referralService.applyReferralCode(userId, referralCode);
    
    res.json({
      success: true,
      message: 'Código de referido aplicado exitosamente',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de referidos
 */
exports.getReferralStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const stats = await referralService.getReferralStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener social proof de un restaurante
 */
exports.getSocialProof = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    
    const socialProof = await referralService.getSocialProof(restaurantId);
    
    res.json({
      success: true,
      data: socialProof
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener trending en zona
 */
exports.getTrendingInZone = async (req, res, next) => {
  try {
    const { zoneId } = req.params;
    const { limit = 5 } = req.query;
    
    const trending = await referralService.getTrendingInZone(zoneId, parseInt(limit));
    
    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    next(error);
  }
};
