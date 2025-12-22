const express = require('express');
const {
  placeOrder,
  getOrderById,
  getUserOrders,
  getOrderTracking,
  reorder,
} = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/auth');
const { orderLimiter } = require('../middlewares/rateLimiter');
const { validate, validateQuery, schemas } = require('../utils/validation');

const router = express.Router();

router.post('/', verifyToken, orderLimiter, validate(schemas.createOrder), placeOrder);
router.get('/', verifyToken, validateQuery(schemas.pagination), getUserOrders);
router.get('/:id', verifyToken, getOrderById);
router.get('/:id/tracking', getOrderTracking);
router.post('/:orderId/reorder', verifyToken, orderLimiter, reorder);

module.exports = router;
