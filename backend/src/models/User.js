const db = require('../config/db');
const { MongooseQuery } = require('../config/db');

class User {
  constructor(data) {
    this._id = data._id || data.id || null;
    this.id = this._id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.password = data.password;
    this.photoURL = data.photoURL || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // To support serialization in response JSONs
  toJSON() {
    return {
      _id: this._id,
      id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      photoURL: this.photoURL,
      fullName: this.fullName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  async save() {
    const dataToSave = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      photoURL: this.photoURL,
      updatedAt: new Date()
    };

    if (this._id) {
      await db.collection('users').doc(this._id).update(dataToSave);
      this.updatedAt = dataToSave.updatedAt;
    } else {
      dataToSave.createdAt = new Date();
      const docRef = await db.collection('users').add(dataToSave);
      this._id = docRef.id;
      this.id = docRef.id;
      this.createdAt = dataToSave.createdAt;
      this.updatedAt = dataToSave.updatedAt;
    }
    return this;
  }

  static find(filter = {}) {
    return new MongooseQuery('users', filter).map(User);
  }

  static findOne(filter = {}) {
    return new MongooseQuery('users', filter).setFindOne().map(User);
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }

  static async findByIdAndDelete(id) {
    const docRef = db.collection('users').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.delete();
    return new User({ _id: doc.id, ...doc.data() });
  }
}

module.exports = User;