const mongoose = require('mongoose');
const Food = require('../models/Food');
const fs = require('fs');
const path = require('path');

exports.addFood = async (req, res) => {
  const { title, description, category, price } = req.body;
  const image = req.file?.filename;

  try {
    const food = new Food({
      title,
      description,
      category,
      price,
      image,
      createdBy: req.user.id,
    });
    await food.save();
    res.status(200).json({ message: 'Food added successfully', food });
  } catch (error) {
    if (image) fs.unlinkSync(path.join(__dirname, '../uploads', image));
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminFoods = async (req, res) => {
  try {
    const foods = await Food.find({ createdBy: req.user.id });
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFood = async (req, res) => {
  const { id } = req.params;
  const { title, description, category, price } = req.body;
  const image = req.file?.filename;

  try {
    const food = await Food.findById(id);
    if (!food) return res.status(404).json({ message: 'Food not found' });
    if (food.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    food.title = title || food.title;
    food.description = description || food.description;
    food.category = category || food.category;
    food.price = price || food.price;
    if (image) {
      if (food.image) fs.unlinkSync(path.join(__dirname, '../Uploads', food.image));
      food.image = image;
    }

    await food.save();
    res.status(200).json({ message: 'Food updated successfully', food });
  } catch (error) {
    if (image) fs.unlinkSync(path.join(__dirname, '../Uploads', image));
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFood = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid food ID format' });
  }

  try {
    const food = await Food.findById(id);
    if (!food) return res.status(404).json({ message: 'Food not found' });
    if (food.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    if (food.image) {
      const imagePath = path.join(__dirname, '../Uploads', food.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Food.findByIdAndDelete(id);
    res.status(200).json({ message: 'Food deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting food' });
  }
};

exports.getAllFoods = async (req, res) => {
  const { search } = req.query;
  try {
    const query = search ? { category: { $regex: search, $options: 'i' } } : {};
    const foods = await Food.find(query);
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSampleFoods = async (req, res) => {
  try {
    const foods = await Food.find().limit(4);
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};