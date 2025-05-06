const mongoose = require('mongoose');
const Review = require('../models/Review');

exports.createReview = async (req, res) => {
  const { orderId, rating, comment } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    const review = new Review({
      userId: req.user.id,
      orderId,
      rating,
      comment,
    });
    await review.save();
    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    console.error('Create review error:', error.stack);
    res.status(500).json({ message: 'Server error while creating review' });
  }
};

exports.getOrderReviews = async (req, res) => {
  const { orderId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const reviews = await Review.find({ orderId }).populate('userId', 'username');
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error.stack);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'username')
      .populate('orderId', '_id')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Get all reviews error:', error.stack);
    res.status(500).json({ message: 'Server error while fetching all reviews' });
  }
};

exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Review.findByIdAndDelete(reviewId);
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error.stack);
    res.status(500).json({ message: 'Server error while deleting review' });
  }
};

console.log('Exporting from reviewController:', {
  createReview: exports.createReview,
  getOrderReviews: exports.getOrderReviews,
  getAllReviews: exports.getAllReviews,
  deleteReview: exports.deleteReview,
});