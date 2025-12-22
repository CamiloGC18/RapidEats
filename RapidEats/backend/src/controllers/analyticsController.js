const analyticsService = require('../services/analyticsService');
const { AppError } = require('../utils/errors');

/**
 * Obtener KPIs del dashboard
 */
exports.getDashboardKPIs = async (req, res, next) => {
  try {
    const kpis = await analyticsService.getDashboardKPIs();
    
    res.json({
      success: true,
      data: kpis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener gráfico de revenue
 */
exports.getRevenueChart = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const data = await analyticsService.getRevenueChart(parseInt(days));
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener órdenes por día de la semana
 */
exports.getOrdersByDayOfWeek = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const data = await analyticsService.getOrdersByDayOfWeek(parseInt(days));
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener top restaurantes
 */
exports.getTopRestaurants = async (req, res, next) => {
  try {
    const { limit = 10, days = 30 } = req.query;
    
    const data = await analyticsService.getTopRestaurants(parseInt(limit), parseInt(days));
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener distribución por categoría
 */
exports.getCategoryDistribution = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const data = await analyticsService.getCategoryDistribution(parseInt(days));
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener crecimiento de usuarios
 */
exports.getUserGrowth = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const data = await analyticsService.getUserGrowth(parseInt(days));
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener distribución de tiempos de entrega
 */
exports.getDeliveryTimeDistribution = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const data = await analyticsService.getDeliveryTimeDistribution(parseInt(days));
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de soporte
 */
exports.getSupportStats = async (req, res, next) => {
  try {
    const data = await analyticsService.getSupportStats();
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de lealtad
 */
exports.getLoyaltyStats = async (req, res, next) => {
  try {
    const data = await analyticsService.getLoyaltyStats();
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener órdenes activas
 */
exports.getActiveOrders = async (req, res, next) => {
  try {
    const orders = await analyticsService.getActiveOrders();
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Exportar datos para reporte
 */
exports.exportReport = async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'json', ...filters } = req.query;
    
    if (!startDate || !endDate) {
      throw new AppError('startDate y endDate son requeridos', 400);
    }
    
    const data = await analyticsService.exportReportData(
      new Date(startDate),
      new Date(endDate),
      filters
    );
    
    if (format === 'csv') {
      // Convertir a CSV (implementar)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
      // res.send(csvData);
      res.json({ message: 'CSV export not implemented yet' });
    } else {
      res.json({
        success: true,
        data
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener datos completos del dashboard
 */
exports.getCompleteDashboard = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const [
      kpis,
      revenueChart,
      ordersByDay,
      topRestaurants,
      categoryDist,
      userGrowth,
      deliveryTimeDist,
      supportStats,
      loyaltyStats,
      activeOrders
    ] = await Promise.all([
      analyticsService.getDashboardKPIs(),
      analyticsService.getRevenueChart(parseInt(days)),
      analyticsService.getOrdersByDayOfWeek(parseInt(days)),
      analyticsService.getTopRestaurants(10, parseInt(days)),
      analyticsService.getCategoryDistribution(parseInt(days)),
      analyticsService.getUserGrowth(parseInt(days)),
      analyticsService.getDeliveryTimeDistribution(parseInt(days)),
      analyticsService.getSupportStats(),
      analyticsService.getLoyaltyStats(),
      analyticsService.getActiveOrders()
    ]);
    
    res.json({
      success: true,
      data: {
        kpis,
        charts: {
          revenue: revenueChart,
          ordersByDay,
          topRestaurants,
          categoryDistribution: categoryDist,
          userGrowth,
          deliveryTimeDistribution: deliveryTimeDist
        },
        stats: {
          support: supportStats,
          loyalty: loyaltyStats
        },
        activeOrders
      }
    });
  } catch (error) {
    next(error);
  }
};
