const admin = require('firebase-admin');
const User = require('../models/User');

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 */
const initFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (firebaseApp) {
      return firebaseApp;
    }

    // Check if Firebase credentials are provided
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.log('⚠️  Firebase credentials not found. Push notifications will be disabled.');
      return null;
    }

    // Initialize Firebase with service account credentials from environment
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CERT_URL,
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    return null;
  }
};

/**
 * Check if Firebase is available
 */
const isFirebaseAvailable = () => {
  return firebaseApp !== null;
};

/**
 * Save user push token
 */
const savePushToken = async (userId, token, device = 'web', platform = 'web') => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if token already exists
    const existingToken = user.pushTokens.find(t => t.token === token);
    
    if (!existingToken) {
      user.pushTokens.push({
        token,
        device,
        platform,
        createdAt: new Date(),
      });
      await user.save();
    }

    return { success: true, message: 'Push token saved' };
  } catch (error) {
    console.error('Error saving push token:', error);
    throw error;
  }
};

/**
 * Remove user push token
 */
const removePushToken = async (userId, token) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.pushTokens = user.pushTokens.filter(t => t.token !== token);
    await user.save();

    return { success: true, message: 'Push token removed' };
  } catch (error) {
    console.error('Error removing push token:', error);
    throw error;
  }
};

/**
 * Send push notification to specific user
 */
const sendPushNotification = async (userId, notification) => {
  try {
    if (!isFirebaseAvailable()) {
      console.log('Firebase not available, skipping push notification');
      return { success: false, message: 'Firebase not configured' };
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has push notifications enabled
    if (!user.preferences?.notifications?.push) {
      return { success: false, message: 'User has disabled push notifications' };
    }

    // Get user's push tokens
    const tokens = user.pushTokens.map(t => t.token);
    
    if (tokens.length === 0) {
      return { success: false, message: 'No push tokens found for user' };
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.image,
      },
      data: notification.data || {},
      tokens,
    };

    // Add action if provided
    if (notification.action) {
      message.data.action = notification.action;
    }

    // Send notification
    const response = await admin.messaging().sendMulticast(message);

    // Remove invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          invalidTokens.push(tokens[idx]);
        }
      });

      if (invalidTokens.length > 0) {
        user.pushTokens = user.pushTokens.filter(t => !invalidTokens.includes(t.token));
        await user.save();
      }
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

/**
 * Send push notification to multiple users
 */
const sendPushNotificationToMultiple = async (userIds, notification) => {
  try {
    if (!isFirebaseAvailable()) {
      console.log('Firebase not available, skipping push notifications');
      return { success: false, message: 'Firebase not configured' };
    }

    const results = await Promise.allSettled(
      userIds.map(userId => sendPushNotification(userId, notification))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    return {
      success: true,
      total: results.length,
      successful,
      failed,
    };
  } catch (error) {
    console.error('Error sending push notifications to multiple users:', error);
    throw error;
  }
};

/**
 * Send order status update notification
 */
const sendOrderStatusNotification = async (userId, order, status) => {
  const statusMessages = {
    confirmed: {
      title: '✅ Pedido Confirmado',
      body: `Tu pedido #${order.orderNumber} ha sido confirmado y está en preparación.`,
      action: 'ORDER_TRACKING',
    },
    preparing: {
      title: '👨‍🍳 Preparando tu Pedido',
      body: `El restaurante está preparando tu pedido #${order.orderNumber}.`,
      action: 'ORDER_TRACKING',
    },
    on_the_way: {
      title: '🚴 En Camino',
      body: `Tu pedido #${order.orderNumber} está en camino. ¡Llegará pronto!`,
      action: 'ORDER_TRACKING',
    },
    delivered: {
      title: '🎉 Pedido Entregado',
      body: `Tu pedido #${order.orderNumber} ha sido entregado. ¡Buen provecho!`,
      action: 'REVIEW_ORDER',
    },
    cancelled: {
      title: '❌ Pedido Cancelado',
      body: `Tu pedido #${order.orderNumber} ha sido cancelado.`,
      action: 'ORDER_DETAILS',
    },
  };

  const notification = statusMessages[status];
  if (!notification) {
    return;
  }

  return sendPushNotification(userId, {
    ...notification,
    data: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      status,
    },
  });
};

/**
 * Send promotion notification
 */
const sendPromotionNotification = async (userId, promotion) => {
  return sendPushNotification(userId, {
    title: '🎁 ' + promotion.title,
    body: promotion.message,
    image: promotion.image,
    action: 'PROMOTION',
    data: {
      promotionId: promotion._id?.toString(),
      type: 'promotion',
    },
  });
};

/**
 * Send review reminder notification
 */
const sendReviewReminderNotification = async (userId, order) => {
  return sendPushNotification(userId, {
    title: '⭐ Califica tu pedido',
    body: `¿Cómo estuvo tu experiencia con el pedido #${order.orderNumber}? Tu opinión es muy importante.`,
    action: 'REVIEW_ORDER',
    data: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
    },
  });
};

/**
 * Update user notification preferences
 */
const updateNotificationPreferences = async (userId, preferences) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.preferences) {
      user.preferences = { notifications: {} };
    }

    user.preferences.notifications = {
      ...user.preferences.notifications,
      ...preferences,
    };

    await user.save();

    return { success: true, preferences: user.preferences.notifications };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

module.exports = {
  initFirebase,
  isFirebaseAvailable,
  savePushToken,
  removePushToken,
  sendPushNotification,
  sendPushNotificationToMultiple,
  sendOrderStatusNotification,
  sendPromotionNotification,
  sendReviewReminderNotification,
  updateNotificationPreferences,
};
