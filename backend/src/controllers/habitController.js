const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');


const createHabit = async (req, res) => {
  try {
    const { name, description, frequency, icon, color, goalCount, goalUnit } = req.body;
    const userId = req.user.id;

   
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Habit name is required'
      });
    }

    const habit = new Habit({
      user: userId,
      name,
      description: description || '',
      frequency: frequency || 'daily',
      icon: icon || '📝',
      color: color || '#4A90E2',
      goalCount: goalCount || 1,
      goalUnit: goalUnit || 'time',
      completedDates: []
    });
    await habit.save();

    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      data: habit
    });

  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create habit',
      error: error.message
    });
  }
};


const getUserHabits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { frequency, isActive } = req.query;

    let query = { user: userId };
  
    if (frequency) {
      query.frequency = frequency;
    }
    
  
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const habits = await Habit.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: habits
    });

  } catch (error) {
    console.error('Get user habits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get habits',
      error: error.message
    });
  }
};

const getHabitById = async (req, res) => {
  try {
    const { habitId } = req.params;
    const userId = req.user.id;

    const habit = await Habit.findOne({ _id: habitId, user: userId });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found or access denied'
      });
    }

    res.json({
      success: true,
      data: habit
    });

  } catch (error) {
    console.error('Get habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get habit',
      error: error.message
    });
  }
};


const updateHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const { name, description, frequency, icon, color, goalCount, goalUnit, isActive } = req.body;
    const userId = req.user.id;

    const habit = await Habit.findOne({ _id: habitId, user: userId });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found or access denied'
      });
    }


    if (name !== undefined) habit.name = name;
    if (description !== undefined) habit.description = description;
    if (frequency !== undefined) habit.frequency = frequency;
    if (icon !== undefined) habit.icon = icon;
    if (color !== undefined) habit.color = color;
    if (goalCount !== undefined) habit.goalCount = goalCount;
    if (goalUnit !== undefined) habit.goalUnit = goalUnit;
    if (isActive !== undefined) habit.isActive = isActive;

    await habit.save();

    res.json({
      success: true,
      message: 'Habit updated successfully',
      data: habit
    });

  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update habit',
      error: error.message
    });
  }
};


const deleteHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const userId = req.user.id;

    const habit = await Habit.findOne({ _id: habitId, user: userId });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found or access denied'
      });
    }

  
    await Habit.findByIdAndDelete(habitId);

    res.json({
      success: true,
      message: 'Habit deleted successfully'
    });

  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete habit',
      error: error.message
    });
  }
};


const toggleHabitCompletion = async (req, res) => {
  try {
    const { habitId } = req.params;
    const { date } = req.body; // Format: YYYY-MM-DD
    const userId = req.user.id;

    const habit = await Habit.findOne({ _id: habitId, user: userId });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found or access denied'
      });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    const completedDates = habit.completedDates || [];
    const isCompleted = completedDates.includes(targetDate);

    if (isCompleted) {
  
      habit.completedDates = completedDates.filter(d => d !== targetDate);
    } else {

      habit.completedDates = [...completedDates, targetDate];
    }

    await habit.save();

   
    const logData = {
      habit: habitId,
      user: userId,
      date: new Date(targetDate),
      status: !isCompleted
    };

    await HabitLog.findOneAndUpdate(
      { habit: habitId, date: new Date(targetDate) },
      logData,
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Habit ${isCompleted ? 'unmarked' : 'marked'} as completed for ${targetDate}`,
      data: {
        habit,
        isCompleted: !isCompleted,
        date: targetDate
      }
    });

  } catch (error) {
    console.error('Toggle habit completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle habit completion',
      error: error.message
    });
  }
};


const getHabitStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { habitId, month, year } = req.query;

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    let query = { user: userId };
    if (habitId) {
      query._id = habitId;
    }

    const habits = await Habit.find(query);
    
    const stats = habits.map(habit => {
      const monthDates = habit.completedDates.filter(dateStr => {
        const date = new Date(dateStr);
        return date.getMonth() === targetMonth && date.getFullYear() === targetYear;
      });

      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const completionRate = Math.round((monthDates.length / daysInMonth) * 100);

      return {
        habitId: habit._id,
        habitName: habit.name,
        totalCompletions: monthDates.length,
        daysInMonth,
        completionRate,
        completedDates: monthDates
      };
    });

    res.json({
      success: true,
      data: {
        month: targetMonth + 1,
        year: targetYear,
        habits: stats
      }
    });

  } catch (error) {
    console.error('Get habit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get habit statistics',
      error: error.message
    });
  }
};

module.exports = {
  createHabit,
  getUserHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion,
  getHabitStats
};

