const recommendationService = require('../services/recommendationService');
const { AppError } = require('../utils/errors');

/**
 * Obtener recomendaciones personalizadas para el usuario
 */
exports.getPersonalizedRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    const recommendations = await recommendationService.getPersonalizedRecommendations(
      userId,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener restaurantes trending
 */
exports.getTrendingRestaurants = async (req, res, next) => {
  try {
    const { limit = 10, category } = req.query;

    const trending = await recommendationService.getTrendingRecommendations(
      parseInt(limit),
      category
    );

    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener productos trending
 */
exports.getTrendingProducts = async (req, res, next) => {
  try {
    const { limit = 20, category } = req.query;

    const trending = await recommendationService.getTrendingProducts(
      parseInt(limit),
      category
    );

    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener sugerencias de reorder
 */
exports.getReorderSuggestions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { limit = 5 } = req.query;

    const suggestions = await recommendationService.getReorderSuggestions(
      userId,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};
