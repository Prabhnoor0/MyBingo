"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Music, Search, Plus, Play, List, Sparkles, MoreVertical } from "lucide-react"
import { Link } from "react-router-dom"
import jamendoApi from "../services/jamendoApi"
import { usePlaylist } from "../contexts/PlaylistContext"
import PlaylistManager from "../components/PlaylistManager"
import MusicPlayer from "../components/MusicPlayer"

export default function CalmingPlaylistPage() {
  const [tracks, setTracks] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [showAddToPlaylistDialog, setShowAddToPlaylistDialog] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState(null)

  const { playlists, currentTrack, currentPlaylist, currentTrackIndex, playTrack, addTrackToPlaylist, playPlaylist, error, clearError } =
    usePlaylist()

  // Load calming tracks on component mount
  useEffect(() => {
    loadCalmingTracks()
  }, [])

  const loadCalmingTracks = async () => {
    setLoading(true)
    try {
      const calmingTracks = await jamendoApi.getCalmingTracks(30)
      setTracks(calmingTracks)
    } catch (error) {
      console.error("Error loading calming tracks:", error)
      // Set a default empty array to prevent the page from breaking
      setTracks([])
    }
    setLoading(false)
  }

  const searchTracks = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const searchResults = await jamendoApi.searchTracks(searchQuery, 20)
      setTracks(searchResults)
    } catch (error) {
      console.error("Error searching tracks:", error)
      // Set a default empty array to prevent the page from breaking
      setTracks([])
    }
    setLoading(false)
  }

  const handlePlayTrack = (track, index = 0) => {
    // If a playlist is selected and the track belongs to it, keep playlist context
    if (selectedPlaylist && selectedPlaylist.tracks?.some(t => (t._id || t.id) === (track._id || track.id))) {
      const idx = selectedPlaylist.tracks.findIndex(t => (t._id || t.id) === (track._id || track.id))
      playTrack(track, selectedPlaylist, idx >= 0 ? idx : 0)
    } else {
      // Ad-hoc play from current tracks list
      playTrack(track, null, index)
    }
  }

  const handleAddToPlaylist = (track) => {
    setSelectedTrack(track)
    setShowAddToPlaylistDialog(true)
  }

  const handleConfirmAddToPlaylist = async (playlistId) => {
    if (selectedTrack && playlistId) {
      await addTrackToPlaylist(playlistId, selectedTrack)
      setShowAddToPlaylistDialog(false)
      setSelectedTrack(null)
    }
  }

  const handlePlaylistSelect = (playlist) => {
    setSelectedPlaylist(playlist)
  }

  const handleTrackChange = (nextTrack, nextIndex) => {
    if (currentPlaylist) {
      playTrack(nextTrack, currentPlaylist, nextIndex)
    } else {
      playTrack(nextTrack, null, nextIndex)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0EEEA]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-6 lg:px-12 backdrop-blur-md bg-white/40 border-b border-white/20 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-sage to-sage-light rounded-full flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <Link to="/" className="text-xl font-bold text-sage-dark">SageWillow</Link>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {[['/', 'Home'], ['/journaling', 'Journal'], ['/habits', 'Habits'], ['/gratitude', 'Gratitude'], ['/breathing', 'Meditation'], ['/memory', 'Memory']].map(([path, label]) => (
            <Link key={path} to={path} className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">{label}</Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-4 pb-32 max-w-7xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex justify-between items-center">
              {error}
              <button onClick={clearError} className="font-bold text-red-700">×</button>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-10 space-y-3">
            <span className="text-[10px] uppercase tracking-widest font-bold text-sage-dark bg-sage-light/35 p-1 px-3 rounded-full border border-sage/15">Music</span>
            <h1 className="text-4xl md:text-5xl font-light text-slate-800 mt-3">
              Calming <span className="font-semibold text-sage-dark">Playlists</span>
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl mx-auto">
              Create your perfect soundtrack for relaxation, meditation, and inner peace
            </p>
          </div>

          {/* Search */}
          <div className="glass-panel rounded-3xl p-5 mb-6 border border-white/35 shadow-sm">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage w-4 h-4" />
                <Input
                  placeholder="Search for calming music..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchTracks()}
                  className="pl-10 border-sage/30 focus:border-sage bg-white/60 rounded-2xl text-sm"
                />
              </div>
              <Button
                onClick={searchTracks}
                className="bg-sage hover:bg-sage-dark text-white rounded-2xl px-6 py-2.5 text-sm font-semibold"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <PlaylistManager onPlaylistSelect={handlePlaylistSelect} />
          </div>

          {selectedPlaylist && (
            <div className="mb-6">
              <div className="glass-panel rounded-3xl p-5 border border-white/35 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-sage-dark">{selectedPlaylist.name}</h3>
                    <p className="text-[10px] text-slate-400">{selectedPlaylist.tracks?.length || 0} tracks</p>
                  </div>
                  <Button
                    onClick={() => playPlaylist(selectedPlaylist)}
                    disabled={!selectedPlaylist.tracks || selectedPlaylist.tracks.length === 0}
                    className="bg-sage hover:bg-sage-dark text-white rounded-2xl text-xs px-4 py-2 h-auto"
                  >
                    <Play className="w-3 h-3 mr-1" /> Play All
                  </Button>
                </div>
                {selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0 && (
                  <div className="space-y-2">
                    {selectedPlaylist.tracks.map((track, index) => (
                      <div key={track._id} className="flex items-center justify-between p-3 bg-white/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-400 w-5 text-right">{index + 1}</span>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{track.title || track.name}</p>
                            <p className="text-[10px] text-slate-400">{track.artist_name || track.artist}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => playTrack(track, selectedPlaylist, index)}
                          className="w-7 h-7 bg-sage hover:bg-sage-dark rounded-full flex items-center justify-center transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tracks Section */}
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Music className="w-4 h-4 text-sage" />
              {searchQuery ? "Search Results" : "Calming Tracks"}
            </h2>

            {loading ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-10 h-10 border-2 border-sage border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading peaceful music...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tracks.map((track, idx) => (
                  <div
                    key={track.id}
                    className="bg-white/55 hover:bg-white/80 border border-white/25 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-slate-800 mb-0.5 line-clamp-2 leading-snug">{track.name}</h3>
                        <p className="text-[10px] text-slate-400">{track.artist_name}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost"
                            className="text-slate-400 hover:text-sage-dark opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 flex-shrink-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white rounded-2xl shadow-lg border-sage/10">
                          <DropdownMenuItem onClick={() => handleAddToPlaylist(track)}>
                            <Plus className="w-4 h-4 mr-2" /> Add to Playlist
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePlayTrack(track, idx)}>
                            <Play className="w-4 h-4 mr-2" /> Play Now
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePlayTrack(track, idx)}
                          className="w-8 h-8 bg-sage hover:bg-sage-dark rounded-full flex items-center justify-center transition-colors shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                        </button>
                        <button
                          onClick={() => handleAddToPlaylist(track)}
                          className="w-8 h-8 border border-sage/30 hover:bg-sage-light rounded-full flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-sage-dark" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && tracks.length === 0 && (
              <div className="text-center py-16 glass-panel rounded-3xl border border-white/25 space-y-4">
                <Music className="w-14 h-14 text-sage/40 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    {searchQuery ? "No tracks found" : "No tracks available"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchQuery ? "Try a different search term." : "Check back later."}
                  </p>
                </div>
              </div>
            )}
          </div>
      </div>

      <Dialog open={showAddToPlaylistDialog} onOpenChange={setShowAddToPlaylistDialog}>
        <DialogContent className="bg-[#F8F6F3] rounded-3xl border-none shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-sage-dark font-bold">Add to Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTrack && (
              <div className="p-3 bg-sage-light/25 rounded-2xl border border-sage/15">
                <p className="text-xs font-bold text-sage-dark">{selectedTrack.name}</p>
                <p className="text-[10px] text-slate-400">{selectedTrack.artist_name}</p>
              </div>
            )}

            {playlists.length === 0 ? (
              <p className="text-slate-500 text-center py-4 text-sm">No playlists yet. Create one first.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {playlists.map((playlist) => (
                  <button
                    key={playlist._id}
                    onClick={() => handleConfirmAddToPlaylist(playlist._id)}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl border border-sage/20 hover:bg-sage-light/30 text-left text-xs font-bold text-sage-dark transition-colors"
                  >
                    <List className="w-4 h-4" />
                    {playlist.name} ({playlist.tracks?.length || 0} tracks)
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {currentTrack && (
        <MusicPlayer
          currentTrack={currentTrack}
          playlist={currentPlaylist?.tracks || tracks}
          currentIndex={currentTrackIndex || 0}
          onTrackChange={handleTrackChange}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl z-[100]"
        />
      )}
    </div>
  )
}

