const Photo = require('../models/Photo');
const Album = require('../models/Album');
const { uploadPhoto, deletePhoto } = require('../config/cloudinary');

// Upload single photo to album
const uploadPhotoToAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { note } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file provided'
      });
    }

    // Check if album exists and belongs to user
    const album = await Album.findOne({ _id: albumId, user: userId });
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found or access denied'
      });
    }

    // Upload to Cloudinary
    const cloudinaryResult = await uploadPhoto(req.file);

    // Create photo document
    const photo = new Photo({
      album: albumId,
      user: userId,
      name: req.file.originalname,
      note: note || '',
      ...cloudinaryResult
    });

    await photo.save();

    // Update album photo count
    await album.updatePhotoCount();

    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: photo
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload photo',
      error: error.message
    });
  }
};

// Upload multiple photos to album
const uploadMultiplePhotos = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { notes } = req.body; // Array of notes corresponding to photos
    const userId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photo files provided'
      });
    }

    // Check if album exists and belongs to user
    const album = await Album.findOne({ _id: albumId, user: userId });
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found or access denied'
      });
    }

    const uploadedPhotos = [];

    // Upload each photo to Cloudinary
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const note = notes && notes[i] ? notes[i] : '';

      try {
        const cloudinaryResult = await uploadPhoto(file);

        const photo = new Photo({
          album: albumId,
          user: userId,
          name: file.originalname,
          note: note,
          ...cloudinaryResult
        });

        await photo.save();
        uploadedPhotos.push(photo);
      } catch (uploadError) {
        console.error(`Failed to upload ${file.originalname}:`, uploadError);
        // Continue with other photos
      }
    }

    // Update album photo count
    await album.updatePhotoCount();

    res.status(201).json({
      success: true,
      message: `${uploadedPhotos.length} photos uploaded successfully`,
      data: uploadedPhotos
    });

  } catch (error) {
    console.error('Multiple photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload photos',
      error: error.message
    });
  }
};

// Get photos by album
const getPhotosByAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const userId = req.user.id;

    // Check if album exists and belongs to user
    const album = await Album.findOne({ _id: albumId, user: userId });
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found or access denied'
      });
    }

    const photos = await Photo.find({ album: albumId, user: userId })
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      data: photos
    });

  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get photos',
      error: error.message
    });
  }
};

// Update photo note
const updatePhotoNote = async (req, res) => {
  try {
    const { photoId } = req.params;
    const { note } = req.body;
    const userId = req.user.id;

    const photo = await Photo.findOne({ _id: photoId, user: userId });
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found or access denied'
      });
    }

    photo.note = note || '';
    await photo.save();

    res.json({
      success: true,
      message: 'Photo note updated successfully',
      data: photo
    });

  } catch (error) {
    console.error('Update photo note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update photo note',
      error: error.message
    });
  }
};

// Delete photo
const deletePhotoById = async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.user.id;

    const photo = await Photo.findOne({ _id: photoId, user: userId });
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found or access denied'
      });
    }

    // Delete from Cloudinary
    await deletePhoto(photo.publicId);

    // Get album to update photo count
    const album = await Album.findById(photo.album);

    // Delete photo document
    await Photo.findByIdAndDelete(photoId);

    // Update album photo count
    if (album) {
      await album.updatePhotoCount();
    }

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });

  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo',
      error: error.message
    });
  }
};

// Get all photos for user (for cluster view)
const getAllUserPhotos = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, sort = 'uploadedAt' } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: -1 }
    };

    const photos = await Photo.find({ user: userId })
      .populate('album', 'name genre color')
      .sort({ [sort]: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Photo.countDocuments({ user: userId });

    res.json({
      success: true,
      data: photos,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPhotos: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get all photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get photos',
      error: error.message
    });
  }
};

module.exports = {
  uploadPhotoToAlbum,
  uploadMultiplePhotos,
  getPhotosByAlbum,
  updatePhotoNote,
  deletePhotoById,
  getAllUserPhotos
};

