const db = require('../config/db');
const { MongooseQuery } = require('../config/db');

class HabitLog {
  constructor(data) {
    this._id = data._id || data.id || null;
    this.id = this._id;
    this.habit = data.habit;
    this.user = data.user;
    
    // Normalize date property (handling Firestore Timestamp, Date, or string)
    if (data.date && typeof data.date.toDate === 'function') {
      this.date = data.date.toDate();
    } else if (data.date) {
      this.date = new Date(data.date);
    } else {
      this.date = new Date();
    }
    
    this.status = data.status || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      _id: this._id,
      id: this._id,
      habit: this.habit,
      user: this.user,
      date: this.date,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  async save() {
    const dataToSave = {
      habit: this.habit,
      user: this.user,
      date: this.date,
      status: this.status,
      updatedAt: new Date()
    };

    if (this._id) {
      await db.collection('habitlogs').doc(this._id).update(dataToSave);
      this.updatedAt = dataToSave.updatedAt;
    } else {
      dataToSave.createdAt = new Date();
      const docRef = await db.collection('habitlogs').add(dataToSave);
      this._id = docRef.id;
      this.id = docRef.id;
      this.createdAt = dataToSave.createdAt;
      this.updatedAt = dataToSave.updatedAt;
    }
    return this;
  }

  static find(filter = {}) {
    return new MongooseQuery('habitlogs', filter).map(HabitLog);
  }

  static findOne(filter = {}) {
    return new MongooseQuery('habitlogs', filter).setFindOne().map(HabitLog);
  }

  static async findOneAndUpdate(filter = {}, updateData = {}, options = {}) {
    // If the filter has Date objects, normalize them to string date representations or do in-memory match
    // To make sure date filtering works perfectly (e.g. ignoring time offsets), we match the specific habit and target day
    const query = new MongooseQuery('habitlogs', filter).setFindOne().map(HabitLog);
    let log = await query;

    if (!log && options.upsert) {
      // Create new
      log = new HabitLog({
        ...filter,
        ...updateData
      });
      return log.save();
    }

    if (!log) return null;

    for (const [key, val] of Object.entries(updateData)) {
      if (val !== undefined) {
        log[key] = val;
      }
    }
    return log.save();
  }

  static async deleteMany(filter = {}) {
    const query = new MongooseQuery('habitlogs', filter);
    const logs = await query.exec();
    const batch = db.batch();
    logs.forEach(doc => {
      batch.delete(db.collection('habitlogs').doc(doc._id));
    });
    await batch.commit();
    return { deletedCount: logs.length };
  }
}

module.exports = HabitLog;