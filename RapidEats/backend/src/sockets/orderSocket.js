const jwt = require('jsonwebtoken');

const setupOrderSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    socket.on('authenticate', (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        console.log(`✅ Socket authenticated for user: ${socket.userId}`);
      } catch (error) {
        console.error('❌ Socket authentication failed');
        socket.disconnect();
      }
    });

    socket.on('joinOrder', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`✅ Socket joined order room: order_${orderId}`);
    });

    socket.on('leaveOrder', (orderId) => {
      socket.leave(`order_${orderId}`);
      console.log(`✅ Socket left order room: order_${orderId}`);
    });

    socket.on('joinRestaurant', (restaurantId) => {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`✅ Socket joined restaurant room: restaurant_${restaurantId}`);
    });

    socket.on('leaveRestaurant', (restaurantId) => {
      socket.leave(`restaurant_${restaurantId}`);
      console.log(`✅ Socket left restaurant room: restaurant_${restaurantId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = setupOrderSocket;
