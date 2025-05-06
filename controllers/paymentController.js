const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.initiatePayment = async (req, res) => {
  const cartItems = req.body;

  try {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart must be a non-empty array' });
    }

    for (const item of cartItems) {
      if (!item._id || !mongoose.Types.ObjectId.isValid(item._id)) {
        return res.status(400).json({ message: `Invalid food ID: ${item._id || 'missing'}` });
      }
      if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
        return res.status(400).json({ message: `Invalid price for food ${item._id}: ${item.price}` });
      }
      if (typeof item.quantity !== 'number' || isNaN(item.quantity) || item.quantity < 1) {
        return res.status(400).json({ message: `Invalid quantity for food ${item._id}: ${item.quantity}` });
      }
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (isNaN(total) || total <= 0) {
      return res.status(400).json({ message: 'Invalid total amount calculated' });
    }

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: total * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const order = new Order({
      userId: req.user.id,
      foods: cartItems.map(item => ({
        foodId: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      status: 'Pending',
      razorpayOrderId: razorpayOrder.id,
    });
    await order.save();

    res.status(200).json({
      message: 'Order created, proceed to payment',
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order._id,
    });
  } catch (error) {
    console.error('Initiate payment error:', error.stack);
    res.status(500).json({ message: error.message || 'Server error during payment initiation' });
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, dbOrderId } = req.body;

  try {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const order = await Order.findById(dbOrderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'Completed';
    order.razorpayPaymentId = razorpayPaymentId;
    order.updatedAt = new Date();
    await order.save();

    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { foods: [] } },
      { upsert: true }
    );

    const populatedOrder = await Order.findById(order._id)
      .populate('foods.foodId', 'title')
      .populate('userId', 'username phone address');

    const orderData = {
      _id: populatedOrder._id,
      userId: populatedOrder.userId ? populatedOrder.userId._id : null,
      username: populatedOrder.userId ? populatedOrder.userId.username : null,
      phone: populatedOrder.userId ? populatedOrder.userId.phone : null,
      address: populatedOrder.userId ? populatedOrder.userId.address : null,
      foods: populatedOrder.foods.map(food => ({
        foodId: food.foodId ? food.foodId._id : null,
        title: food.foodId ? food.foodId.title : null,
        quantity: food.quantity,
        price: food.price,
      })),
      total: populatedOrder.total,
      status: populatedOrder.status,
      createdAt: populatedOrder.createdAt,
    };

    res.status(200).json({
      message: 'Payment successful',
      order: orderData,
    });
  } catch (error) {
    console.error('Verify payment error:', error.stack);
    res.status(500).json({ message: error.message || 'Server error during payment verification' });
  }
};

exports.getOrderStatus = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate('foods.foodId', 'title');
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get order status error:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const orders = await Order.find()
      .populate('foods.foodId', 'title')
      .populate('userId', 'username phone address');
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get all orders error:', error.stack);
    res.status(500).json({ message: error.message });
  }
};