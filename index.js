const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

app.use('/auth', require('./routes/auth'));
app.use('/foods', require('./routes/foods'));
app.use('/user', require('./routes/user'));
app.use('/payment', require('./routes/payment'));
app.use('/review', require('./routes/review'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));