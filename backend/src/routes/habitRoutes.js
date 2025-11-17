const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  createHabit,
  getUserHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion,
  getHabitStats
} = require('../controllers/habitController');


router.use(authenticateToken);

router.post('/', createHabit);


router.get('/', getUserHabits);


router.get('/stats', getHabitStats);

router.get('/:habitId', getHabitById);

router.put('/:habitId', updateHabit);


router.delete('/:habitId', deleteHabit);


router.patch('/:habitId/toggle', toggleHabitCompletion);

module.exports = router;

