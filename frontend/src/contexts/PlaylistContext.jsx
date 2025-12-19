"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { playlistAPI } from "../services/api"
import { useAuth } from "./AuthContext"

const PlaylistContext = createContext()

export const usePlaylist = () => {
  const context = useContext(PlaylistContext)
  if (!context) {
    throw new Error("usePlaylist must be used within a PlaylistProvider")
  }
  return context
}

export const PlaylistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [currentPlaylist, setCurrentPlaylist] = useState(null)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Load playlists from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPlaylists()
    } else {
      setPlaylists([])
      setLoading(false)
    }
  }, [isAuthenticated])

  const loadPlaylists = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await playlistAPI.getUserPlaylists()
      if (response.success) {
        setPlaylists(response.data) // Fixed: changed from response.playlists to response.data
      } else {
        setError(response.message || 'Failed to load playlists')
      }
    } catch (error) {
      setError(error.message || 'Failed to load playlists')
    } finally {
      setLoading(false)
    }
  }

  const createPlaylist = async (name, description = "") => {
    try {
      setError("")
      const response = await playlistAPI.createPlaylist({
        name,
        description,
        isPublic: false
      })

      if (response.success) {
        await loadPlaylists() // Reload playlists to get the new one
        return response.data // Fixed: changed from response.playlist to response.data
      } else {
        setError(response.message || 'Failed to create playlist')
        return null
      }
    } catch (error) {
      setError(error.message || 'Failed to create playlist')
      return null
    }
  }

  const deletePlaylist = async (playlistId) => {
    try {
      setError("")
      const response = await playlistAPI.deletePlaylist(playlistId)
      
      if (response.success) {
        // If the deleted playlist was current, clear it
        if (currentPlaylist?._id === playlistId) {
          setCurrentPlaylist(null)
          setCurrentTrack(null)
          setCurrentTrackIndex(0)
        }
        await loadPlaylists() // Reload playlists
      } else {
        setError(response.message || 'Failed to delete playlist')
      }
    } catch (error) {
      setError(error.message || 'Failed to delete playlist')
    }
  }

  const updatePlaylist = async (playlistId, updates) => {
    try {
      setError("")
      const response = await playlistAPI.updatePlaylist(playlistId, updates)
      
      if (response.success) {
        // Update current playlist if it's the one being updated
        if (currentPlaylist?._id === playlistId) {
          setCurrentPlaylist((prev) => ({ ...prev, ...updates }))
        }
        await loadPlaylists() // Reload playlists
      } else {
        setError(response.message || 'Failed to update playlist')
      }
    } catch (error) {
      setError(error.message || 'Failed to update playlist')
    }
  }

  const addTrackToPlaylist = async (playlistId, track) => {
    try {
      setError("")
      const response = await playlistAPI.addTrackToPlaylist(playlistId, {
        title: track.name,
        artist: track.artist_name,
        artist_name: track.artist_name,
        url: track.audio,
        thumbnail: track.image,
        duration: track.duration,
        externalId: track.id,
        source: 'jamendo'
      })

      if (response.success) {
        // Update current playlist if it's the one being updated
        if (currentPlaylist?._id === playlistId) {
          setCurrentPlaylist(prev => ({
            ...prev,
            tracks: [...prev.tracks, response.data] // Fixed: changed from response.track to response.data
          }))
        }
        await loadPlaylists() // Reload playlists
      } else {
        setError(response.message || 'Failed to add track to playlist')
      }
    } catch (error) {
      setError(error.message || 'Failed to add track to playlist')
    }
  }

  const removeTrackFromPlaylist = async (playlistId, trackId) => {
    try {
      setError("")
      const response = await playlistAPI.removeTrackFromPlaylist(playlistId, trackId)
      
      if (response.success) {
        // Update current playlist if it's the one being updated
        if (currentPlaylist?._id === playlistId) {
          setCurrentPlaylist(prev => ({
            ...prev,
            tracks: prev.tracks.filter(track => track._id !== trackId)
          }))

          // If the removed track was currently playing, stop playback
          if (currentTrack?._id === trackId) {
            setCurrentTrack(null)
            setCurrentTrackIndex(0)
          }
        }
        await loadPlaylists() // Reload playlists
      } else {
        setError(response.message || 'Failed to remove track from playlist')
      }
    } catch (error) {
      setError(error.message || 'Failed to remove track from playlist')
    }
  }

  const playPlaylist = (playlist, startIndex = 0) => {
    if (playlist.tracks.length === 0) return

    setCurrentPlaylist(playlist)
    setCurrentTrack(playlist.tracks[startIndex])
    setCurrentTrackIndex(startIndex)
  }

  const playTrack = (track, playlist = null, index = 0) => {
    setCurrentTrack(track)
    if (playlist) {
      setCurrentPlaylist(playlist)
      setCurrentTrackIndex(index)
    }
  }

  const nextTrack = () => {
    if (!currentPlaylist || currentPlaylist.tracks.length === 0) return

    const nextIndex = (currentTrackIndex + 1) % currentPlaylist.tracks.length
    setCurrentTrackIndex(nextIndex)
    setCurrentTrack(currentPlaylist.tracks[nextIndex])
  }

  const previousTrack = () => {
    if (!currentPlaylist || currentPlaylist.tracks.length === 0) return

    const prevIndex = currentTrackIndex === 0 ? currentPlaylist.tracks.length - 1 : currentTrackIndex - 1
    setCurrentTrackIndex(prevIndex)
    setCurrentTrack(currentPlaylist.tracks[prevIndex])
  }

  const getPlaylistById = (playlistId) => {
    return playlists.find((playlist) => playlist._id === playlistId)
  }

  const clearError = () => {
    setError("")
  }

  const value = {
    playlists,
    currentPlaylist,
    currentTrack,
    currentTrackIndex,
    loading,
    error,
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    playPlaylist,
    playTrack,
    nextTrack,
    previousTrack,
    getPlaylistById,
    clearError,
    loadPlaylists
  }

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>
}
