const express = require('express');
const UserController = require('../../controllers/admin/UserController');
const { verifyToken } = require('../../services/jwt');
const router = express.Router();

router.get('/get', verifyToken, UserController.getUser);


module.exports = router;