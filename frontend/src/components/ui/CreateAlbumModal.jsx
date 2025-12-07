"use client"

import { useState } from "react"
import { Button } from "./button"
import { Card, CardContent } from "./card"
import { X, Camera, Users, Calendar, Heart } from "lucide-react"

export default function CreateAlbumModal({ isOpen, onClose, onCreateAlbum }) {
  const [albumName, setAlbumName] = useState("")
  const [albumDescription, setAlbumDescription] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const albumGenres = [
    { id: "personal", name: "Personal", icon: Camera, color: "bg-gradient-to-br from-[#D4B896] to-[#E8D5B7]" },
    { id: "group", name: "Group", icon: Users, color: "bg-gradient-to-br from-[#C8A882] to-[#D4B896]" },
    { id: "special", name: "Special Days", icon: Calendar, color: "bg-gradient-to-br from-[#B8956F] to-[#C8A882]" },
    { id: "family", name: "Family", icon: Heart, color: "bg-gradient-to-br from-[#E8D5B7] to-[#F2E6D3]" },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!albumName.trim() || !selectedGenre || isSubmitting) return

    setIsSubmitting(true)
    const selectedGenreData = albumGenres.find((g) => g.id === selectedGenre)
    const newAlbum = {
      name: albumName.trim(),
      description: albumDescription.trim(),
      genre: selectedGenreData.name,
      genreId: selectedGenre,
      color: selectedGenreData.color,
      icon: selectedGenreData.icon.name
    }

    try {
      await onCreateAlbum(newAlbum)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setAlbumName("")
    setAlbumDescription("")
    setSelectedGenre("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F2E6D3] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D4B896]">
          <h2 className="text-2xl font-bold text-[#5D4E37]">Create New Album</h2>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-[#8B7355] hover:bg-[#E8D5B7]">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Album Name */}
          <div>
            <label className="block text-sm font-medium text-[#5D4E37] mb-2">Album Name</label>
            <input
              type="text"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              placeholder="Enter album name"
              className="w-full px-4 py-3 bg-white/80 border border-[#D4B896] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent text-[#5D4E37] placeholder-[#B8956F]"
              required
            />
          </div>

          {/* Album Description */}
          <div>
            <label className="block text-sm font-medium text-[#5D4E37] mb-2">Description (Optional)</label>
            <textarea
              value={albumDescription}
              onChange={(e) => setAlbumDescription(e.target.value)}
              placeholder="Describe your album..."
              rows={3}
              className="w-full px-4 py-3 bg-white/80 border border-[#D4B896] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent text-[#5D4E37] placeholder-[#B8956F] resize-none"
            />
          </div>

          {/* Genre Selection */}
          <div>
            <label className="block text-sm font-medium text-[#5D4E37] mb-3">Choose Genre</label>
            <div className="grid grid-cols-2 gap-3">
              {albumGenres.map((genre) => (
                <Card
                  key={genre.id}
                  className={`cursor-pointer transition-all duration-200 border-2 ${
                    selectedGenre === genre.id
                      ? "border-[#8B7355] shadow-lg scale-105"
                      : "border-[#D4B896] hover:border-[#C8A882]"
                  }`}
                  onClick={() => setSelectedGenre(genre.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-12 h-12 ${genre.color} rounded-full flex items-center justify-center mx-auto mb-2`}
                    >
                      <genre.icon className="w-6 h-6 text-[#5D4E37]" />
                    </div>
                    <h4 className="text-sm font-medium text-[#5D4E37]">{genre.name}</h4>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-[#D4B896] text-[#8B7355] hover:bg-[#E8D5B7] bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!albumName.trim() || !selectedGenre || isSubmitting}
              className="flex-1 bg-[#8B7355] hover:bg-[#5D4E37] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Album"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
