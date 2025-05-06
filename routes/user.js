const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { updateProfile, updateCart, getCart } = require('../controllers/userController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.put('/updateprofile', authMiddleware, upload.single('profile'), updateProfile);
router.put('/update-cart', authMiddleware, updateCart);
router.get('/update-cart', authMiddleware, getCart);

module.exports = router;