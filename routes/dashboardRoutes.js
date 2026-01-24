const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../services/jwt');
const router = express.Router();

router.get('/get', verifyToken, DashboardController.get);


module.exports = router;