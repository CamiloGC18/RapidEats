const Loyalty = require('../models/Loyalty');
const Order = require('../models/Order');

/**
 * Sistema de Puntos de Fidelización
 */

class LoyaltyService {
  /**
   * Obtener o crear perfil de loyalty para usuario
   */
  async getOrCreateLoyalty(userId) {
    let loyalty = await Loyalty.findOne({ user: userId })
      .populate('statistics.favoriteRestaurant');
    
    if (!loyalty) {
      loyalty = await Loyalty.create({
        user: userId,
        points: 100, // Bonus de bienvenida
        lifetimePoints: 100,
        pointsHistory: [{
          type: 'bonus',
          amount: 100,
          reason: 'Bonus de bienvenida'
        }]
      });
      
      // Agregar challenges iniciales
      await this.assignMonthlyChallenges(loyalty);
    }
    
    return loyalty;
  }

  /**
   * Calcular puntos por orden
   * 1 punto por cada $10 pesos gastados
   */
  calculatePointsForOrder(orderTotal) {
    return Math.floor(orderTotal / 10);
  }

  /**
   * Agregar puntos por orden completada
   */
  async addPointsForOrder(userId, order) {
    try {
      const loyalty = await this.getOrCreateLoyalty(userId);
      
      // Calcular puntos
      const points = this.calculatePointsForOrder(order.totals.grandTotal);
      
      // Agregar puntos
      loyalty.addPoints(
        points,
        `Orden #${order.orderNumber}`,
        order._id
      );
      
      // Actualizar estadísticas
      loyalty.updateStatistics(order);
      
      // Actualizar progreso de challenges
      this.updateChallengesForOrder(loyalty, order);
      
      await loyalty.save();
      
      return loyalty;
    } catch (error) {
      console.error('Error adding points for order:', error);
      throw error;
    }
  }

  /**
   * Actualizar challenges basado en la orden
   */
  updateChallengesForOrder(loyalty, order) {
    // Challenge: Ordena 5 veces este mes
    loyalty.updateChallengeProgress('monthly_orders_5', 1);
    
    // Challenge: Ordena 10 veces este mes
    loyalty.updateChallengeProgress('monthly_orders_10', 1);
    
    // Challenge: Prueba 3 restaurantes nuevos
    // (necesitaría lógica adicional para tracking de restaurantes únicos)
  }

  /**
   * Agregar puntos bonus por referido
   */
  async addReferralBonus(userId, referredUserId) {
    try {
      const loyalty = await this.getOrCreateLoyalty(userId);
      
      loyalty.addBonusPoints(
        50,
        `Referir a usuario`
      );
      
      await loyalty.save();
      
      // También dar bonus al usuario referido
      const referredLoyalty = await this.getOrCreateLoyalty(referredUserId);
      referredLoyalty.addBonusPoints(
        50,
        'Bonus de referido'
      );
      await referredLoyalty.save();
      
      return loyalty;
    } catch (error) {
      console.error('Error adding referral bonus:', error);
      throw error;
    }
  }

  /**
   * Redimir puntos por descuento
   * 100 puntos = $10 descuento
   */
  async redeemPoints(userId, points) {
    try {
      if (points % 100 !== 0) {
        throw new Error('Los puntos deben ser múltiplos de 100');
      }
      
      const loyalty = await this.getOrCreateLoyalty(userId);
      
      if (loyalty.points < points) {
        throw new Error('Puntos insuficientes');
      }
      
      const discountAmount = points / 10; // 100 puntos = $10
      
      loyalty.redeemPoints(points, `Redención de ${points} puntos`);
      
      // Crear reward
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 días de validez
      
      loyalty.addReward({
        rewardId: `DISC${Date.now()}`,
        name: `Descuento de $${discountAmount}`,
        description: `Redimido con ${points} puntos`,
        type: 'discount',
        value: discountAmount,
        expiresAt
      });
      
      await loyalty.save();
      
      return {
        loyalty,
        reward: loyalty.rewards[loyalty.rewards.length - 1]
      };
    } catch (error) {
      console.error('Error redeeming points:', error);
      throw error;
    }
  }

