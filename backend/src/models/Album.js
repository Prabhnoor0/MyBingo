const db = require('../config/db');
const { MongooseQuery } = require('../config/db');

class Album {
  constructor(data) {
    this._id = data._id || data.id || null;
    this.id = this._id;
    this.user = data.user;
    this.name = data.name;
    this.description = data.description || '';
    this.genre = data.genre || 'personal';
    this.icon = data.icon || 'Camera';
    this.photoCount = data.photoCount || 0;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.photos = data.photos || [];
  }

  toJSON() {
    return {
      _id: this._id,
      id: this._id,
      user: this.user,
      name: this.name,
      description: this.description,
      genre: this.genre,
      icon: this.icon,
      photoCount: this.photoCount,
      photos: this.photos,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  async save() {
    const dataToSave = {
      user: this.user,
      name: this.name,
      description: this.description,
      genre: this.genre,
      icon: this.icon,
      photoCount: this.photoCount,
      updatedAt: new Date()
    };

    if (this._id) {
      await db.collection('albums').doc(this._id).update(dataToSave);
      this.updatedAt = dataToSave.updatedAt;
    } else {
      dataToSave.createdAt = new Date();
      const docRef = await db.collection('albums').add(dataToSave);
      this._id = docRef.id;
      this.id = docRef.id;
      this.createdAt = dataToSave.createdAt;
      this.updatedAt = dataToSave.updatedAt;
    }
    return this;
  }

  async updatePhotoCount() {
    // Count photos from Firestore collection where album matches
    const snapshot = await db.collection('photos').where('album', '==', this._id).get();
    this.photoCount = snapshot.size;
    return this.save();
  }

  static find(filter = {}) {
    return new MongooseQuery('albums', filter).map(Album);
  }

  static findOne(filter = {}) {
    return new MongooseQuery('albums', filter).setFindOne().map(Album);
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }

  static async findByIdAndDelete(id) {
    const Photo = require('./Photo');
    
    // 1. Delete all photos in the album (both from Cloudinary and Firestore)
    const photosSnapshot = await db.collection('photos').where('album', '==', id).get();
    for (const doc of photosSnapshot.docs) {
      const p = new Photo({ _id: doc.id, ...doc.data() });
      await Photo.deletePhotoById(p._id);
    }

    // 2. Delete Album document
    const albumRef = db.collection('albums').doc(id);
    const albumDoc = await albumRef.get();
    if (!albumDoc.exists) return null;
    await albumRef.delete();
    return new Album({ _id: albumDoc.id, ...albumDoc.data() });
  }

  static async aggregate(pipeline = []) {
    // Mongoose aggregate is used in getAlbumStats in albumController.js:
    // stats = await Album.aggregate([ { $match: { user: userId } }, { $group: { _id: null, totalAlbums: { $sum: 1 }, totalPhotos: { $sum: '$photoCount' }, ... } } ])
    // Let's implement it in JS!
    const matchStage = pipeline.find(stage => stage.$match);
    const userId = matchStage ? matchStage.$match.user : null;

    if (!userId) return [];

    const snapshot = await db.collection('albums').where('user', '==', userId).get();
    let totalAlbums = 0;
    let totalPhotos = 0;
    const genreDistribution = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      totalAlbums += 1;
      totalPhotos += (data.photoCount || 0);
      genreDistribution.push({
        genre: data.genre || 'personal',
        count: 1
      });
    });

    return [{
      _id: null,
      totalAlbums,
      totalPhotos,
      genreDistribution
    }];
  }
}

module.exports = Album;