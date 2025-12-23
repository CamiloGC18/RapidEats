const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const Review = require('../models/Review');
const SupportTicket = require('../models/SupportTicket');
const Loyalty = require('../models/Loyalty');

/**
 * Servicio de Analytics Avanzado
 */

class AnalyticsService {
  /**
   * Obtener KPIs principales del dashboard
   */
  async getDashboardKPIs(startDate, endDate) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Revenue
      const revenueToday = await this.getRevenue(today, now);
      const revenueYesterday = await this.getRevenue(yesterday, today);
      const revenueThisWeek = await this.getRevenue(lastWeek, now);
      const revenueThisMonth = await this.getRevenue(lastMonth, now);
      
      // Orders
      const ordersToday = await Order.countDocuments({
        createdAt: { $gte: today },
        status: { $ne: 'cancelled' }
      });
      const ordersYesterday = await Order.countDocuments({
        createdAt: { $gte: yesterday, $lt: today },
        status: { $ne: 'cancelled' }
      });
      
      // Active Users
      const activeUsersToday = await Order.distinct('customerId', {
        createdAt: { $gte: today }
      });
      const activeUsersThisWeek = await Order.distinct('customerId', {
        createdAt: { $gte: lastWeek }
      });
      
      // Conversion Rate (usuarios que ordenaron vs usuarios totales)
      const totalUsers = await User.countDocuments({ role: 'customer' });
      const usersWithOrders = await Order.distinct('customerId');
      const conversionRate = (usersWithOrders.length / totalUsers) * 100;
      
      // Average Delivery Time
      const avgDeliveryTime = await this.getAverageDeliveryTime(lastWeek, now);
      