  /**
   * Usar reward en una orden
   */
  async useReward(userId, rewardId) {
    try {
      const loyalty = await this.getOrCreateLoyalty(userId);
      const reward = loyalty.useReward(rewardId);
      
      await loyalty.save();
      
      return reward;
    } catch (error) {
      console.error('Error using reward:', error);
      throw error;
    }
  }

  /**
   * Asignar challenges mensuales
   */
  async assignMonthlyChallenges(loyalty) {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const challenges = [
      {
        challengeId: 'monthly_orders_5',
        name: 'Ordena 5 veces este mes',
        description: 'Completa 5 órdenes durante este mes',
        target: 5,
        reward: 200,
        expiresAt: endOfMonth
      },
      {
        challengeId: 'monthly_orders_10',
        name: 'Ordena 10 veces este mes',
        description: 'Completa 10 órdenes durante este mes',
        target: 10,
        reward: 500,
        expiresAt: endOfMonth
      },
      {
        challengeId: 'try_new_restaurants',
        name: 'Prueba 3 restaurantes nuevos',
        description: 'Ordena de 3 restaurantes diferentes que no hayas probado antes',
        target: 3,
        reward: 150,
        expiresAt: endOfMonth
      }
    ];
    
    challenges.forEach(challenge => {
      loyalty.addChallenge(challenge);
    });
    
    await loyalty.save();
  }

  /**
   * Resetear challenges mensuales (ejecutar con cron job)
   */
  async resetMonthlyChallenges() {
    try {
      const allLoyalties = await Loyalty.find({});
      
      for (const loyalty of allLoyalties) {
        // Limpiar challenges completados y expirados
        loyalty.challenges = loyalty.challenges.filter(c => 
          !c.completed && c.expiresAt > new Date()
        );
        
        // Asignar nuevos challenges
        await this.assignMonthlyChallenges(loyalty);
      }
      
      console.log('Monthly challenges reset completed');
    } catch (error) {
      console.error('Error resetting monthly challenges:', error);
    }
  }

  /**
   * Obtener beneficios del tier
   */
  getTierBenefits(tier) {
    const benefits = {
      Bronze: {
        discount: 0,
        freeDelivery: false,
        prioritySupport: false,
        exclusiveOffers: false
      },
      Silver: {
        discount: 5, // 5%
        freeDelivery: false,
        prioritySupport: false,
        exclusiveOffers: true
      },
      Gold: {
        discount: 10, // 10%
        freeDelivery: true, // ocasional
        prioritySupport: true,
        exclusiveOffers: true
      },
      Platinum: {
        discount: 15, // 15%
        freeDelivery: true, // siempre
        prioritySupport: true,
        exclusiveOffers: true
      }
    };
    
    return benefits[tier] || benefits.Bronze;
  }

  /**
   * Obtener historial de puntos
   */
  async getPointsHistory(userId, limit = 50) {
    try {
      const loyalty = await this.getOrCreateLoyalty(userId);
      
      return loyalty.pointsHistory
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting points history:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas del programa de lealtad
   */
  async getLoyaltyStats() {
    try {
      const stats = await Loyalty.aggregate([
        {
          $group: {
            _id: '$tier',
            count: { $sum: 1 },
            avgPoints: { $avg: '$points' },
            totalPoints: { $sum: '$points' }
          }
        }
      ]);
      
      const totalUsers = await Loyalty.countDocuments();
      const totalPoints = await Loyalty.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$points' }
          }
        }
      ]);
      
      return {
        totalUsers,
        totalPointsIssued: totalPoints[0]?.total || 0,
        tierDistribution: stats
      };
    } catch (error) {
      console.error('Error getting loyalty stats:', error);
      throw error;
    }
  }
}

module.exports = new LoyaltyService();
