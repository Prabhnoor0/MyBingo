const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  createGratitudeEntry,
  getUserGratitudeEntries,
  getGratitudeEntryById,
  updateGratitudeEntry,
  deleteGratitudeEntry,
  getGratitudeStats
} = require('../controllers/gratitudeController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create new gratitude entry
router.post('/', createGratitudeEntry);

// Get all gratitude entries for user
router.get('/', getUserGratitudeEntries);

// Get gratitude statistics
router.get('/stats', getGratitudeStats);

// Get gratitude entry by ID
router.get('/:entryId', getGratitudeEntryById);

// Update gratitude entry
router.put('/:entryId', updateGratitudeEntry);

// Delete gratitude entry
router.delete('/:entryId', deleteGratitudeEntry);

module.exports = router;

