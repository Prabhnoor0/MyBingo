const GratitudeEntry = require('../models/GratitudeEntry');

// Create new gratitude entry
const createGratitudeEntry = async (req, res) => {
  try {
    const { note, tags } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!note || note.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Gratitude note is required'
      });
    }

    const gratitudeEntry = new GratitudeEntry({
      user: userId,
      note: note.trim(),
      tags: tags || []
    });

    await gratitudeEntry.save();

    res.status(201).json({
      success: true,
      message: 'Gratitude entry created successfully',
      data: gratitudeEntry
    });

  } catch (error) {
    console.error('Create gratitude entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create gratitude entry',
      error: error.message
    });
  }
};

// Get all gratitude entries for user
const getUserGratitudeEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, sort = 'createdAt' } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: -1 }
    };

    const gratitudeEntries = await GratitudeEntry.find({ user: userId })
      .sort({ [sort]: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await GratitudeEntry.countDocuments({ user: userId });

    res.json({
      success: true,
      data: gratitudeEntries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEntries: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get user gratitude entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get gratitude entries',
      error: error.message
    });
  }
};

// Get gratitude entry by ID
const getGratitudeEntryById = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;

    const gratitudeEntry = await GratitudeEntry.findOne({ _id: entryId, user: userId });

    if (!gratitudeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Gratitude entry not found or access denied'
      });
    }

    res.json({
      success: true,
      data: gratitudeEntry
    });

  } catch (error) {
    console.error('Get gratitude entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get gratitude entry',
      error: error.message
    });
  }
};

// Update gratitude entry
const updateGratitudeEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { note, tags } = req.body;
    const userId = req.user.id;

    const gratitudeEntry = await GratitudeEntry.findOne({ _id: entryId, user: userId });
    if (!gratitudeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Gratitude entry not found or access denied'
      });
    }

    // Validate note if provided
    if (note !== undefined && note.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Gratitude note cannot be empty'
      });
    }

    // Update fields
    if (note !== undefined) gratitudeEntry.note = note.trim();
    if (tags !== undefined) gratitudeEntry.tags = tags;

    await gratitudeEntry.save();

    res.json({
      success: true,
      message: 'Gratitude entry updated successfully',
      data: gratitudeEntry
    });

  } catch (error) {
    console.error('Update gratitude entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gratitude entry',
      error: error.message
    });
  }
};

// Delete gratitude entry
const deleteGratitudeEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;

    const gratitudeEntry = await GratitudeEntry.findOne({ _id: entryId, user: userId });
    if (!gratitudeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Gratitude entry not found or access denied'
      });
    }

    await GratitudeEntry.findByIdAndDelete(entryId);

    res.json({
      success: true,
      message: 'Gratitude entry deleted successfully'
    });

  } catch (error) {
    console.error('Delete gratitude entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gratitude entry',
      error: error.message
    });
  }
};

// Get gratitude statistics
const getGratitudeStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Get entries for the specified month
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    const monthlyEntries = await GratitudeEntry.find({
      user: userId,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Get total entries
    const totalEntries = await GratitudeEntry.countDocuments({ user: userId });

    // Get tag statistics
    const tagStats = {};
    monthlyEntries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
      });
    });

    // Get streak information (consecutive days with entries)
    const allEntries = await GratitudeEntry.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('createdAt');

    // Helper to get YYYY-MM-DD string in local time
    const toDayKey = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Build a set of unique day keys from all entries
    const dayKeysSet = new Set(allEntries.map(e => toDayKey(new Date(e.createdAt))));

    // Compute current streak: consecutive days ending today or yesterday
    let currentStreak = 0;
    let cursor = new Date();
    let todayKey = toDayKey(cursor);
    
    // If no entry today, check if there's an entry yesterday to keep streak alive
    if (!dayKeysSet.has(todayKey)) {
      cursor.setDate(cursor.getDate() - 1);
    }
    
    // Count backwards from whatever starting cursor we decided (today or yesterday)
    while (dayKeysSet.has(toDayKey(cursor))) {
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Compute longest streak across all days
    // Sort unique day keys ascending and count runs of consecutive days
    const uniqueDays = Array.from(dayKeysSet).sort(); // 'YYYY-MM-DD' lexical sort works by date
    let longestStreak = 0;
    let runLength = 0;
    let prevDate = null;
    for (const key of uniqueDays) {
      const currentDate = new Date(key + 'T00:00:00');
      if (prevDate) {
        const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          runLength += 1;
        } else {
          runLength = 1;
        }
      } else {
        runLength = 1;
      }
      longestStreak = Math.max(longestStreak, runLength);
      prevDate = currentDate;
    }

    res.json({
      success: true,
      data: {
        month: targetMonth + 1,
        year: targetYear,
        monthlyEntries: monthlyEntries.length,
        totalEntries,
        tagStats,
        streaks: {
          current: currentStreak,
          longest: longestStreak
        }
      }
    });

  } catch (error) {
    console.error('Get gratitude stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get gratitude statistics',
      error: error.message
    });
  }
};

module.exports = {
  createGratitudeEntry,
  getUserGratitudeEntries,
  getGratitudeEntryById,
  updateGratitudeEntry,
  deleteGratitudeEntry,
  getGratitudeStats
};

