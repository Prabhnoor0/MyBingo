"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Sparkles, Plus, Grid3X3, Camera, Users, Calendar, Heart, LayoutGrid, Folder, ImageIcon } from "lucide-react"
import { Link } from "react-router-dom"
import CreateAlbumModal from "../components/ui/CreateAlbumModal"
import PhotoUploadModal from "../components/ui/PhotoUploadModal"
import PhotoViewModal from "../components/ui/PhotoViewModal"
import { albumAPI, photoAPI } from "../services/api"

export default function MemoryLanePage() {
  const [albums, setAlbums] = useState([])
  const [showCreateAlbum, setShowCreateAlbum] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [showPhotoView, setShowPhotoView] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [viewMode, setViewMode] = useState("albums") 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Load albums from API on component mount
  useEffect(() => {
    loadAlbums()
  }, [])

  
  useEffect(() => {

    document.body.style.width = '100vw'
    document.body.style.overflowX = 'hidden'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    
   
    document.documentElement.style.width = '100vw'
    document.documentElement.style.overflowX = 'hidden'
    
    return () => {
      document.body.style.width = ''
      document.body.style.overflowX = ''
      document.body.style.margin = ''
      document.body.style.padding = ''
      document.documentElement.style.width = ''
      document.documentElement.style.overflowX = ''
    }
  }, [])

  const loadAlbums = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await albumAPI.getUserAlbums()
      if (response.success) {
        setAlbums(response.data || [])
      } else {
        setError(response.message || 'Failed to load albums')
      }
    } catch (error) {
      setError(error.message || 'Failed to load albums')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlbum = async (newAlbum) => {
    try {
      setError("")
      const response = await albumAPI.createAlbum({
        name: newAlbum.name,
        description: newAlbum.description,
        genre: newAlbum.genreId,
        color: newAlbum.color,
        icon: newAlbum.icon
      })

      if (response.success) {
        await loadAlbums() 
        setShowCreateAlbum(false)
      } else {
        setError(response.message || 'Failed to create album')
      }
    } catch (error) {
      setError(error.message || 'Failed to create album')
    }
  }

  const handleAddPhotos = async (albumId, photos) => {
    try {
      setError("")
     
      const uploadPromises = photos.map(async (photo) => {
        try {
          const formData = new FormData()
          formData.append('photo', photo.file)
          formData.append('note', photo.note || '')
          
          return await photoAPI.uploadPhoto(albumId, formData)
        } catch (e) {
          console.error('Single photo upload failed:', e)
          return { success: false, message: e?.message || 'Upload failed' }
        }
      })

      const results = await Promise.allSettled(uploadPromises)
      const fulfilled = results.filter(r => r.status === 'fulfilled').map(r => r.value)
      const successCount = fulfilled.filter(r => r && r.success).length

      if (successCount > 0) {
        
        await loadAlbums()
        setShowPhotoUpload(false)
        setSelectedAlbum(null)
      } else {
        const firstError = (results.find(r => r.status === 'fulfilled' && !r.value?.success)?.value?.message)
          || (results.find(r => r.status === 'rejected')?.reason?.message)
          || 'Failed to upload photos'
        setError(firstError)
      }
    } catch (error) {
      setError(error.message || 'Failed to upload photos')
    }
  }

  const handleAlbumClick = (album) => {
    setSelectedAlbum(album)
    setShowPhotoUpload(true)
  }

  
  const [showAlbumGrid, setShowAlbumGrid] = useState(false)

  const handlePhotoClick = async (albumId) => {
    try {
      setError("")
      const response = await photoAPI.getPhotosByAlbum(albumId)
      if (response.success) {
        const normalized = (response.data || []).map(p => ({
          ...p,
          url: p.url || p.secureUrl || p.secure_url,
          thumbnailUrl: p.thumbnailUrl || p.thumbnail || p.secureThumbnailUrl || p.secure_thumbnail_url,
        }))
        setSelectedPhotos(normalized)
        setSelectedPhotoIndex(0)
        setShowAlbumGrid(true)
      } else {
        setError(response.message || 'Failed to load photos')
      }
    } catch (error) {
      setError(error.message || 'Failed to load photos')
    }
  }

 
  const handleUpdatePhotoNote = async (photoId, newNote) => {
    try {
      setError("")
      const response = await photoAPI.updatePhotoNote(photoId, { note: newNote })
      if (response.success) {
        // Update local state
        setSelectedPhotos(prev => 
          prev.map(photo => 
            photo._id === photoId ? { ...photo, note: newNote } : photo
          )
        )
      } else {
        setError(response.message || 'Failed to update photo note')
      }
    } catch (error) {
      setError(error.message || 'Failed to update photo note')
    }
  }

 
  const getAllPhotos = async () => {
    try {
      setError("")
      const response = await photoAPI.getAllUserPhotos()
      if (response.success) {
        return (response.data || []).map(photo => ({
          ...photo,
          albumName: photo.album?.name || 'Unknown Album',
          albumColor: photo.album?.color || 'bg-gradient-to-br from-[#D4B896] to-[#E8D5B7]'
        })).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      } else {
        setError(response.message || 'Failed to load photos')
        return []
      }
    } catch (error) {
      setError(error.message || 'Failed to load photos')
      return []
    }
  }

  const albumGenres = [
    { id: "personal", name: "Personal", icon: Camera, color: "bg-gradient-to-br from-[#D4B896] to-[#E8D5B7]" },
    { id: "group", name: "Group", icon: Users, color: "bg-gradient-to-br from-[#C8A882] to-[#D4B896]" },
    { id: "special", name: "Special Days", icon: Calendar, color: "bg-gradient-to-br from-[#B8956F] to-[#C8A882]" },
    { id: "family", name: "Family", icon: Heart, color: "bg-gradient-to-br from-[#E8D5B7] to-[#F2E6D3]" },
  ]

  const getCurrentDate = () => {
    const now = new Date()
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }


  const [clusterPhotos, setClusterPhotos] = useState([])
  const [clusterLoading, setClusterLoading] = useState(false)

  useEffect(() => {
    if (viewMode === "cluster") {
      loadClusterPhotos()
    }
  }, [viewMode])

  const loadClusterPhotos = async () => {
    setClusterLoading(true)
    const photos = await getAllPhotos()
    setClusterPhotos(photos)
    setClusterLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0EEEA] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-sage border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading your memories...</p>
        </div>
      </div>
    )
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
          {[['/', 'Home'], ['/journaling', 'Journal'], ['/habits', 'Habits'], ['/gratitude', 'Gratitude'], ['/breathing', 'Meditation'], ['/playlist', 'Playlist']].map(([path, label]) => (
            <Link key={path} to={path} className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">{label}</Link>
          ))}
        </div>
      </nav>

      <div className="relative pt-20">


        {/* Main Content */}
        <div className="px-4 pb-16 max-w-6xl mx-auto pt-6">
            {/* Error Display */}
            {error && (
              <div className="w-full mx-auto mb-6 px-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                  <button 
                    onClick={() => setError("")}
                    className="float-right font-bold text-red-700 hover:text-red-900"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Page Header */}
            <div className="text-center mb-8 space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-sage-dark bg-sage-light/35 p-1 px-3 rounded-full border border-sage/15">Memories</span>
              <h1 className="text-4xl font-light text-slate-800 mt-3">Memory <span className="font-semibold text-sage-dark">Lane</span></h1>
              <p className="text-xs text-slate-500">{getCurrentDate()}</p>
            </div>

            {/* View Toggle and Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 bg-white/60 p-1 rounded-2xl border border-white/20">
                <button
                  onClick={() => setViewMode("albums")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${viewMode === "albums" ? 'bg-sage text-white shadow-sm' : 'text-slate-500 hover:text-sage-dark'}`}
                >
                  <Folder className="w-3.5 h-3.5" /> Albums
                </button>
                <button
                  onClick={() => setViewMode("cluster")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${viewMode === "cluster" ? 'bg-sage text-white shadow-sm' : 'text-slate-500 hover:text-sage-dark'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> All Photos
                </button>
              </div>
              <button
                onClick={() => setShowCreateAlbum(true)}
                className="flex items-center gap-1.5 bg-sage hover:bg-sage-dark text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> New Album
              </button>
            </div>

            {/* Content based on view mode */}
            <div className="w-full">
              {viewMode === "albums" ? (
                // Albums View
                <>
                  {albums.length === 0 ? (
                    <div className="text-center py-20 glass-panel rounded-3xl border border-white/25 space-y-4">
                      <Camera className="w-14 h-14 text-sage/40 mx-auto" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-700">No Albums Yet</h3>
                        <p className="text-xs text-slate-400 mt-1">Create your first album to preserve your memories</p>
                      </div>
                      <button
                        onClick={() => setShowCreateAlbum(true)}
                        className="bg-sage text-white text-xs font-bold px-5 py-2.5 rounded-2xl hover:bg-sage-dark transition-colors shadow-sm inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Create First Album
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {albums.map((album) => (
                        <div
                          key={album._id}
                          className="bg-white/55 hover:bg-white/80 border border-white/25 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                          onClick={() => handleAlbumClick(album)}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-sage-light/40 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                              {album.icon === 'Camera' && <Camera className="w-6 h-6 text-sage-dark" />}
                              {album.icon === 'Users' && <Users className="w-6 h-6 text-sage-dark" />}
                              {album.icon === 'Calendar' && <Calendar className="w-6 h-6 text-sage-dark" />}
                              {album.icon === 'Heart' && <Heart className="w-6 h-6 text-sage-dark" />}
                              {!['Camera','Users','Calendar','Heart'].includes(album.icon) && <ImageIcon className="w-6 h-6 text-sage-dark" />}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-800">{album.name}</h3>
                              <p className="text-[10px] text-slate-400 capitalize">{album.genre}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mb-4 line-clamp-2">{album.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-sage-dark bg-sage-light/30 px-2.5 py-1 rounded-full">{album.photoCount || 0} photos</span>
                            <button
                              className="text-[10px] font-bold text-sage-dark hover:text-sage flex items-center gap-1 transition-colors"
                              onClick={(e) => { e.stopPropagation(); handlePhotoClick(album._id) }}
                            >
                              <Grid3X3 className="w-3 h-3" /> View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Genre Cards */}
                  {albums.length > 0 && (
                    <div className="mt-10">
                      <h3 className="text-sm font-bold text-slate-700 mb-4">Browse by Genre</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {albumGenres.map((genre) => (
                          <button
                            key={genre.id}
                            className="bg-white/50 hover:bg-white/80 border border-white/20 rounded-3xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 group"
                            onClick={() => setShowCreateAlbum(true)}
                          >
                            <div className="w-10 h-10 bg-sage-light/40 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                              <genre.icon className="w-5 h-5 text-sage-dark" />
                            </div>
                            <h4 className="text-xs font-bold text-slate-700">{genre.name}</h4>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Cluster Board View
                <>
                  {clusterLoading ? (
                    <div className="text-center py-16 space-y-3">
                      <div className="w-10 h-10 border-2 border-sage border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-slate-400">Loading your photos...</p>
                    </div>
                  ) : clusterPhotos.length === 0 ? (
                    <div className="text-center py-20 glass-panel rounded-3xl border border-white/25 space-y-4">
                      <LayoutGrid className="w-14 h-14 text-sage/40 mx-auto" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-700">No Photos Yet</h3>
                        <p className="text-xs text-slate-400 mt-1">Upload photos to your albums to see them here</p>
                      </div>
                      <button
                        onClick={() => setViewMode("albums")}
                        className="bg-sage text-white text-xs font-bold px-5 py-2.5 rounded-2xl hover:bg-sage-dark transition-colors shadow-sm inline-flex items-center gap-1.5"
                      >
                        <Folder className="w-4 h-4" /> Go to Albums
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-1">All Your Memories</h2>
                        <p className="text-[11px] text-slate-500">
                          {clusterPhotos.length} photos across {albums.length} albums
                        </p>
                      </div>

                      {/* Photo Grid - Masonry Layout */}
                      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                        {clusterPhotos.map((photo, index) => (
                          <div
                            key={photo._id}
                            className="break-inside-avoid cursor-pointer group"
                            onClick={() => {
                              setSelectedPhotos(clusterPhotos)
                              setSelectedPhotoIndex(index)
                              setShowPhotoView(true)
                            }}
                          >
                            <Card className="bg-white/80 backdrop-blur-sm border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                              <CardContent className="p-0">
                                <div className="relative">
                                  <img
                                    src={photo.thumbnailUrl || photo.url || "/placeholder.svg"}
                                    alt={photo.name || "Memory"}
                                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                                  {/* Album Badge */}
                                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                      {photo.albumName}
                                    </div>
                                  </div>
                                </div>

                                {/* Photo Note Preview */}
                                {photo.note && (
                                  <div className="p-3">
                                    <p className="text-[#5D4E37] text-sm line-clamp-2">{photo.note}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

        {/* Modals */}
        <CreateAlbumModal
          isOpen={showCreateAlbum}
          onClose={() => setShowCreateAlbum(false)}
          onCreateAlbum={handleCreateAlbum}
        />

        <PhotoUploadModal
          isOpen={showPhotoUpload}
          onClose={() => {
            setShowPhotoUpload(false)
            setSelectedAlbum(null)
          }}
          album={selectedAlbum}
          onAddPhotos={handleAddPhotos}
        />

        {/* Album Collage Grid Modal */}
        {showAlbumGrid && (
          <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-black/60 backdrop-blur">
              <h3 className="text-white text-lg font-semibold">{selectedAlbum?.name || 'Album'}</h3>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => {
                  setShowAlbumGrid(false)
                  setSelectedPhotos([])
                  setSelectedPhotoIndex(0)
                }}
              >
                Close
              </Button>
            </div>

            <div className="px-4 pb-10">
              {/* Masonry columns with natural aspect ratios */}
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                {selectedPhotos.map((photo, index) => (
                  <div key={photo._id || index} className="mb-4 break-inside-avoid">
                    <button
                      className="block w-full group"
                      onClick={() => {
                        setSelectedPhotoIndex(index)
                        setShowPhotoView(true)
                      }}
                    >
                      <img
                        src={photo.thumbnailUrl || photo.url || "/placeholder.svg"}
                        alt={photo.name || 'Memory'}
                        className="w-full h-auto rounded-lg shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
                        loading="lazy"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <PhotoViewModal
          isOpen={showPhotoView}
          onClose={() => {
            setShowPhotoView(false)
            setSelectedPhotos([])
            setSelectedPhotoIndex(0)
          }}
          photos={selectedPhotos}
          initialPhotoIndex={selectedPhotoIndex}
          onUpdateNote={handleUpdatePhotoNote}
        />
      </div>
    </div>
  )
}
