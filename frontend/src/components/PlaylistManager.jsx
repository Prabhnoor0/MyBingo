"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Plus, Play, MoreVertical, Edit, Trash2, Music, Calendar } from "lucide-react"
import { usePlaylist } from "../contexts/PlaylistContext"

export default function PlaylistManager({ onPlaylistSelect }) {
  const { playlists, createPlaylist, deletePlaylist, updatePlaylist, playPlaylist, error, clearError } = usePlaylist()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState(null)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      setCreating(true)
      try {
        const result = await createPlaylist(newPlaylistName.trim(), newPlaylistDescription.trim())
        if (result) {
          setNewPlaylistName("")
          setNewPlaylistDescription("")
          setIsCreateDialogOpen(false)
        }
      } finally {
        setCreating(false)
      }
    }
  }

  const handleEditPlaylist = async () => {
    if (editingPlaylist && newPlaylistName.trim()) {
      setUpdating(true)
      try {
        await updatePlaylist(editingPlaylist._id, {
          name: newPlaylistName.trim(),
          description: newPlaylistDescription.trim(),
        })
        setEditingPlaylist(null)
        setNewPlaylistName("")
        setNewPlaylistDescription("")
        setIsEditDialogOpen(false)
      } finally {
        setUpdating(false)
      }
    }
  }

  const handleDeletePlaylist = async (playlist) => {
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      await deletePlaylist(playlist._id)
    }
  }

  const openEditDialog = (playlist) => {
    setEditingPlaylist(playlist)
    setNewPlaylistName(playlist.name)
    setNewPlaylistDescription(playlist.description || "")
    setIsEditDialogOpen(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button 
            onClick={clearError}
            className="float-right font-bold text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#486856] flex items-center">
          <Music className="w-6 h-6 mr-2" />
          Your Playlists
        </h2>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#97B3AE] hover:bg-[#486856] text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-[#486856]">Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#486856] mb-2 block">Playlist Name</label>
                <Input
                  placeholder="Enter playlist name..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="border-[#97B3AE]/30 focus:border-[#97B3AE]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#486856] mb-2 block">Description (Optional)</label>
                <Textarea
                  placeholder="Describe your playlist..."
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  className="border-[#97B3AE]/30 focus:border-[#97B3AE] resize-none"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePlaylist} 
                  className="bg-[#97B3AE] hover:bg-[#486856] text-white"
                  disabled={!newPlaylistName.trim() || creating}
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Playlist'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-[#97B3AE]/30">
          <CardContent className="p-12 text-center">
            <Music className="w-16 h-16 text-[#97B3AE] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#486856] mb-2">No Playlists Yet</h3>
            <p className="text-[#6B8E7A] mb-4">Create your first playlist to start organizing your favorite tracks</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#97B3AE] hover:bg-[#486856] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Playlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Card
              key={playlist._id}
              className="bg-white/80 backdrop-blur-sm border-[#97B3AE]/30 hover:shadow-lg transition-all group cursor-pointer"
              onClick={() => onPlaylistSelect?.(playlist)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-[#486856] text-lg truncate">{playlist.name}</CardTitle>
                    {playlist.description && (
                      <p className="text-sm text-[#6B8E7A] mt-1 line-clamp-2">{playlist.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(playlist)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePlaylist(playlist)
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[#6B8E7A]">
                    <div className="flex items-center mb-1">
                      <Music className="w-4 h-4 mr-1" />
                      {playlist.tracks?.length || 0} tracks
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(playlist.createdAt)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      playPlaylist(playlist)
                    }}
                    disabled={!playlist.tracks || playlist.tracks.length === 0}
                    className="bg-[#97B3AE] hover:bg-[#486856] text-white"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#486856]">Edit Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#486856] mb-2 block">Playlist Name</label>
              <Input
                placeholder="Enter playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="border-[#97B3AE]/30 focus:border-[#97B3AE]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#486856] mb-2 block">Description</label>
              <Textarea
                placeholder="Describe your playlist..."
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                className="border-[#97B3AE]/30 focus:border-[#97B3AE] resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditPlaylist} 
                className="bg-[#97B3AE] hover:bg-[#486856] text-white"
                disabled={!newPlaylistName.trim() || updating}
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
