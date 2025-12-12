"use client"

import { useState, useRef } from "react"
import { Button } from "./button"
import { Card, CardContent } from "./card"
import { X, Upload, Camera, Plus, Trash2 } from "lucide-react"

export default function PhotoUploadModal({ isOpen, onClose, album, onAddPhotos }) {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [photoNotes, setPhotoNotes] = useState({})
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    handleFiles(files)
  }

  const handleFiles = (files) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    imageFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newPhoto = {
          id: Date.now() + Math.random(),
          file: file,
          preview: e.target.result,
          name: file.name,
          size: file.size,
        }
        setSelectedFiles((prev) => [...prev, newPhoto])
        setPhotoNotes((prev) => ({ ...prev, [newPhoto.id]: "" }))
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const removePhoto = (photoId) => {
    setSelectedFiles((prev) => prev.filter((photo) => photo.id !== photoId))
    setPhotoNotes((prev) => {
      const newNotes = { ...prev }
      delete newNotes[photoId]
      return newNotes
    })
  }

  const updatePhotoNote = (photoId, note) => {
    setPhotoNotes((prev) => ({ ...prev, [photoId]: note }))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)

    try {
      const photosWithNotes = selectedFiles.map((photo) => ({
        id: photo.id,
        file: photo.file,
        name: photo.name,
        note: photoNotes[photo.id] || "",
      }))

      await onAddPhotos(album._id, photosWithNotes)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedFiles([])
    setPhotoNotes({})
    setIsDragOver(false)
    onClose()
  }

  if (!isOpen || !album) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F2E6D3] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D4B896]">
          <div>
            <h2 className="text-2xl font-bold text-[#5D4E37]">Add Photos</h2>
            <p className="text-[#8B7355] text-sm">to {album.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-[#8B7355] hover:bg-[#E8D5B7]">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-[#8B7355] bg-[#E8D5B7]/50"
                : "border-[#D4B896] hover:border-[#C8A882] hover:bg-[#E8D5B7]/30"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFilePicker}
          >
            <Camera className="w-12 h-12 text-[#B8956F] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#5D4E37] mb-2">Upload Your Photos</h3>
            <p className="text-[#8B7355] mb-4">Drag and drop photos here, or click to select</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
              ref={fileInputRef}
            />
            <Button onClick={openFilePicker} className="bg-[#8B7355] hover:bg-[#5D4E37] text-white cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Choose Photos
            </Button>
          </div>

          {/* Selected Photos */}
          {selectedFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#5D4E37] mb-4">Selected Photos ({selectedFiles.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedFiles.map((photo) => (
                  <Card key={photo.id} className="bg-white/80 backdrop-blur-sm border-none shadow-md">
                    <CardContent className="p-4">
                      <div className="relative mb-3">
                        <img
                          src={photo.preview || "/placeholder.svg"}
                          alt={photo.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePhoto(photo.id)}
                          className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full w-6 h-6"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium text-[#5D4E37] mb-2 truncate">{photo.name}</p>
                      <textarea
                        placeholder="Add a note about this memory..."
                        value={photoNotes[photo.id] || ""}
                        onChange={(e) => updatePhotoNote(photo.id, e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-white/60 border border-[#D4B896] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent text-[#5D4E37] placeholder-[#B8956F] text-sm resize-none"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-[#D4B896]">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-[#D4B896] text-[#8B7355] hover:bg-[#E8D5B7] bg-transparent"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="flex-1 bg-[#8B7355] hover:bg-[#5D4E37] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add {selectedFiles.length} Photo{selectedFiles.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
