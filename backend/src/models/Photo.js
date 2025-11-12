const db = require('../config/db');
const { MongooseQuery } = require('../config/db');

class Photo {
  constructor(data) {
    this._id = data._id || data.id || null;
    this.id = this._id;
    this.album = data.album;
    this.user = data.user;
    this.name = data.name || '';
    this.note = data.note || '';
    this.publicId = data.publicId;
    this.url = data.url;
    this.thumbnail = data.thumbnail || '';
    this.width = data.width || 0;
    this.height = data.height || 0;
    this.format = data.format || '';
    this.size = data.size || 0;
    
    // Normalize uploadedAt property
    if (data.uploadedAt && typeof data.uploadedAt.toDate === 'function') {
      this.uploadedAt = data.uploadedAt.toDate();
    } else if (data.uploadedAt) {
      this.uploadedAt = new Date(data.uploadedAt);
    } else {
      this.uploadedAt = new Date();
    }
  }

  get preview() {
    return this.thumbnail || this.url;
  }

  toJSON() {
    return {
      _id: this._id,
      id: this._id,
      album: this.album,
      user: this.user,
      name: this.name,
      note: this.note,
      publicId: this.publicId,
      url: this.url,
      thumbnail: this.thumbnail,
      width: this.width,
      height: this.height,
      format: this.format,
      size: this.size,
      preview: this.preview,
      uploadedAt: this.uploadedAt
    };
  }

  async save() {
    const dataToSave = {
      album: this.album,
      user: this.user,
      name: this.name,
      note: this.note,
      publicId: this.publicId,
      url: this.url,
      thumbnail: this.thumbnail,
      width: this.width,
      height: this.height,
      format: this.format,
      size: this.size,
      uploadedAt: this.uploadedAt
    };

    if (this._id) {
      await db.collection('photos').doc(this._id).update(dataToSave);
    } else {
      const docRef = await db.collection('photos').add(dataToSave);
      this._id = docRef.id;
      this.id = docRef.id;
    }
    return this;
  }

  static find(filter = {}) {
    return new MongooseQuery('photos', filter).map(Photo);
  }

  static findOne(filter = {}) {
    return new MongooseQuery('photos', filter).setFindOne().map(Photo);
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }

  static async findByIdAndDelete(id) {
    const docRef = db.collection('photos').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.delete();
    return new Photo({ _id: doc.id, ...doc.data() });
  }

  static async countDocuments(filter = {}) {
    const query = new MongooseQuery('photos', filter);
    const results = await query.exec();
    return results.length;
  }

  // Used for cascade deletion by Album
  static async deletePhotoById(id) {
    const { deletePhoto } = require('../config/cloudinary');
    const docRef = db.collection('photos').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const data = doc.data();
    try {
      if (data.publicId) {
        await deletePhoto(data.publicId);
      }
    } catch (err) {
      console.error('Failed to delete photo from Cloudinary during cascade:', err);
    }
    await docRef.delete();
    return new Photo({ _id: doc.id, ...data });
  }
}

module.exports = Photo;