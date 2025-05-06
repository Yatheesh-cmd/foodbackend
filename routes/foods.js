const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { addFood, getAdminFoods, updateFood, deleteFood, getAllFoods, getSampleFoods } = require('../controllers/foodController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post('/addfood', authMiddleware, adminMiddleware, upload.single('image'), addFood);
router.get('/adminfoods', authMiddleware, adminMiddleware, getAdminFoods);
router.put('/updatefood/:id', authMiddleware, adminMiddleware, upload.single('image'), updateFood);
router.delete('/deletefood/:id', authMiddleware, adminMiddleware, deleteFood);
router.get('/allfoods', authMiddleware, getAllFoods);
router.get('/samplefoods', getSampleFoods);

module.exports = router;