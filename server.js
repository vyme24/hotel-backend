const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./database');
const path = require("path");

dotenv.config({});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.get('/', (req, res) => {
  res.send('API is working!');
});


const adminAuthRoutes = require('./routes/adminRoutes');

const adminUserRoutes = require('./routes/userRoutes');
const adminHotelRoutes = require('./routes/hotelRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/user', adminUserRoutes);
app.use('/api/admin/hotel', adminHotelRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

const bookingRoutes = require('./routes/bookingRoutes');
const couponRoutes = require('./routes/couponRoutes');
const roomRoutes = require('./routes/roomRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationsRouter = require('./routes/notificationRoutes');


app.use('/api/booking', bookingRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notification', notificationsRouter);


app.listen(process.env.PORT, process.env.HOST, () => {
  console.log(`Server is running at http://${process.env.HOST}:${process.env.PORT}`);
});
