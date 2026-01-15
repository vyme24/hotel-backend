
const express = require('express');
const HotelController = require('../../controllers/admin/HotelController');
const { verifyToken } = require('../../services/jwt');
const router = express.Router();

router.get('/getAll', verifyToken, HotelController.getAll);
router.get('/get/:id', verifyToken, HotelController.get);


module.exports = router;