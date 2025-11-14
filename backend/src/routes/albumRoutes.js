const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  createAlbum,
  getUserAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  getAlbumStats
} = require('../controllers/albumController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create new album
router.post('/', createAlbum);

// Get all albums for user
router.get('/', getUserAlbums);

// Get album statistics (must come before /:albumId to avoid conflicts)
router.get('/stats', getAlbumStats);

// Get album by ID
router.get('/:albumId', getAlbumById);

// Update album
router.put('/:albumId', updateAlbum);

// Delete album
router.delete('/:albumId', deleteAlbum);

module.exports = router;
