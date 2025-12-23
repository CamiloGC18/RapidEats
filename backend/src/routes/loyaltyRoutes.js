const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const { authenticate, authorize } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/loyalty/profile - Obtener perfil de loyalty
router.get('/profile', loyaltyController.getLoyaltyProfile);

// GET /api/loyalty/history - Obtener historial de puntos
router.get('/history', loyaltyController.getPointsHistory);

// POST /api/loyalty/redeem - Redimir puntos
router.post('/redeem', loyaltyController.redeemPoints);

// GET /api/loyalty/challenges - Obtener challenges activos
router.get('/challenges', loyaltyController.getChallenges);

// GET /api/loyalty/rewards - Obtener rewards disponibles
router.get('/rewards', loyaltyController.getRewards);

// POST /api/loyalty/rewards/:rewardId/use - Usar reward
router.post('/rewards/:rewardId/use', loyaltyController.useReward);

// GET /api/loyalty/tiers - Obtener información de tiers
router.get('/tiers', loyaltyController.getTierBenefits);

// Admin routes
router.get('/stats', authorize('admin'), loyaltyController.getLoyaltyStats);
router.post('/bonus', authorize('admin'), loyaltyController.addBonusPoints);

module.exports = router;
