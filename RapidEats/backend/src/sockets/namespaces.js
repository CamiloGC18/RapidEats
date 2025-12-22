const jwt = require('jsonwebtoken');
const { logHelper } = require('../config/logger');
const { AuthenticationError } = require('../utils/errors');

/**
 * Middleware de autenticación para Socket.io
 */
const socketAuthMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new AuthenticationError('No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user data to socket
    socket.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };

    logHelper.info('Socket authenticated', {
      socketId: socket.id,
      userId: decoded.userId,
      role: decoded.role
    });

    next();
  } catch (error) {
    logHelper.error('Socket authentication failed', error, {
      socketId: socket.id
    });
    next(new AuthenticationError('Invalid token'));
  }
};

/**
 * Middleware para verificar roles
 */
const socketRoleMiddleware = (allowedRoles) => {
  return (socket, next) => {
    if (!socket.user) {
      return next(new AuthenticationError('Not authenticated'));
    }

    if (!allowedRoles.includes(socket.user.role)) {
      return next(new AuthenticationError('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Setup Socket.io con namespaces organizados
 */
const setupSockets = (io) => {
  // Store para tracking de conexiones
  const connections = {
    customers: new Map(),
    restaurants: new Map(),
    delivery: new Map(),
    admin: new Map()
  };

  // ===== NAMESPACE: /customer =====
  const customerNamespace = io.of('/customer');
  customerNamespace.use(socketAuthMiddleware);
  customerNamespace.use(socketRoleMiddleware(['customer', 'admin']));

  customerNamespace.on('connection', (socket) => {
    const userId = socket.user.id;
    connections.customers.set(userId, socket.id);

    logHelper.info('Customer connected', {
      socketId: socket.id,
      userId
    });

    // Join user's personal room
    socket.join(`customer:${userId}`);

    // Track order in real-time
    socket.on('order:track', (orderId) => {
      socket.join(`order:${orderId}`);
      logHelper.debug('Customer tracking order', { userId, orderId });
    });

    // Stop tracking order
    socket.on('order:untrack', (orderId) => {
      socket.leave(`order:${orderId}`);
      logHelper.debug('Customer stopped tracking order', { userId, orderId });
    });

    // Request current order status
    socket.on('order:requestStatus', async (orderId) => {
      try {
        // Emit request to restaurant namespace
        io.of('/restaurant').to(`order:${orderId}`).emit('order:statusRequest', {
          orderId,
          requestedBy: userId
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to request status' });
      }
    });

    // Typing indicator for chat support
    socket.on('chat:typing', (data) => {
      socket.to(`support:${userId}`).emit('customer:typing', {
        userId,
        isTyping: data.isTyping
      });
    });

    socket.on('disconnect', () => {
      connections.customers.delete(userId);
      logHelper.info('Customer disconnected', { socketId: socket.id, userId });
    });

    socket.on('error', (error) => {
      logHelper.error('Customer socket error', error, { socketId: socket.id, userId });
    });
  });

  // ===== NAMESPACE: /restaurant =====
  const restaurantNamespace = io.of('/restaurant');
  restaurantNamespace.use(socketAuthMiddleware);
  restaurantNamespace.use(socketRoleMiddleware(['restaurant', 'admin']));

  restaurantNamespace.on('connection', (socket) => {
    const userId = socket.user.id;
    connections.restaurants.set(userId, socket.id);

    logHelper.info('Restaurant connected', {
      socketId: socket.id,
      userId
    });

    // Join restaurant's room
    socket.on('restaurant:join', (restaurantId) => {
      socket.join(`restaurant:${restaurantId}`);
      socket.restaurantId = restaurantId;
      logHelper.debug('Restaurant joined room', { userId, restaurantId });
    });

    // Monitor order
    socket.on('order:monitor', (orderId) => {
      socket.join(`order:${orderId}`);
      logHelper.debug('Restaurant monitoring order', { userId, orderId });
    });

    // Update order status
    socket.on('order:updateStatus', async (data) => {
      const { orderId, status, estimatedTime, notes } = data;
      
      try {
        // Broadcast to customer tracking this order
        customerNamespace.to(`order:${orderId}`).emit('order:statusUpdated', {
          orderId,
          status,
          estimatedTime,
          notes,
          timestamp: new Date()
        });

        // Broadcast to delivery if order is ready
        if (status === 'ready') {
          io.of('/delivery').emit('order:readyForPickup', {
            orderId,
            restaurantId: socket.restaurantId,
            timestamp: new Date()
          });
        }

        logHelper.info('Order status updated', {
          orderId,
          status,
          updatedBy: userId
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to update status' });
        logHelper.error('Failed to update order status', error, { orderId, userId });
      }
    });

    // New order received (from customer)
    socket.on('order:received', (orderData) => {
      socket.to(`restaurant:${socket.restaurantId}`).emit('order:new', orderData);
      
      logHelper.info('New order received', {
        orderId: orderData.orderId,
        restaurantId: socket.restaurantId
      });
    });

    socket.on('disconnect', () => {
      connections.restaurants.delete(userId);
      logHelper.info('Restaurant disconnected', { socketId: socket.id, userId });
    });
  });

  // ===== NAMESPACE: /delivery =====
  const deliveryNamespace = io.of('/delivery');
  deliveryNamespace.use(socketAuthMiddleware);
  deliveryNamespace.use(socketRoleMiddleware(['delivery', 'admin']));

  deliveryNamespace.on('connection', (socket) => {
    const userId = socket.user.id;
    connections.delivery.set(userId, socket.id);

    logHelper.info('Delivery driver connected', {
      socketId: socket.id,
      userId
    });

    // Mark as available
    socket.on('delivery:setStatus', (status) => {
      socket.deliveryStatus = status; // 'available', 'busy', 'offline'
      socket.join(`delivery:${status}`);
      
      logHelper.debug('Delivery status updated', { userId, status });
    });

    // Accept order
    socket.on('order:accept', async (data) => {
      const { orderId } = data;
      
      try {
        // Join order room
        socket.join(`order:${orderId}`);
        socket.currentOrderId = orderId;

        // Notify customer
        customerNamespace.to(`order:${orderId}`).emit('delivery:assigned', {
          orderId,
          deliveryId: userId,
          driver: {
            name: socket.user.name || 'Conductor',
            phone: socket.user.phone
          },
          timestamp: new Date()
        });

        // Notify restaurant
        restaurantNamespace.to(`order:${orderId}`).emit('delivery:assigned', {
          orderId,
          deliveryId: userId
        });

        logHelper.info('Order accepted by delivery', { orderId, deliveryId: userId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to accept order' });
      }
    });

    // Update location
    socket.on('location:update', (data) => {
      const { orderId, location } = data;
      
      if (orderId) {
        // Send to customer tracking order
        customerNamespace.to(`order:${orderId}`).emit('delivery:locationUpdate', {
          orderId,
          location: {
            lat: location.lat,
            lng: location.lng,
            heading: location.heading,
            speed: location.speed
          },
          timestamp: new Date()
        });

        // Send to restaurant
        restaurantNamespace.to(`order:${orderId}`).emit('delivery:locationUpdate', {
          orderId,
          location
        });
      }
    });

    // Complete delivery
    socket.on('order:complete', async (data) => {
      const { orderId, signature, photo } = data;
      
      try {
        // Notify customer
        customerNamespace.to(`order:${orderId}`).emit('order:delivered', {
          orderId,
          deliveredAt: new Date(),
          signature,
          photo
        });

        // Notify restaurant
        restaurantNamespace.to(`order:${orderId}`).emit('order:delivered', {
          orderId,
          deliveredBy: userId
        });

        // Leave order room
        socket.leave(`order:${orderId}`);
        socket.currentOrderId = null;

        logHelper.info('Order completed by delivery', { orderId, deliveryId: userId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to complete order' });
      }
    });

    socket.on('disconnect', () => {
      connections.delivery.delete(userId);
      logHelper.info('Delivery driver disconnected', { socketId: socket.id, userId });
    });
  });

  // ===== NAMESPACE: /admin =====
  const adminNamespace = io.of('/admin');
  adminNamespace.use(socketAuthMiddleware);
  adminNamespace.use(socketRoleMiddleware(['admin']));

  adminNamespace.on('connection', (socket) => {
    const userId = socket.user.id;
    connections.admin.set(userId, socket.id);

    logHelper.info('Admin connected', {
      socketId: socket.id,
      userId
    });

    // Join admin dashboard
    socket.join('admin:dashboard');

    // Get live stats
    socket.on('stats:request', () => {
      const stats = {
        connections: {
          customers: connections.customers.size,
          restaurants: connections.restaurants.size,
          delivery: connections.delivery.size,
          admin: connections.admin.size
        },
        timestamp: new Date()
      };
      
      socket.emit('stats:update', stats);
    });

    // Broadcast message to all users
    socket.on('broadcast', (data) => {
      const { target, message } = data;
      
      if (target === 'all') {
        customerNamespace.emit('admin:message', message);
        restaurantNamespace.emit('admin:message', message);
        deliveryNamespace.emit('admin:message', message);
      } else if (target === 'customers') {
        customerNamespace.emit('admin:message', message);
      } else if (target === 'restaurants') {
        restaurantNamespace.emit('admin:message', message);
      } else if (target === 'delivery') {
        deliveryNamespace.emit('admin:message', message);
      }

      logHelper.info('Admin broadcast message', { userId, target, message });
    });

    // Monitor specific order
    socket.on('order:monitor', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('disconnect', () => {
      connections.admin.delete(userId);
      logHelper.info('Admin disconnected', { socketId: socket.id, userId });
    });
  });

  // Helper functions para emitir eventos desde controllers
  const socketHelpers = {
    // Emit to specific customer
    emitToCustomer: (userId, event, data) => {
      customerNamespace.to(`customer:${userId}`).emit(event, data);
    },

    // Emit to specific restaurant
    emitToRestaurant: (restaurantId, event, data) => {
      restaurantNamespace.to(`restaurant:${restaurantId}`).emit(event, data);
    },

    // Emit to order room (all participants)
    emitToOrder: (orderId, event, data) => {
      customerNamespace.to(`order:${orderId}`).emit(event, data);
      restaurantNamespace.to(`order:${orderId}`).emit(event, data);
      deliveryNamespace.to(`order:${orderId}`).emit(event, data);
    },

    // Emit to all available delivery drivers
    emitToAvailableDelivery: (event, data) => {
      deliveryNamespace.to('delivery:available').emit(event, data);
    },

    // Emit to admin dashboard
    emitToAdmin: (event, data) => {
      adminNamespace.to('admin:dashboard').emit(event, data);
    },

    // Get connection stats
    getConnectionStats: () => ({
      customers: connections.customers.size,
      restaurants: connections.restaurants.size,
      delivery: connections.delivery.size,
      admin: connections.admin.size,
      total: connections.customers.size + connections.restaurants.size + 
             connections.delivery.size + connections.admin.size
    })
  };

  // Heartbeat para mantener conexiones vivas
  setInterval(() => {
    io.of('/customer').emit('ping', { timestamp: Date.now() });
    io.of('/restaurant').emit('ping', { timestamp: Date.now() });
    io.of('/delivery').emit('ping', { timestamp: Date.now() });
    io.of('/admin').emit('ping', { timestamp: Date.now() });
  }, 30000); // cada 30 segundos

  // Log stats periódicamente
  setInterval(() => {
    const stats = socketHelpers.getConnectionStats();
    logHelper.info('Socket.io connection stats', stats);
  }, 60000); // cada minuto

  return socketHelpers;
};

module.exports = setupSockets;
