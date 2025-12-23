const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * Sistema de Recomendaciones AI
 * Combina Collaborative Filtering y Content-Based Filtering
 */

class RecommendationService {
  /**
   * Obtener recomendaciones personalizadas para un usuario
   */
  async getPersonalizedRecommendations(userId, limit = 10) {
    try {
      // Obtener datos del usuario
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Obtener historial de pedidos del usuario
      const userOrders = await Order.find({
        user: userId,
        status: 'delivered'
      }).populate('restaurant items.product');

      // Si el usuario no tiene historial, devolver trending
      if (userOrders.length === 0) {
        return this.getTrendingRecommendations(limit);
      }

      // Obtener recomendaciones colaborativas
      const collaborativeRecs = await this.getCollaborativeRecommendations(
        userId,
        userOrders,
        limit
      );

      // Obtener recomendaciones basadas en contenido
      const contentRecs = await this.getContentBasedRecommendations(
        userId,
        userOrders,
        limit
      );

      // Combinar ambas recomendaciones (Hybrid Approach)
      const hybridRecs = this.hybridCombine(
        collaborativeRecs,
        contentRecs,
        limit
      );

      return hybridRecs;
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw error;
    }
  }

  /**
   * Collaborative Filtering: "Clientes que ordenaron X también ordenaron Y"
   * Usa Jaccard similarity entre usuarios
   */
  async getCollaborativeRecommendations(userId, userOrders, limit) {
    try {
      // Obtener IDs de restaurantes que el usuario ha ordenado
      const userRestaurants = new Set(
        userOrders.map(order => order.restaurant._id.toString())
      );

      // Encontrar usuarios similares
      const similarUsers = await this.findSimilarUsers(
        userId,
        Array.from(userRestaurants)
      );

      // Obtener restaurantes que los usuarios similares han ordenado
      const recommendations = [];
      const restaurantScores = {};

      for (const similarUser of similarUsers) {
        const orders = await Order.find({
          user: similarUser.userId,
          status: 'delivered'
        }).populate('restaurant');

        for (const order of orders) {
          const restaurantId = order.restaurant._id.toString();

          // No recomendar restaurantes que el usuario ya conoce
          if (!userRestaurants.has(restaurantId)) {
            if (!restaurantScores[restaurantId]) {
              restaurantScores[restaurantId] = {
                restaurant: order.restaurant,
                score: 0,
                count: 0
              };
            }
            restaurantScores[restaurantId].score += similarUser.similarity;
            restaurantScores[restaurantId].count += 1;
          }
        }
      }

      // Ordenar por score y devolver top N
      const sortedRecs = Object.values(restaurantScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(rec => ({
          restaurant: rec.restaurant,
          score: rec.score,
          reason: 'collaborative'
        }));

      return sortedRecs;
    } catch (error) {
      console.error('Error in collaborative filtering:', error);
      return [];
    }
  }

  /**
   * Encontrar usuarios similares usando Jaccard similarity
   */
  async findSimilarUsers(userId, userRestaurants, topN = 10) {
    try {
      // Obtener todos los usuarios con pedidos
      const allOrders = await Order.find({
        user: { $ne: userId },
        status: 'delivered'
      }).select('user restaurant');

      // Agrupar por usuario
      const userOrdersMap = {};
      allOrders.forEach(order => {
        const uid = order.user.toString();
        if (!userOrdersMap[uid]) {
          userOrdersMap[uid] = new Set();
        }
        userOrdersMap[uid].add(order.restaurant.toString());
      });

      // Calcular Jaccard similarity con cada usuario
      const similarities = [];
      const userRestaurantsSet = new Set(userRestaurants);

      Object.entries(userOrdersMap).forEach(([uid, otherRestaurants]) => {
        const intersection = new Set(
          [...userRestaurantsSet].filter(r => otherRestaurants.has(r))
        );
        const union = new Set([...userRestaurantsSet, ...otherRestaurants]);

        const similarity = intersection.size / union.size;

        if (similarity > 0) {
          similarities.push({
            userId: uid,
            similarity
          });
        }
      });

      // Ordenar por similitud y devolver top N
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topN);
    } catch (error) {
      console.error('Error finding similar users:', error);
      return [];
    }
  }

  /**
   * Content-Based Filtering: Basado en categorías favoritas y preferencias
   */
  async getContentBasedRecommendations(userId, userOrders, limit) {
    try {
      // Analizar categorías favoritas del usuario
      const categoryFrequency = {};
      const tagFrequency = {};

      userOrders.forEach(order => {
        const category = order.restaurant.category;
        categoryFrequency[category] = (categoryFrequency[category] || 0) + 1;

        // Analizar tags de productos
        order.items.forEach(item => {
          if (item.product && item.product.tags) {
            item.product.tags.forEach(tag => {
              tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
            });
          }
        });
      });

      // Obtener categorías principales
      const topCategories = Object.entries(categoryFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category]) => category);

