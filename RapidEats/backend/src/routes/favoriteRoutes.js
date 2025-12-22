const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
  updateFavorite,
  getFavoriteStats,
} = require('../controllers/favoriteController');

// All favorite routes require authentication
router.use(authenticate);

router.get('/', getFavorites);
router.get('/stats', getFavoriteStats);
router.get('/check/:restaurantId', checkFavorite);
router.post('/', addFavorite);
router.patch('/:restaurantId', updateFavorite);
router.delete('/:restaurantId', removeFavorite);

module.exports = router;
