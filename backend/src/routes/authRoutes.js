const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/firebase', authController.loginWithFirebase);

// Protected route (requires token)
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;