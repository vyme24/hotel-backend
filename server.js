const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;
const dotenv = require('dotenv');
const connectDB = require('./database');

dotenv.config({});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

connectDB();

app.get('/', (req, res) => {
  res.send('API is working!');
});
// Import and use admin auth routes
const adminAuthRoutes = require('./routes/admin/authRoutes');
const adminUserRoutes = require('./routes/admin/userRoutes');
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/user', adminUserRoutes);



app.listen(process.env.PORT, process.env.HOST, () => {
  console.log(`Server is running at http://${process.env.HOST}:${process.env.PORT}`);
});

