
const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const { authenticateToken } = require('../middlewares/auth'); // JWT middleware

router.use(authenticateToken);


router.post('/', journalController.createJournal);
router.post('/analyze', journalController.analyzeJournal);


router.get('/', journalController.getJournals);


router.get('/:id', journalController.getJournal);


router.put('/:id', journalController.updateJournal);


router.delete('/:id', journalController.deleteJournal);


router.patch('/:id/favorite', async (req, res) => {
  try {
    const entry = await require('../models/JournalEntry').findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isFavorite: req.body.isFavorite },
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: 'Journal not found' });
    res.json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/tags', async (req, res) => {
  try {
    const entry = await require('../models/JournalEntry').findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { tags: req.body.tags },
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: 'Journal not found' });
    res.json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;