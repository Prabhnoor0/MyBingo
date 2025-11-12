const db = require('../config/db');
const { MongooseQuery } = require('../config/db');

class Habit {
  constructor(data) {
    this._id = data._id || data.id || null;
    this.id = this._id;
    this.user = data.user;
    this.name = data.name;
    this.description = data.description || '';
    this.frequency = data.frequency || 'daily';
    this.icon = data.icon || '📝';
    this.color = data.color || '#4A90E2';
    this.goalCount = data.goalCount || 1;
    this.goalUnit = data.goalUnit || 'time';
    this.completedDates = data.completedDates || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get monthlyCompletionRate() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const monthDates = this.completedDates.filter(dateStr => {
      const date = new Date(dateStr);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    return Math.round((monthDates.length / daysInMonth) * 100);
  }

  toJSON() {
    return {
      _id: this._id,
      id: this._id,
      user: this.user,
      name: this.name,
      description: this.description,
      frequency: this.frequency,
      icon: this.icon,
      color: this.color,
      goalCount: this.goalCount,
      goalUnit: this.goalUnit,
      completedDates: this.completedDates,
      isActive: this.isActive,
      monthlyCompletionRate: this.monthlyCompletionRate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  async save() {
    const dataToSave = {
      user: this.user,
      name: this.name,
      description: this.description,
      frequency: this.frequency,
      icon: this.icon,
      color: this.color,
      goalCount: this.goalCount,
      goalUnit: this.goalUnit,
      completedDates: this.completedDates,
      isActive: this.isActive,
      updatedAt: new Date()
    };

    if (this._id) {
      await db.collection('habits').doc(this._id).update(dataToSave);
      this.updatedAt = dataToSave.updatedAt;
    } else {
      dataToSave.createdAt = new Date();
      const docRef = await db.collection('habits').add(dataToSave);
      this._id = docRef.id;
      this.id = docRef.id;
      this.createdAt = dataToSave.createdAt;
      this.updatedAt = dataToSave.updatedAt;
    }
    return this;
  }

  static find(filter = {}) {
    return new MongooseQuery('habits', filter).map(Habit);
  }

  static findOne(filter = {}) {
    return new MongooseQuery('habits', filter).setFindOne().map(Habit);
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }

  static async findByIdAndDelete(id) {
    // Cascade delete HabitLogs first
    const logsSnapshot = await db.collection('habitlogs').where('habit', '==', id).get();
    const batch = db.batch();
    logsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete Habit
    const docRef = db.collection('habits').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.delete();
    return new Habit({ _id: doc.id, ...doc.data() });
  }
}

module.exports = Habit;