const mongoose = require('mongoose');
const User = require('../models/User');
const Cart = require('../models/Cart');
const fs = require('fs');
const path = require('path');

exports.updateProfile = async (req, res) => {
  const { username, address, phone } = req.body;
  const profile = req.file?.filename;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.username = username || user.username;
    user.address = address || user.address;
    user.phone = phone || user.phone;
    if (profile) {
      if (user.profile) {
        const oldProfilePath = path.join(__dirname, '../Uploads', user.profile);
        if (fs.existsSync(oldProfilePath)) fs.unlinkSync(oldProfilePath);
      }
      user.profile = profile;
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error.stack);
    if (profile) {
      const profilePath = path.join(__dirname, '../Uploads', profile);
      if (fs.existsSync(profilePath)) fs.unlinkSync(profilePath);
    }
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

exports.updateCart = async (req, res) => {
  const { cart } = req.body;

  try {
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!Array.isArray(cart)) {
      return res.status(400).json({ message: 'Cart must be an array of food items' });
    }

    for (const item of cart) {
      if (!item.foodId || !mongoose.Types.ObjectId.isValid(item.foodId)) {
        return res.status(400).json({ message: `Invalid foodId: ${item.foodId}` });
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        return res.status(400).json({ message: `Invalid quantity for foodId ${item.foodId}: ${item.quantity}` });
      }
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { foods: cart } },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Cart updated successfully', cart: updatedCart });
  } catch (error) {
    console.error('Update cart error:', error.stack);
    res.status(500).json({ message: 'Server error while updating cart' });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const cart = await Cart.findOne({ userId }).populate('foods.foodId', 'title price image category');
    res.status(200).json({
      cart: cart || { userId, foods: [] },
    });
  } catch (error) {
    console.error('Get cart error:', error.stack);
    res.status(500).json({ message: 'Server error while fetching cart' });
  }
};