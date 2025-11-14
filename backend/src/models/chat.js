const db = require('../config/db');
const { MongooseQuery } = require('../config/db');

class Chat {
  constructor(data) {
    this._id = data._id || data.id || null;
    this.id = this._id;
    this.user = data.user;
    
    // Normalize message dates
    this.messages = (data.messages || []).map(m => ({
      sender: m.sender,
      text: m.text,
      createdAt: m.createdAt && typeof m.createdAt.toDate === 'function' 
        ? m.createdAt.toDate() 
        : (m.createdAt ? new Date(m.createdAt) : new Date())
    }));
    
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      _id: this._id,
      id: this._id,
      user: this.user,
      messages: this.messages,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  async save() {
    const dataToSave = {
      user: this.user,
      messages: this.messages,
      updatedAt: new Date()
    };

    if (this._id) {
      await db.collection('chats').doc(this._id).update(dataToSave);
      this.updatedAt = dataToSave.updatedAt;
    } else {
      dataToSave.createdAt = new Date();
      const docRef = await db.collection('chats').add(dataToSave);
      this._id = docRef.id;
      this.id = docRef.id;
      this.createdAt = dataToSave.createdAt;
      this.updatedAt = dataToSave.updatedAt;
    }
    return this;
  }

  static find(filter = {}) {
    return new MongooseQuery('chats', filter).map(Chat);
  }

  static findOne(filter = {}) {
    return new MongooseQuery('chats', filter).setFindOne().map(Chat);
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }
}

module.exports = Chat;
