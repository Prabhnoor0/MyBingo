// src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { sendMessage, getHistory } = require('../controllers/chatController');

router.post('/', authenticateToken, sendMessage);
router.get('/', authenticateToken, getHistory);

module.exports = router;
