const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  getPlaylistStats
} = require('../controllers/playlistController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create new playlist
router.post('/', createPlaylist);

// Get all playlists for user
router.get('/', getUserPlaylists);

// Get playlist statistics
router.get('/stats', getPlaylistStats);

// Get playlist by ID
router.get('/:playlistId', getPlaylistById);

// Update playlist
router.put('/:playlistId', updatePlaylist);

// Delete playlist
router.delete('/:playlistId', deletePlaylist);

// Add track to playlist
router.post('/:playlistId/tracks', addTrackToPlaylist);

// Remove track from playlist
router.delete('/:playlistId/tracks/:trackId', removeTrackFromPlaylist);

module.exports = router;

