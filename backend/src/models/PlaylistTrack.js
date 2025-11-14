const db = require('../config/db');
const { MongooseQuery } = require('../config/db');

class PlaylistTrack {
  constructor(data) {
    this._id = data._id || data.id || null;
    this.id = this._id;
    this.playlist = data.playlist;
    this.user = data.user || null;
    this.title = data.title;
    this.artist = data.artist || '';
    this.artist_name = data.artist_name || this.artist;
    this.url = data.url || '';
    this.thumbnail = data.thumbnail || '';
    this.duration = data.duration || 0;
    this.externalId = data.externalId || '';
    this.source = data.source || 'other';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      _id: this._id,
      id: this._id,
      playlist: this.playlist,
      user: this.user,
      title: this.title,
      artist: this.artist,
      artist_name: this.artist_name,
      url: this.url,
      thumbnail: this.thumbnail,
      duration: this.duration,
      externalId: this.externalId,
      source: this.source,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  async save() {
    const dataToSave = {
      playlist: this.playlist,
      user: this.user,
      title: this.title,
      artist: this.artist,
      artist_name: this.artist_name,
      url: this.url,
      thumbnail: this.thumbnail,
      duration: this.duration,
      externalId: this.externalId,
      source: this.source,
      updatedAt: new Date()
    };

    if (this._id) {
      await db.collection('playlisttracks').doc(this._id).update(dataToSave);
      this.updatedAt = dataToSave.updatedAt;
    } else {
      dataToSave.createdAt = new Date();
      const docRef = await db.collection('playlisttracks').add(dataToSave);
      this._id = docRef.id;
      this.id = docRef.id;
      this.createdAt = dataToSave.createdAt;
      this.updatedAt = dataToSave.updatedAt;
    }
    return this;
  }

  static find(filter = {}) {
    return new MongooseQuery('playlisttracks', filter).map(PlaylistTrack);
  }

  static findOne(filter = {}) {
    return new MongooseQuery('playlisttracks', filter).setFindOne().map(PlaylistTrack);
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }

  static async findByIdAndDelete(id) {
    const docRef = db.collection('playlisttracks').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.delete();
    return new PlaylistTrack({ _id: doc.id, ...doc.data() });
  }
}

module.exports = PlaylistTrack;