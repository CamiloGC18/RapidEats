const express = require('express');
const {
  getAllRestaurants,
  getRestaurantBySlug,
  getFeaturedRestaurants,
  getRestaurantsByCategory,
} = require('../controllers/restaurantController');

const router = express.Router();

router.get('/', getAllRestaurants);
router.get('/featured', getFeaturedRestaurants);
router.get('/category/:category', getRestaurantsByCategory);
router.get('/:slug', getRestaurantBySlug);

module.exports = router;
