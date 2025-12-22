const express = require('express');
const {
  placeOrder,
  getOrderById,
  getUserOrders,
  getOrderTracking,
} = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

router.post('/', verifyToken, placeOrder);
router.get('/', verifyToken, getUserOrders);
router.get('/:id', verifyToken, getOrderById);
router.get('/:id/tracking', getOrderTracking);

module.exports = router;
