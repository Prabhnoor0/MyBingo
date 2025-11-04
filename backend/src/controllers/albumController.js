const Album = require('../models/Album');

// Create new album
const createAlbum = async (req, res) => {
  try {
    const { name, description, genre, color, icon } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Album name is required'
      });
    }

    // Check if album with same name already exists for user
    const existingAlbum = await Album.findOne({ name, user: userId });
    if (existingAlbum) {
      return res.status(400).json({
        success: false,
        message: 'An album with this name already exists'
      });
    }

    const album = new Album({
      user: userId,
      name,
      description: description || '',
      genre: genre || 'personal',
      color: color || 'bg-gradient-to-br from-[#D4B896] to-[#E8D5B7]',
      icon: icon || 'Camera'
    });

    await album.save();

    res.status(201).json({
      success: true,
      message: 'Album created successfully',
      data: album
    });

  } catch (error) {
    console.error('Create album error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create album',
      error: error.message
    });
  }
};

// Get all albums for user
const getUserAlbums = async (req, res) => {
  try {
    const userId = req.user.id;
    const { genre, sort = 'createdAt' } = req.query;

    let query = { user: userId };
    
    // Filter by genre if specified
    if (genre) {
      query.genre = genre;
    }

    const albums = await Album.find(query)
      .sort({ [sort]: -1 })
      .populate('photos', 'url thumbnail note uploadedAt');

    res.json({
      success: true,
      data: albums
    });

  } catch (error) {
    console.error('Get user albums error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get albums',
      error: error.message
    });
  }
};

// Get album by ID
const getAlbumById = async (req, res) => {
  try {
    const { albumId } = req.params;
    const userId = req.user.id;

    const album = await Album.findOne({ _id: albumId, user: userId })
      .populate('photos', 'url thumbnail note uploadedAt name width height');

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found or access denied'
      });
    }

    res.json({
      success: true,
      data: album
    });

  } catch (error) {
    console.error('Get album error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get album',
      error: error.message
    });
  }
};

// Update album
const updateAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { name, description, genre, color, icon, isPublic } = req.body;
    const userId = req.user.id;

    const album = await Album.findOne({ _id: albumId, user: userId });
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found or access denied'
      });
    }

    // Check if new name conflicts with existing album
    if (name && name !== album.name) {
      const existingAlbum = await Album.findOne({ name, user: userId, _id: { $ne: albumId } });
      if (existingAlbum) {
        return res.status(400).json({
          success: false,
          message: 'An album with this name already exists'
        });
      }
    }

    // Update fields
    if (name !== undefined) album.name = name;
    if (description !== undefined) album.description = description;
    if (genre !== undefined) album.genre = genre;
    if (color !== undefined) album.color = color;
    if (icon !== undefined) album.icon = icon;
    if (isPublic !== undefined) album.isPublic = isPublic;

    await album.save();

    res.json({
      success: true,
      message: 'Album updated successfully',
      data: album
    });

  } catch (error) {
    console.error('Update album error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update album',
      error: error.message
    });
  }
};

// Delete album
const deleteAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const userId = req.user.id;

    const album = await Album.findOne({ _id: albumId, user: userId });
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found or access denied'
      });
    }

    // Album deletion will cascade to photos due to pre-delete hook
    await Album.findByIdAndDelete(albumId);

    res.json({
      success: true,
      message: 'Album deleted successfully'
    });

  } catch (error) {
    console.error('Delete album error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete album',
      error: error.message
    });
  }
};

// Get album statistics
const getAlbumStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Album.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalAlbums: { $sum: 1 },
          totalPhotos: { $sum: '$photoCount' },
          genreDistribution: {
            $push: {
              genre: '$genre',
              count: 1
            }
          }
        }
      }
    ]);

    const genreStats = {};
    if (stats.length > 0 && stats[0].genreDistribution) {
      stats[0].genreDistribution.forEach(item => {
        genreStats[item.genre] = (genreStats[item.genre] || 0) + item.count;
      });
    }

    res.json({
      success: true,
      data: {
        totalAlbums: stats.length > 0 ? stats[0].totalAlbums : 0,
        totalPhotos: stats.length > 0 ? stats[0].totalPhotos : 0,
        genreDistribution: genreStats
      }
    });

  } catch (error) {
    console.error('Get album stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get album statistics',
      error: error.message
    });
  }
};

module.exports = {
  createAlbum,
  getUserAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  getAlbumStats
};

