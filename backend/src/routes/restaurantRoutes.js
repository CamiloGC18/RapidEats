const express = require('express');
const {
  getAllRestaurants,
  getRestaurantBySlug,
  getFeaturedRestaurants,
  getRestaurantsByCategory,
} = require('../controllers/restaurantController');
const { cacheHelper } = require('../config/redis');
const { validateQuery, schemas } = require('../utils/validation');

const router = express.Router();

// Cache de 5 minutos para restaurantes
router.get('/', 
  validateQuery(schemas.searchRestaurants),
  cacheHelper.middleware(300), 
  getAllRestaurants
);

router.get('/featured', 
  cacheHelper.middleware(600), 
  getFeaturedRestaurants
);

router.get('/category/:category', 
  cacheHelper.middleware(300), 
  getRestaurantsByCategory
);

router.get('/:slug', 
  cacheHelper.middleware(900), 
  getRestaurantBySlug
);

module.exports = router;
