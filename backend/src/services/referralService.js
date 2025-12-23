const User = require('../models/User');
const Order = require('../models/Order');
const loyaltyService = require('./loyaltyService');

/**
 * Sistema de Referidos
 */

class ReferralService {
  /**
   * Obtener código de referido del usuario
   */
  async getReferralCode(userId) {
    try {
      const user = await User.findById(userId).select('referralCode');
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      // Si no tiene código, crear uno
      if (!user.referralCode) {
        await user.save(); // El pre-save hook generará el código
        await user.reload();
      }
      
      return user.referralCode;
    } catch (error) {
      console.error('Error getting referral code:', error);
      throw error;
    }
  }

  /**
   * Aplicar código de referido
   */
  async applyReferralCode(userId, referralCode) {
    try {
      // Verificar que el usuario no haya sido referido ya
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      if (user.referredBy) {
        throw new Error('Ya has sido referido por otro usuario');
      }
      
      // Buscar el usuario que refiere
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      
      if (!referrer) {
        throw new Error('Código de referido inválido');
      }
      
      if (referrer._id.toString() === userId.toString()) {
        throw new Error('No puedes usar tu propio código de referido');
      }
      
      // Aplicar referido
      user.referredBy = referrer._id;
      await user.save();
      
      // Agregar a la lista de referidos del referrer
      referrer.referrals.push({
        user: userId,
        completedFirstOrder: false
      });
      await referrer.save();
      
      return {
        success: true,
        referrer: {
          name: referrer.name,
          id: referrer._id
        }
      };
    } catch (error) {
      console.error('Error applying referral code:', error);
      throw error;
    }
  }

  /**
   * Procesar recompensa de referido cuando el usuario referido completa su primera orden
   */
  async processReferralReward(userId, orderId) {
    try {
      const user = await User.findById(userId).populate('referredBy');
      
      if (!user || !user.referredBy) {
        return; // No tiene referrer
      }
      
      // Verificar si es la primera orden del usuario
      const orderCount = await Order.countDocuments({
        customerId: userId,
        status: 'delivered'
      });
      
      if (orderCount !== 1) {
        return; // No es la primera orden
      }
      
      // Verificar si ya se procesó el reward
      const referrer = user.referredBy;
      const referralEntry = referrer.referrals.find(
        r => r.user.toString() === userId.toString()
      );
      
      if (referralEntry && referralEntry.completedFirstOrder) {
        return; // Ya se procesó
      }
      
      // Agregar puntos bonus para ambos usuarios
      const REFERRAL_BONUS = 50;
      
      // Bonus para el referrer
      await loyaltyService.addReferralBonus(referrer._id, userId);
      
      // Bonus para el usuario referido
      const referredLoyalty = await loyaltyService.getOrCreateLoyalty(userId);
      referredLoyalty.addBonusPoints(REFERRAL_BONUS, 'Completar primera orden como referido');
      await referredLoyalty.save();
      
      // Marcar como completado
      if (referralEntry) {
        referralEntry.completedFirstOrder = true;
        await referrer.save();
      }
      
      console.log(`Referral reward processed for user ${userId} and referrer ${referrer._id}`);
    } catch (error) {
      console.error('Error processing referral reward:', error);
    }
  }

  /**
   * Obtener estadísticas de referidos del usuario
   */
  async getReferralStats(userId) {
    try {
      const user = await User.findById(userId)
        .populate('referrals.user', 'name email createdAt')
        .populate('referredBy', 'name email');
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      const totalReferrals = user.referrals.length;
      const completedReferrals = user.referrals.filter(r => r.completedFirstOrder).length;
      const pendingReferrals = totalReferrals - completedReferrals;
      
      // Calcular puntos ganados por referidos
      const pointsEarned = completedReferrals * 50;
      
      return {
        referralCode: user.referralCode,
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        pointsEarned,
        referrals: user.referrals,
        referredBy: user.referredBy
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      throw error;
    }
  }

  /**
   * Generar URL de compartir para redes sociales
   */
  generateShareUrls(referralCode, frontendUrl = process.env.FRONTEND_URL) {
    const message = `¡Únete a RapidEats con mi código ${referralCode} y obtén $20 de descuento en tu primera orden!`;
    const url = `${frontendUrl}?ref=${referralCode}`;
    
    return {
      referralCode,
      url,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent('¡Únete a RapidEats!')}&body=${encodeURIComponent(message + ' ' + url)}`
    };
  }

  /**
   * Obtener social proof para restaurante
   */
  async getSocialProof(restaurantId) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Contar órdenes de hoy
      const ordersToday = await Order.countDocuments({
        restaurantId,
        createdAt: { $gte: today },
        status: { $in: ['confirmed', 'preparing', 'ready', 'in_transit', 'delivered'] }
      });
      
      // Contar órdenes de la última semana
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const ordersThisWeek = await Order.countDocuments({
        restaurantId,
        createdAt: { $gte: sevenDaysAgo },
        status: 'delivered'
      });
      
      return {
        ordersToday,
        ordersThisWeek,
        message: ordersToday > 0 ? `${ordersToday} personas ordenaron de aquí hoy` : null
      };
    } catch (error) {
      console.error('Error getting social proof:', error);
      return {
        ordersToday: 0,
        ordersThisWeek: 0,
        message: null
      };
    }
  }

  /**
   * Obtener trending ahora en zona
   */
  async getTrendingInZone(zoneId, limit = 5) {
    try {
      const Restaurant = require('../models/Restaurant');
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Agregar órdenes por restaurante en la última hora
      const trending = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: hourAgo },
            status: { $in: ['confirmed', 'preparing', 'ready', 'in_transit'] }
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
          $match: {
            'restaurant.zone': zoneId,
            'restaurant.isActive': true
          }
        },
        {
          $group: {
            _id: '$restaurantId',
            orderCount: { $sum: 1 },
            restaurant: { $first: '$restaurant' }
          }
        },
        {
          $sort: { orderCount: -1 }
        },
        {
          $limit: limit
        }
      ]);
      
      return trending.map(t => ({
        restaurant: t.restaurant,
        orderCount: t.orderCount,
        trending: true
      }));
    } catch (error) {
      console.error('Error getting trending in zone:', error);
      return [];
    }
  }
}

module.exports = new ReferralService();
