const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { createReview, getOrderReviews, getAllReviews, deleteReview } = require('../controllers/reviewController');

console.log('Imported controllers:', {
  createReview,
  getOrderReviews,
  getAllReviews,
  deleteReview,
});

router.post('/create', authMiddleware, createReview);
router.get('/order/:orderId', getOrderReviews);
router.get('/all', authMiddleware, adminMiddleware, getAllReviews);
router.delete('/:reviewId', authMiddleware, deleteReview);

module.exports = router;