      // Obtener tags principales
      const topTags = Object.entries(tagFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);

      // Buscar restaurantes similares
      const orderedRestaurants = userOrders.map(o => o.restaurant._id);

      const similarRestaurants = await Restaurant.find({
        _id: { $nin: orderedRestaurants },
        isActive: true,
        category: { $in: topCategories }
      })
        .limit(limit * 2)
        .populate('ratings');

      // Calcular score basado en categoría y rating
      const recommendations = similarRestaurants.map(restaurant => {
        let score = 0;

        // Bonus por categoría favorita
        if (topCategories.includes(restaurant.category)) {
          score += categoryFrequency[restaurant.category] || 0;
        }

        // Bonus por rating alto
        if (restaurant.ratings && restaurant.ratings.average) {
          score += restaurant.ratings.average;
        }

        return {
          restaurant,
          score,
          reason: 'content-based'
        };
      });

      // Ordenar por score
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error in content-based filtering:', error);
      return [];
    }
  }

  /**
   * Combinar recomendaciones colaborativas y basadas en contenido
   */
  hybridCombine(collaborativeRecs, contentRecs, limit) {
    const combined = {};
    const COLLABORATIVE_WEIGHT = 0.6;
    const CONTENT_WEIGHT = 0.4;

    // Agregar recomendaciones colaborativas
    collaborativeRecs.forEach((rec, index) => {
      const id = rec.restaurant._id.toString();
      const score = rec.score * COLLABORATIVE_WEIGHT * (1 - index / collaborativeRecs.length);
      
      combined[id] = {
        restaurant: rec.restaurant,
        score,
        reasons: ['collaborative']
      };
    });

    // Agregar recomendaciones de contenido
    contentRecs.forEach((rec, index) => {
      const id = rec.restaurant._id.toString();
      const score = rec.score * CONTENT_WEIGHT * (1 - index / contentRecs.length);

      if (combined[id]) {
        combined[id].score += score;
        combined[id].reasons.push('content-based');
      } else {
        combined[id] = {
          restaurant: rec.restaurant,
          score,
          reasons: ['content-based']
        };
      }
    });

    // Ordenar por score y devolver top N
    return Object.values(combined)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Obtener items trending (más ordenados en últimos 7 días)
   */
  async getTrendingRecommendations(limit = 10, category = null) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Agregar órdenes por restaurante
      const trendingQuery = [
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            status: { $in: ['preparing', 'ready', 'in_transit', 'delivered'] }
          }
        },
        {
          $group: {
            _id: '$restaurant',
            orderCount: { $sum: 1 },
            totalRevenue: { $sum: '$totals.grandTotal' }
          }
        },
        {
          $sort: { orderCount: -1 }
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
        },
        {
          $match: {
            'restaurant.isActive': true
          }
        }
      ];

      if (category) {
        trendingQuery[0].$match['restaurant.category'] = category;
      }

      const trending = await Order.aggregate(trendingQuery);

      return trending.map(item => ({
        restaurant: item.restaurant,
        orderCount: item.orderCount,
        totalRevenue: item.totalRevenue,
        reason: 'trending'
      }));
    } catch (error) {
      console.error('Error getting trending recommendations:', error);
      return [];
    }
  }

  /**
   * Obtener productos trending
   */
  async getTrendingProducts(limit = 20, category = null) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const trendingQuery = [
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            status: { $in: ['preparing', 'ready', 'in_transit', 'delivered'] }
          }
        },
        {
          $unwind: '$items'
        },
        {
          $group: {
            _id: '$items.product',
            orderCount: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        {
          $sort: { orderCount: -1 }
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $match: {
            'product.isActive': true
          }
        }
      ];

      const trending = await Order.aggregate(trendingQuery);

      return trending.map(item => ({
        product: item.product,
        orderCount: item.orderCount,
        totalRevenue: item.totalRevenue
      }));
    } catch (error) {
      console.error('Error getting trending products:', error);
      return [];
    }
  }

  /**
   * Obtener "Volver a pedir de..." - Restaurantes frecuentes del usuario
   */
  async getReorderSuggestions(userId, limit = 5) {
    try {
      const reorderQuery = [
        {
          $match: {
            user: userId,
            status: 'delivered'
          }
        },
        {
          $group: {
            _id: '$restaurant',
            lastOrder: { $max: '$createdAt' },
            orderCount: { $sum: 1 }
          }
        },
        {
          $sort: { orderCount: -1, lastOrder: -1 }
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
        },
        {
          $match: {
            'restaurant.isActive': true
          }
        }
      ];

      const suggestions = await Order.aggregate(reorderQuery);

      return suggestions.map(item => ({
        restaurant: item.restaurant,
        orderCount: item.orderCount,
        lastOrder: item.lastOrder
      }));
    } catch (error) {
      console.error('Error getting reorder suggestions:', error);
      return [];
    }
  }
}

module.exports = new RecommendationService();
