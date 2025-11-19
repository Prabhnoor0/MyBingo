const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { 
  uploadSingle, 
  uploadMultiple, 
  handleUploadError, 
  cleanupUploads 
} = require('../middlewares/photoUpload');
const {
  uploadPhotoToAlbum,
  uploadMultiplePhotos,
  getPhotosByAlbum,
  updatePhotoNote,
  deletePhotoById,
  getAllUserPhotos
} = require('../controllers/photoController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Upload single photo to album
router.post('/album/:albumId/single', 
  uploadSingle, 
  handleUploadError,
  uploadPhotoToAlbum,
  cleanupUploads
);

// Upload multiple photos to album
router.post('/album/:albumId/multiple', 
  uploadMultiple, 
  handleUploadError,
  uploadMultiplePhotos,
  cleanupUploads
);

// Get photos by album
router.get('/album/:albumId', getPhotosByAlbum);

// Get all photos for user (cluster view)
router.get('/user/all', getAllUserPhotos);

// Update photo note
router.patch('/:photoId/note', updatePhotoNote);

// Delete photo
router.delete('/:photoId', deletePhotoById);

module.exports = router;

