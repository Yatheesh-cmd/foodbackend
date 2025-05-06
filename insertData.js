const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Food = require('./models/Food');
const Cart = require('./models/Cart');
const Review = require('./models/Review');
const Order = require('./models/Order');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const insertData = async () => {
  await connectDB();

  const users = [
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      username: 'admin',
      email: 'admin@example.com',
      password: '$2a$10$bCuxFoqIz7wLw7s0LP9FNOc0futwngatPvMtBmZD0pNM6apMX0tgq', // admin123
      role: 'admin',
      profile: 'profile-admin-1698765432101.jpg',
      address: '123 Admin Street, Food City',
      phone: '+91 9876543210',
      createdAt: new Date('2025-03-19T12:00:00Z'),
      updatedAt: new Date('2025-03-19T12:00:00Z'),
    },
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      username: 'user',
      email: 'user@gmail.com',
      password: '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WZcG8d3YXv9z9Xz9Xz9Xz', // user123
      role: 'user',
      profile: 'profile-user-1698765432102.jpg',
      address: '456 User Avenue, Food Town',
      phone: '+91 9123456789',
      createdAt: new Date('2025-03-19T12:05:00Z'),
      updatedAt: new Date('2025-03-19T12:05:00Z'),
    },
  ];

  const foods = [
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
      title: 'Margherita Pizza',
      description: 'Classic pizza with tomato, mozzarella, and basil.',
      category: 'Pizza',
      price: 299,
      image: 'food-1698765432101.jpg',
      createdBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      createdAt: new Date('2025-03-19T12:10:00Z'),
      updatedAt: new Date('2025-03-19T12:10:00Z'),
    },
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
      title: 'Butter Chicken',
      description: 'Creamy butter chicken with naan.',
      category: 'Indian',
      price: 349,
      image: 'food-1698765432102.jpg',
      createdBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      createdAt: new Date('2025-03-19T12:15:00Z'),
      updatedAt: new Date('2025-03-19T12:15:00Z'),
    },
  ];

  const carts = [
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439031'),
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      foods: [
        { foodId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'), quantity: 1 },
        { foodId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'), quantity: 2 },
      ],
      createdAt: new Date('2025-03-19T12:20:00Z'),
      updatedAt: new Date('2025-03-19T12:20:00Z'),
    },
  ];

  const reviews = [
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439041'),
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      foodId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
      rating: 4,
      comment: 'Delicious pizza, loved the fresh basil!',
      createdAt: new Date('2025-03-19T12:25:00Z'),
      updatedAt: new Date('2025-03-19T12:25:00Z'),
    },
  ];

  const orders = [
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439051'),
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      foods: [
        { foodId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'), quantity: 1, price: 299 },
        { foodId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'), quantity: 2, price: 349 },
      ],
      total: 997,
      status: 'Completed',
      razorpayOrderId: 'order_123456',
      razorpayPaymentId: 'pay_123456',
      createdAt: new Date('2025-03-19T12:30:00Z'),
      updatedAt: new Date('2025-03-19T12:30:00Z'),
    },
  ];

  try {
    await User.deleteMany({});
    await Food.deleteMany({});
    await Cart.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});

    await User.insertMany(users);
    await Food.insertMany(foods);
    await Cart.insertMany(carts);
    await Review.insertMany(reviews);
    await Order.insertMany(orders);
    console.log('All data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    mongoose.connection.close();
  }
};

insertData();