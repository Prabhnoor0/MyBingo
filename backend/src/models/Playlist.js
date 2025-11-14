const db = require('../config/db');
const { MongooseQuery } = require('../config/db');

class Playlist {
  constructor(data) {
    this._id = data._id || data.id || null;
    this.id = this._id;
    this.user = data.user;
    this.name = data.name;
    this.description = data.description || '';
    this.isPublic = data.isPublic || false;
    this.tags = data.tags || [];
    this.tracks = data.tracks || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get trackCount() {
    return this.tracks ? this.tracks.length : 0;
  }

  toJSON() {
    return {
      _id: this._id,
      id: this._id,
      user: this.user,
      name: this.name,
      description: this.description,
      isPublic: this.isPublic,
      tags: this.tags,
      tracks: this.tracks,
      trackCount: this.trackCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  async save() {
    const dataToSave = {
      user: this.user,
      name: this.name,
      description: this.description,
      isPublic: this.isPublic,
      tags: this.tags,
      updatedAt: new Date()
    };

    if (this._id) {
      await db.collection('playlists').doc(this._id).update(dataToSave);
      this.updatedAt = dataToSave.updatedAt;
    } else {
      dataToSave.createdAt = new Date();
      const docRef = await db.collection('playlists').add(dataToSave);
      this._id = docRef.id;
      this.id = docRef.id;
      this.createdAt = dataToSave.createdAt;
      this.updatedAt = dataToSave.updatedAt;
    }
    return this;
  }

  static find(filter = {}) {
    return new MongooseQuery('playlists', filter).map(Playlist);
  }

  static findOne(filter = {}) {
    return new MongooseQuery('playlists', filter).setFindOne().map(Playlist);
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }

  static async findByIdAndDelete(id) {
    // Cascade delete PlaylistTracks first
    const tracksSnapshot = await db.collection('playlisttracks').where('playlist', '==', id).get();
    const batch = db.batch();
    tracksSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete playlist
    const docRef = db.collection('playlists').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.delete();
    return new Playlist({ _id: doc.id, ...doc.data() });
  }

  static async aggregate(pipeline = []) {
    // Used in getPlaylistStats in playlistController.js:
    // stats = await Playlist.aggregate([ { $match: { user: userId } }, { $lookup: { from: 'playlisttracks', ... } }, { $group: { _id: null, totalPlaylists: { $sum: 1 }, totalTracks: { ... } } } ])
    const matchStage = pipeline.find(stage => stage.$match);
    const userId = matchStage ? matchStage.$match.user : null;

    if (!userId) return [];

    const playlistsSnapshot = await db.collection('playlists').where('user', '==', userId).get();
    let totalPlaylists = 0;
    let totalTracks = 0;
    let publicPlaylists = 0;

    for (const doc of playlistsSnapshot.docs) {
      const data = doc.data();
      totalPlaylists += 1;
      if (data.isPublic) publicPlaylists += 1;

      // Count tracks for this playlist
      const tracksSnapshot = await db.collection('playlisttracks').where('playlist', '==', doc.id).get();
      totalTracks += tracksSnapshot.size;
    }

    return [{
      _id: null,
      totalPlaylists,
      totalTracks,
      publicPlaylists
    }];
  }
}

module.exports = Playlist;