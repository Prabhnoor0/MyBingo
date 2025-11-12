const db = require('../config/db');
const { MongooseQuery } = require('../config/db');

class GratitudeEntry {
  constructor(data) {
    this._id = data._id || data.id || null;
    this.id = this._id;
    this.user = data.user;
    this.note = data.note;
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      _id: this._id,
      id: this._id,
      user: this.user,
      note: this.note,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  async save() {
    const dataToSave = {
      user: this.user,
      note: this.note,
      tags: this.tags,
      updatedAt: new Date()
    };

    if (this._id) {
      await db.collection('gratitude').doc(this._id).update(dataToSave);
      this.updatedAt = dataToSave.updatedAt;
    } else {
      dataToSave.createdAt = new Date();
      const docRef = await db.collection('gratitude').add(dataToSave);
      this._id = docRef.id;
      this.id = docRef.id;
      this.createdAt = dataToSave.createdAt;
      this.updatedAt = dataToSave.updatedAt;
    }
    return this;
  }

  static find(filter = {}) {
    return new MongooseQuery('gratitude', filter).map(GratitudeEntry);
  }

  static findOne(filter = {}) {
    return new MongooseQuery('gratitude', filter).setFindOne().map(GratitudeEntry);
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }

  static async findByIdAndDelete(id) {
    const docRef = db.collection('gratitude').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.delete();
    return new GratitudeEntry({ _id: doc.id, ...doc.data() });
  }

  static async countDocuments(filter = {}) {
    const query = new MongooseQuery('gratitude', filter);
    const results = await query.exec();
    return results.length;
  }
}

module.exports = GratitudeEntry;