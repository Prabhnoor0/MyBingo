const Playlist = require('../models/Playlist');
const PlaylistTrack = require('../models/PlaylistTrack');

// Create new playlist
const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, tags } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Playlist name is required'
      });
    }

    const playlist = new Playlist({
      user: userId,
      name: name.trim(),
      description: description || '',
      isPublic: isPublic || false,
      tags: tags || []
    });

    await playlist.save();

    res.status(201).json({
      success: true,
      message: 'Playlist created successfully',
      data: playlist
    });

  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create playlist',
      error: error.message
    });
  }
};

// Get all playlists for user
const getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isPublic, sort = 'createdAt' } = req.query;

    let query = { user: userId };
    
    // Filter by public status if specified
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    const playlists = await Playlist.find(query)
      .sort({ [sort]: -1 })
      .populate('tracks', 'title artist artist_name duration thumbnail url externalId source');

    res.json({
      success: true,
      data: playlists
    });

  } catch (error) {
    console.error('Get user playlists error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get playlists',
      error: error.message
    });
  }
};

// Get playlist by ID with tracks
const getPlaylistById = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId })
      .populate('tracks', 'title artist artist_name duration thumbnail url externalId source');

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found or access denied'
      });
    }

    res.json({
      success: true,
      data: playlist
    });

  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get playlist',
      error: error.message
    });
  }
};

// Update playlist
const updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name, description, isPublic, tags } = req.body;
    const userId = req.user.id;

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found or access denied'
      });
    }

    // Update fields
    if (name !== undefined) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    if (tags !== undefined) playlist.tags = tags;

    await playlist.save();

    res.json({
      success: true,
      message: 'Playlist updated successfully',
      data: playlist
    });

  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update playlist',
      error: error.message
    });
  }
};

// Delete playlist
const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found or access denied'
      });
    }

    // Playlist deletion will cascade to tracks due to pre-delete hook
    await Playlist.findByIdAndDelete(playlistId);

    res.json({
      success: true,
      message: 'Playlist deleted successfully'
    });

  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete playlist',
      error: error.message
    });
  }
};

// Add track to playlist
const addTrackToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { title, artist, artist_name, url, thumbnail, duration, externalId, source } = req.body;
    const userId = req.user.id;

    // Check if playlist exists and belongs to user
    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found or access denied'
      });
    }

    // Validate required fields
    if (!title || !artist) {
      return res.status(400).json({
        success: false,
        message: 'Track title and artist are required'
      });
    }

    const track = new PlaylistTrack({
      playlist: playlistId,
      user: userId,
      title: title.trim(),
      artist: artist.trim(),
      artist_name: artist_name || artist.trim(),
      url: url || '',
      thumbnail: thumbnail || '',
      duration: duration || 0,
      externalId: externalId || '',
      source: source || 'other'
    });

    await track.save();

    res.status(201).json({
      success: true,
      message: 'Track added to playlist successfully',
      data: track
    });

  } catch (error) {
    console.error('Add track to playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add track to playlist',
      error: error.message
    });
  }
};

// Remove track from playlist
const removeTrackFromPlaylist = async (req, res) => {
  try {
    const { playlistId, trackId } = req.params;
    const userId = req.user.id;

    // Check if playlist exists and belongs to user
    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found or access denied'
      });
    }

    // Check if track exists and belongs to the playlist
    const track = await PlaylistTrack.findOne({ _id: trackId, playlist: playlistId });
    if (!track) {
      return res.status(404).json({
        success: false,
        message: 'Track not found in playlist'
      });
    }

    await PlaylistTrack.findByIdAndDelete(trackId);

    res.json({
      success: true,
      message: 'Track removed from playlist successfully'
    });

  } catch (error) {
    console.error('Remove track from playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove track from playlist',
      error: error.message
    });
  }
};

// Get playlist statistics
const getPlaylistStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Playlist.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: 'playlisttracks',
          localField: '_id',
          foreignField: 'playlist',
          as: 'tracks'
        }
      },
      {
        $group: {
          _id: null,
          totalPlaylists: { $sum: 1 },
          totalTracks: { $sum: { $size: '$tracks' } },
          publicPlaylists: {
            $sum: { $cond: ['$isPublic', 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalPlaylists: stats.length > 0 ? stats[0].totalPlaylists : 0,
        totalTracks: stats.length > 0 ? stats[0].totalTracks : 0,
        publicPlaylists: stats.length > 0 ? stats[0].publicPlaylists : 0
      }
    });

  } catch (error) {
    console.error('Get playlist stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get playlist statistics',
      error: error.message
    });
  }
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  getPlaylistStats
};

