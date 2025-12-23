const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticate } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/recommendations/personalized - Obtener recomendaciones personalizadas
router.get('/personalized', recommendationController.getPersonalizedRecommendations);

// GET /api/recommendations/trending/restaurants - Obtener restaurantes trending
router.get('/trending/restaurants', recommendationController.getTrendingRestaurants);

// GET /api/recommendations/trending/products - Obtener productos trending
router.get('/trending/products', recommendationController.getTrendingProducts);

// GET /api/recommendations/reorder - Obtener sugerencias de reorder
router.get('/reorder', recommendationController.getReorderSuggestions);

module.exports = router;
