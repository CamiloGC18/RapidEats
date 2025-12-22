const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const { authenticate } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/referrals/code - Obtener código de referido y URLs de compartir
router.get('/code', referralController.getReferralCode);

// POST /api/referrals/apply - Aplicar código de referido
router.post('/apply', referralController.applyReferralCode);

// GET /api/referrals/stats - Obtener estadísticas de referidos
router.get('/stats', referralController.getReferralStats);

// GET /api/referrals/social-proof/:restaurantId - Obtener social proof de restaurante
router.get('/social-proof/:restaurantId', referralController.getSocialProof);

// GET /api/referrals/trending/:zoneId - Obtener trending en zona
router.get('/trending/:zoneId', referralController.getTrendingInZone);

module.exports = router;
