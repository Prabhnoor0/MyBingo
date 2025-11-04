const admin = require('./firebase');

// Get Firestore instance
const db = admin.firestore();

// Dummy connectDB to prevent server.js startup issues
const connectDB = async () => {
  console.log('✅ Firebase Firestore connected successfully');
};

// A highly compatible in-memory Query builder for Firestore to mimic Mongoose
class MongooseQuery {
  constructor(collectionName, filter = {}) {
    this.collectionName = collectionName;
    this.filter = filter;
    this._sortObj = null;
    this._limitVal = null;
    this._skipVal = null;
    this._populates = [];
    this._selectFields = null;
    this._cls = null;
    this._isFindOne = false;
  }

  sort(sortObj) {
    this._sortObj = sortObj;
    return this;
  }

  limit(limitVal) {
    this._limitVal = limitVal;
    return this;
  }

  skip(skipVal) {
    this._skipVal = skipVal;
    return this;
  }

  populate(field, selectFields) {
    this._populates.push({ field, selectFields });
    return this;
  }

  select(fieldsString) {
    if (typeof fieldsString === 'string') {
      this._selectFields = fieldsString.split(' ');
    }
    return this;
  }

  // Set class constructor to wrap returned documents
  map(cls) {
    this._cls = cls;
    return this;
  }

  // To support .lean() for raw object access
  lean() {
    this._cls = null; // Don't wrap in class if lean() is called
    return this;
  }

  setFindOne() {
    this._isFindOne = true;
    return this;
  }

  // Awaitable Thenable interface
  async then(resolve, reject) {
    try {
      const results = await this.exec();
      if (this._isFindOne) {
        resolve(results.length > 0 ? results[0] : null);
      } else {
        resolve(results);
      }
    } catch (err) {
      if (reject) {
        reject(err);
      } else {
        throw err;
      }
    }
  }

  async exec() {
    let ref = db.collection(this.collectionName);

    // Fetch all records to do safe, index-free in-memory processing
    const snapshot = await ref.get();
    let docs = [];
    snapshot.forEach(doc => {
      docs.push({ _id: doc.id, id: doc.id, ...doc.data() });
    });

    // 1. Filter documents in-memory
    if (this.filter && Object.keys(this.filter).length > 0) {
      docs = docs.filter(doc => {
        for (const [key, value] of Object.entries(this.filter)) {
          // Handle _id / id checks
          if (key === '_id' || key === 'id') {
            if (value && typeof value === 'object') {
              if ('$ne' in value && (doc._id === value['$ne'] || doc.id === value['$ne'])) return false;
              if ('$in' in value && !value['$in'].includes(doc._id) && !value['$in'].includes(doc.id)) return false;
            } else {
              if (doc._id !== value && doc.id !== value) return false;
            }
            continue;
          }

          if (value && typeof value === 'object' && !(value instanceof Date)) {
            // Operator filter (e.g. $gte, $lte, $ne, $in)
            if ('$gte' in value) {
              const docVal = getTimestampVal(doc[key]);
              const targetVal = getTimestampVal(value['$gte']);
              if (!(docVal >= targetVal)) return false;
            }
            if ('$lte' in value) {
              const docVal = getTimestampVal(doc[key]);
              const targetVal = getTimestampVal(value['$lte']);
              if (!(docVal <= targetVal)) return false;
            }
            if ('$ne' in value) {
              if (doc[key] === value['$ne']) return false;
            }
            if ('$in' in value) {
              if (!Array.isArray(value['$in']) || !value['$in'].includes(doc[key])) return false;
            }
          } else {
            // Equality check
            if (doc[key] !== value) return false;
          }
        }
        return true;
      });
    }

    // 2. Sort documents in-memory
    if (this._sortObj) {
      const [field, direction] = Object.entries(this._sortObj)[0];
      docs.sort((a, b) => {
        let valA = getTimestampVal(a[field]);
        let valB = getTimestampVal(b[field]);

        if (valA < valB) return direction === -1 || direction === 'desc' ? 1 : -1;
        if (valA > valB) return direction === -1 || direction === 'desc' ? -1 : 1;
        return 0;
      });
    }

    // 3. Skip & Limit
    if (this._skipVal !== null) {
      docs = docs.slice(this._skipVal);
    }
    if (this._limitVal !== null) {
      docs = docs.slice(0, this._limitVal);
    }

    // 4. Populate references
    for (const pop of this._populates) {
      for (const doc of docs) {
        if (pop.field === 'photos') {
          // Find photos for this album
          const pSnapshot = await db.collection('photos').where('album', '==', doc._id).get();
          const photos = [];
          pSnapshot.forEach(p => photos.push({ _id: p.id, id: p.id, ...p.data() }));
          // Sort photos by uploadedAt desc
          photos.sort((a,b) => getTimestampVal(b.uploadedAt) - getTimestampVal(a.uploadedAt));
          doc.photos = photos;
        } else if (pop.field === 'tracks') {
          // Find tracks for this playlist
          const tSnapshot = await db.collection('playlisttracks').where('playlist', '==', doc._id).get();
          const tracks = [];
          tSnapshot.forEach(t => tracks.push({ _id: t.id, id: t.id, ...t.data() }));
          // Sort tracks by createdAt asc
          tracks.sort((a,b) => getTimestampVal(a.createdAt) - getTimestampVal(b.createdAt));
          doc.tracks = tracks;
        } else if (pop.field === 'logs') {
          // Find HabitLogs for this habit
          const lSnapshot = await db.collection('habitlogs').where('habit', '==', doc._id).get();
          const logs = [];
          lSnapshot.forEach(l => logs.push({ _id: l.id, id: l.id, ...l.data() }));
          doc.logs = logs;
        } else if (pop.field === 'album') {
          // Populate album on Photo
          const albumDoc = await db.collection('albums').doc(doc.album).get();
          if (albumDoc.exists) {
            doc.album = { _id: albumDoc.id, id: albumDoc.id, ...albumDoc.data() };
          }
        }
      }
    }

    // 5. Select fields
    if (this._selectFields) {
      for (const doc of docs) {
        for (const field of this._selectFields) {
          if (field.startsWith('-')) {
            delete doc[field.substring(1)];
          }
        }
      }
    }

    // 6. Wrap documents if class mapping is set
    if (this._cls) {
      return docs.map(doc => new this._cls(doc));
    }

    return docs;
  }
}

// Helper to convert Firestore Timestamps or other values into numeric milliseconds
function getTimestampVal(val) {
  if (!val) return 0;
  if (val && typeof val.toDate === 'function') return val.toDate().getTime();
  if (val instanceof Date) return val.getTime();
  if (typeof val === 'string' && !isNaN(Date.parse(val))) return new Date(val).getTime();
  return val;
}

module.exports = db;
module.exports.connectDB = connectDB;
module.exports.MongooseQuery = MongooseQuery;