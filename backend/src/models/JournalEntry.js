const db = require('../config/db');
const { MongooseQuery } = require('../config/db');

class JournalEntry {
  constructor(data) {
    this._id = data._id || data.id || null;
    this.id = this._id;
    this.user = data.user;
    this.title = data.title;
    this.content = data.content;
    this.mood = data.mood || 'neutral';
    this.tags = data.tags || [];
    this.isFavorite = data.isFavorite || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      _id: this._id,
      id: this._id,
      user: this.user,
      title: this.title,
      content: this.content,
      mood: this.mood,
      tags: this.tags,
      isFavorite: this.isFavorite,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  async save() {
    const dataToSave = {
      user: this.user,
      title: this.title,
      content: this.content,
      mood: this.mood,
      tags: this.tags,
      isFavorite: this.isFavorite,
      updatedAt: new Date()
    };

    if (this._id) {
      await db.collection('journals').doc(this._id).update(dataToSave);
      this.updatedAt = dataToSave.updatedAt;
    } else {
      dataToSave.createdAt = new Date();
      const docRef = await db.collection('journals').add(dataToSave);
      this._id = docRef.id;
      this.id = docRef.id;
      this.createdAt = dataToSave.createdAt;
      this.updatedAt = dataToSave.updatedAt;
    }
    return this;
  }

  static find(filter = {}) {
    return new MongooseQuery('journals', filter).map(JournalEntry);
  }

  static findOne(filter = {}) {
    return new MongooseQuery('journals', filter).setFindOne().map(JournalEntry);
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }

  static async create(data) {
    const entry = new JournalEntry(data);
    return entry.save();
  }

  static async findOneAndUpdate(filter = {}, updateData = {}, options = {}) {
    const query = new MongooseQuery('journals', filter).setFindOne().map(JournalEntry);
    const entry = await query;
    if (!entry) return null;

    for (const [key, val] of Object.entries(updateData)) {
      if (val !== undefined) {
        entry[key] = val;
      }
    }
    return entry.save();
  }

  static async findOneAndDelete(filter = {}) {
    const query = new MongooseQuery('journals', filter).setFindOne().map(JournalEntry);
    const entry = await query;
    if (!entry) return null;
    await db.collection('journals').doc(entry._id).delete();
    return entry;
  }
}

module.exports = JournalEntry;