const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middlewares/auth');

// Todas las rutas requieren autenticación y rol admin
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard completo
router.get('/dashboard', analyticsController.getCompleteDashboard);

// KPIs
router.get('/kpis', analyticsController.getDashboardKPIs);

// Charts
router.get('/charts/revenue', analyticsController.getRevenueChart);
router.get('/charts/orders-by-day', analyticsController.getOrdersByDayOfWeek);
router.get('/charts/top-restaurants', analyticsController.getTopRestaurants);
router.get('/charts/category-distribution', analyticsController.getCategoryDistribution);
router.get('/charts/user-growth', analyticsController.getUserGrowth);
router.get('/charts/delivery-time', analyticsController.getDeliveryTimeDistribution);

// Stats
router.get('/stats/support', analyticsController.getSupportStats);
router.get('/stats/loyalty', analyticsController.getLoyaltyStats);

// Real-time
router.get('/active-orders', analyticsController.getActiveOrders);

// Export
router.get('/export', analyticsController.exportReport);

module.exports = router;