      // Platform Rating
      const platformRating = await Review.aggregate([
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' }
          }
        }
      ]);
      
      return {
        revenue: {
          today: revenueToday,
          yesterday: revenueYesterday,
          thisWeek: revenueThisWeek,
          thisMonth: revenueThisMonth,
          changePercent: this.calculateChangePercent(revenueToday, revenueYesterday)
        },
        orders: {
          today: ordersToday,
          yesterday: ordersYesterday,
          changePercent: this.calculateChangePercent(ordersToday, ordersYesterday)
        },
        activeUsers: {
          today: activeUsersToday.length,
          thisWeek: activeUsersThisWeek.length
        },
        conversionRate: conversionRate.toFixed(2),
        avgDeliveryTime: avgDeliveryTime.toFixed(0),
        platformRating: platformRating[0]?.avgRating?.toFixed(1) || 0
      };
    } catch (error) {
      console.error('Error getting dashboard KPIs:', error);
      throw error;
    }
  }

  /**
   * Obtener revenue en un rango de fechas
   */
  async getRevenue(startDate, endDate) {
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totals.grandTotal' }
        }
      }
    ]);
    
    return result[0]?.total || 0;
  }

  /**
   * Obtener tiempo promedio de entrega
   */
  async getAverageDeliveryTime(startDate, endDate) {
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'delivered',
          deliveredAt: { $exists: true }
        }
      },
      {
        $project: {
          deliveryTime: {
            $divide: [
              { $subtract: ['$deliveredAt', '$createdAt'] },
              1000 * 60 // convertir a minutos
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$deliveryTime' }
        }
      }
    ]);
    
    return result[0]?.avgTime || 0;
  }

  /**
   * Calcular porcentaje de cambio
   */
  calculateChangePercent(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  }

  /**
   * Obtener datos para gráfico de revenue (últimos 30 días)
   */
  async getRevenueChart(days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      
      const data = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'delivered'
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            revenue: { $sum: '$totals.grandTotal' },
            orders: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]);
      
      return data.map(d => ({
        date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
        revenue: d.revenue,
        orders: d.orders
      }));
    } catch (error) {
      console.error('Error getting revenue chart:', error);
      throw error;
    }
  }

  /**
   * Obtener órdenes por día de la semana
   */
  async getOrdersByDayOfWeek(days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      
      const data = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            orders: { $sum: 1 },
            revenue: { $sum: '$totals.grandTotal' }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);
      
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      
      return data.map(d => ({
        day: dayNames[d._id - 1],
        orders: d.orders,
        revenue: d.revenue
      }));
    } catch (error) {
      console.error('Error getting orders by day of week:', error);
      throw error;
    }
  }

  /**
   * Top restaurantes
   */
  async getTopRestaurants(limit = 10, days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const data = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: 'delivered'
          }
        },
        {
          $group: {
            _id: '$restaurantId',
            orders: { $sum: 1 },
            revenue: { $sum: '$totals.grandTotal' }
          }
        },
        {
          $sort: { revenue: -1 }
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'restaurants',
            localField: '_id',
            foreignField: '_id',
            as: 'restaurant'
          }
        },
        {
          $unwind: '$restaurant'
        }
      ]);
      
      return data.map(d => ({
        restaurant: d.restaurant,
        orders: d.orders,
        revenue: d.revenue
      }));
    } catch (error) {
      console.error('Error getting top restaurants:', error);
      throw error;
    }
  }

  /**
   * Distribución por categoría
   */
  async getCategoryDistribution(days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const data = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: 'delivered'
          }
        },
        {
          $lookup: {
            from: 'restaurants',
            localField: 'restaurantId',
            foreignField: '_id',
            as: 'restaurant'
          }
        },
        {
          $unwind: '$restaurant'
        },
        {
          $group: {
            _id: '$restaurant.category',
            orders: { $sum: 1 },
            revenue: { $sum: '$totals.grandTotal' }
          }
        },
        {
          $sort: { orders: -1 }
        }
      ]);
      
      return data;
    } catch (error) {
      console.error('Error getting category distribution:', error);
      throw error;
    }
  }

  /**
   * Crecimiento de usuarios
   */
  async getUserGrowth(days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      
      const data = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            role: 'customer'
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            newUsers: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]);
      
      // Calcular usuarios acumulados
      let cumulative = 0;
      return data.map(d => {
        cumulative += d.newUsers;
        return {
          date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
          newUsers: d.newUsers,
          totalUsers: cumulative
        };
      });
    } catch (error) {
      console.error('Error getting user growth:', error);
      throw error;
    }
  }

  /**
   * Distribución de tiempos de entrega (histogram)
   */
  async getDeliveryTimeDistribution(days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const data = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: 'delivered',
            deliveredAt: { $exists: true }
          }
        },
        {
          $project: {
            deliveryTime: {
              $divide: [
                { $subtract: ['$deliveredAt', '$createdAt'] },
                1000 * 60 // minutos
              ]
            }
          }
        },
        {
          $bucket: {
            groupBy: '$deliveryTime',
            boundaries: [0, 15, 30, 45, 60, 90, 120, 180],
            default: '180+',
            output: {
              count: { $sum: 1 }
            }
          }
        }
      ]);
      
      const labels = ['0-15 min', '15-30 min', '30-45 min', '45-60 min', '60-90 min', '90-120 min', '120-180 min', '180+ min'];
      
      return data.map((d, index) => ({
        range: labels[index] || '180+ min',
        count: d.count
      }));
    } catch (error) {
      console.error('Error getting delivery time distribution:', error);
      throw error;
    }
  }

  /**
   * Estadísticas de soporte
   */
  async getSupportStats() {
    try {
      const stats = await SupportTicket.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgResponseTime: { $avg: '$sla.responseTime' },
            avgResolutionTime: { $avg: '$sla.resolutionTime' }
          }
        }
      ]);
      
      const satisfaction = await SupportTicket.aggregate([
        {
          $match: {
            'resolution.customerSatisfaction.rating': { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$resolution.customerSatisfaction.rating' },
            total: { $sum: 1 }
          }
        }
      ]);
      
      return {
        byStatus: stats,
        satisfaction: satisfaction[0] || { avgRating: 0, total: 0 }
      };
    } catch (error) {
      console.error('Error getting support stats:', error);
      throw error;
    }
  }

  /**
   * Estadísticas de lealtad
   */
  async getLoyaltyStats() {
    try {
      const tierDistribution = await Loyalty.aggregate([
        {
          $group: {
            _id: '$tier',
            count: { $sum: 1 },
            avgPoints: { $avg: '$points' }
          }
        }
      ]);
      
      const totalPoints = await Loyalty.aggregate([
        {
          $group: {
            _id: null,
            totalIssued: { $sum: '$lifetimePoints' },
            totalActive: { $sum: '$points' }
          }
        }
      ]);
      
      return {
        tierDistribution,
        totalPoints: totalPoints[0] || { totalIssued: 0, totalActive: 0 }
      };
    } catch (error) {
      console.error('Error getting loyalty stats:', error);
      throw error;
    }
  }

  /**
   * Obtener órdenes activas en tiempo real
   */
  async getActiveOrders() {
    try {
      const orders = await Order.find({
        status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'in_transit'] }
      })
        .populate('restaurantId', 'name address zone')
        .populate('customerId', 'name phone')
        .populate('deliveryId', 'name phone')
        .sort({ createdAt: -1 })
        .limit(50);
      
      return orders;
    } catch (error) {
      console.error('Error getting active orders:', error);
      throw error;
    }
  }

  /**
   * Exportar datos para reporte
   */
  async exportReportData(startDate, endDate, filters = {}) {
    try {
      const query = {
        createdAt: { $gte: startDate, $lte: endDate }
      };
      
      if (filters.restaurantId) query.restaurantId = filters.restaurantId;
      if (filters.category) {
        // Necesitaría join con restaurants
      }
      if (filters.zone) {
        // Necesitaría join con restaurants
      }
      
      const orders = await Order.find(query)
        .populate('restaurantId', 'name category zone')
        .populate('customerId', 'name email')
        .sort({ createdAt: -1 });
      
      return orders;
    } catch (error) {
      console.error('Error exporting report data:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
