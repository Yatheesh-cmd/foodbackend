const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { initiatePayment, verifyPayment, getOrderStatus, getAllOrders } = require('../controllers/paymentController');

router.post('/initiate-payment', authMiddleware, initiatePayment);
router.post('/verify-payment', authMiddleware, verifyPayment);
router.get('/order-status', authMiddleware, getOrderStatus);
router.get('/all-orders', authMiddleware, adminMiddleware, getAllOrders);

module.exports = router;