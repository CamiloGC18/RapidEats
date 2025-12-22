const jwt = require('jsonwebtoken');

const setupOrderSocket = (io) => {
  // Store connected users and their roles
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Authenticate socket connection
    socket.on('authenticate', (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        
        connectedUsers.set(socket.userId, {
          socketId: socket.id,
          role: decoded.role,
          connectedAt: new Date(),
        });

        console.log(`✅ Socket authenticated for user: ${socket.userId} (${decoded.role})`);
        
        // Join user-specific room
        socket.join(`user_${socket.userId}`);
      } catch (error) {
        console.error('❌ Socket authentication failed');
        socket.emit('auth_error', { message: 'Authentication failed' });
        socket.disconnect();
      }
    });

    // Join order tracking room (for customers)
    socket.on('joinOrder', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`✅ Socket joined order room: order_${orderId}`);
      
      // Notify others in the room
      socket.to(`order_${orderId}`).emit('user_joined', {
        userId: socket.userId,
        timestamp: new Date(),
      });
    });

    // Leave order tracking room
    socket.on('leaveOrder', (orderId) => {
      socket.leave(`order_${orderId}`);
      console.log(`✅ Socket left order room: order_${orderId}`);
    });

    // Join restaurant dashboard room
    socket.on('joinRestaurant', (restaurantId) => {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`✅ Socket joined restaurant room: restaurant_${restaurantId}`);
    });

    // Leave restaurant dashboard room
    socket.on('leaveRestaurant', (restaurantId) => {
      socket.leave(`restaurant_${restaurantId}`);
      console.log(`✅ Socket left restaurant room: restaurant_${restaurantId}`);
    });

    // Join admin dashboard
    socket.on('joinAdmin', () => {
      if (socket.userRole === 'admin') {
        socket.join('admin_dashboard');
        console.log(`✅ Socket joined admin dashboard`);
      } else {
        socket.emit('auth_error', { message: 'Admin access required' });
      }
    });

    // Real-time order status update
    socket.on('updateOrderStatus', async (data) => {
      const { orderId, status, location } = data;
      
      // Emit to all clients tracking this order
      io.to(`order_${orderId}`).emit('orderStatusUpdate', {
        orderId,
        status,
        location,
        timestamp: new Date(),
      });

      console.log(`📦 Order ${orderId} status updated to: ${status}`);
    });

    // Delivery driver location update
    socket.on('updateDeliveryLocation', (data) => {
      const { orderId, location } = data;
      
      io.to(`order_${orderId}`).emit('deliveryLocationUpdate', {
        orderId,
        location,
        timestamp: new Date(),
      });
    });

    // New order notification for restaurant
    socket.on('newOrderNotification', (data) => {
      const { restaurantId, orderData } = data;
      
      io.to(`restaurant_${restaurantId}`).emit('newOrder', {
        order: orderData,
        timestamp: new Date(),
      });

      // Also notify admin
      io.to('admin_dashboard').emit('newOrder', {
        order: orderData,
        timestamp: new Date(),
      });

      console.log(`🔔 New order notification sent to restaurant: ${restaurantId}`);
    });

    // Typing indicator for customer support chat
    socket.on('typing', (data) => {
      const { orderId } = data;
      socket.to(`order_${orderId}`).emit('userTyping', {
        userId: socket.userId,
        orderId,
      });
    });

    // Stop typing indicator
    socket.on('stopTyping', (data) => {
      const { orderId } = data;
      socket.to(`order_${orderId}`).emit('userStoppedTyping', {
        userId: socket.userId,
        orderId,
      });
    });

    // Chat message for order support
    socket.on('sendMessage', (data) => {
      const { orderId, message } = data;
      
      io.to(`order_${orderId}`).emit('newMessage', {
        orderId,
        message,
        senderId: socket.userId,
        timestamp: new Date(),
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`❌ Socket disconnected: ${socket.id} (User: ${socket.userId})`);
      } else {
        console.log(`❌ Socket disconnected: ${socket.id}`);
      }
    });

    // Error handler
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Helper function to emit to specific user
  io.emitToUser = (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
  };

  // Helper function to emit order update
  io.emitOrderUpdate = (orderId, data) => {
    io.to(`order_${orderId}`).emit('orderUpdate', {
      ...data,
      timestamp: new Date(),
    });
  };

  // Helper function to emit to restaurant
  io.emitToRestaurant = (restaurantId, event, data) => {
    io.to(`restaurant_${restaurantId}`).emit(event, data);
  };

  // Helper function to emit to admin
  io.emitToAdmin = (event, data) => {
    io.to('admin_dashboard').emit(event, data);
  };

  // Get connected users count
  io.getConnectedUsersCount = () => {
    return connectedUsers.size;
  };

  return io;
};

module.exports = setupOrderSocket;
