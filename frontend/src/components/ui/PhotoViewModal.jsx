"use client"

import { useState, useEffect } from "react"
import { Button } from "./button"
import { X, ChevronLeft, ChevronRight, Calendar, Edit2, Save } from "lucide-react"

export default function PhotoViewModal({ isOpen, onClose, photos, initialPhotoIndex = 0, onUpdateNote }) {
  const [currentIndex, setCurrentIndex] = useState(initialPhotoIndex)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [editedNote, setEditedNote] = useState("")

  useEffect(() => {
    setCurrentIndex(initialPhotoIndex)
  }, [initialPhotoIndex])

  useEffect(() => {
    if (photos && photos[currentIndex]) {
      setEditedNote(photos[currentIndex].note || "")
    }
  }, [currentIndex, photos])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
    setIsEditingNote(false)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
    setIsEditingNote(false)
  }

  const handleSaveNote = () => {
    if (onUpdateNote && photos[currentIndex]) {
      onUpdateNote(photos[currentIndex]._id, editedNote)
    }
    setIsEditingNote(false)
  }

  const handleKeyDown = (e) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowLeft":
        handlePrevious()
        break
      case "ArrowRight":
        handleNext()
        break
      case "Escape":
        onClose()
        break
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  if (!isOpen || !photos || photos.length === 0) return null

  const currentPhoto = photos[currentIndex]
  if (!currentPhoto) return null

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12 rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/20 w-12 h-12 rounded-full"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Photo Counter */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} of {photos.length}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row items-center justify-center w-full h-full p-4 gap-6">
        {/* Photo */}
        <div className="flex-1 flex items-center justify-center max-w-4xl max-h-full">
          <img
            src={currentPhoto.thumbnailUrl || currentPhoto.url || "/placeholder.svg"}
            alt={currentPhoto.name || "Memory photo"}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Photo Details Panel */}
        <div className="w-full lg:w-80 bg-[#F2E6D3] rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            {/* Photo Name */}
            <div>
              <h3 className="text-xl font-bold text-[#5D4E37] mb-2">{currentPhoto.name || "Untitled Memory"}</h3>
              <div className="flex items-center text-[#8B7355] text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(currentPhoto.uploadedAt)}
              </div>
            </div>

            {/* Photo Note */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-[#5D4E37]">Memory Note</h4>
                {onUpdateNote && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (isEditingNote) {
                        handleSaveNote()
                      } else {
                        setIsEditingNote(true)
                      }
                    }}
                    className="text-[#8B7355] hover:bg-[#E8D5B7]"
                  >
                    {isEditingNote ? (
                      <>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </>
                    )}
                  </Button>
                )}
              </div>

              {isEditingNote ? (
                <textarea
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  placeholder="Add a note about this memory..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/80 border border-[#D4B896] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent text-[#5D4E37] placeholder-[#B8956F] resize-none"
                />
              ) : (
                <div className="bg-white/60 rounded-lg p-4 min-h-[100px]">
                  {currentPhoto.note ? (
                    <p className="text-[#5D4E37] leading-relaxed">{currentPhoto.note}</p>
                  ) : (
                    <p className="text-[#B8956F] italic">No note added yet...</p>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Dots for Mobile */}
            {photos.length > 1 && (
              <div className="flex justify-center space-x-2 pt-4">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? "bg-[#8B7355]" : "bg-[#D4B896]"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
