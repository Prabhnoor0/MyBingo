"use client"

import { useState } from "react"
import { Button } from "./button"
import { Card, CardContent } from "./card"
import { X, Heart, Calendar, Sparkles, ChevronLeft, ChevronRight, Edit2, Trash2, Check, XIcon } from "lucide-react"

export default function GratitudeNotesModal({ isOpen, onClose, entries, onUpdateEntry, onDeleteEntry }) {
  const [currentPage, setCurrentPage] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const notesPerPage = 6
  const totalPages = Math.ceil(entries.length / notesPerPage)

  const getCurrentPageEntries = () => {
    const startIndex = currentPage * notesPerPage
    return entries.slice(startIndex, startIndex + notesPerPage)
  }

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const startEdit = (entry) => {
    setEditingId(entry.id)
    setEditText(entry.text)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText("")
  }

  const saveEdit = () => {
    if (editText.trim() && onUpdateEntry) {
      onUpdateEntry(editingId, editText.trim())
      setEditingId(null)
      setEditText("")
    }
  }

  const confirmDelete = (entryId) => {
    setDeleteConfirmId(entryId)
  }

  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

  const executeDelete = () => {
    if (deleteConfirmId && onDeleteEntry) {
      onDeleteEntry(deleteConfirmId)
      setDeleteConfirmId(null)
    }
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return "Unknown Date"
    const date = dateValue._seconds ? new Date(dateValue._seconds * 1000) : new Date(dateValue)
    if (isNaN(date.getTime())) return "Invalid Date"
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getNoteColor = (index) => {
    const colors = [
      "bg-sage-light/20",
      "bg-peach-light/30",
      "bg-cream",
      "bg-white border border-sage/15",
      "bg-sage-light/40",
      "bg-[#F5F2EB]",
    ]
    return colors[index % colors.length]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <Card className="relative w-full max-w-4xl max-h-[90vh] bg-white border-sage/20 shadow-2xl overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="relative p-6 bg-sage-light/20 border-b border-sage/10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-[#4B0082]" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-white border border-sage/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-sage" />
              </div>
              <h2 className="text-3xl font-light text-slate-800 mb-2">Your Gratitude Collection</h2>
              <p className="text-sage-dark/80">
                {entries.length} grateful moment{entries.length !== 1 ? "s" : ""} to cherish
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-sage/40 mx-auto mb-4" />
                <h3 className="text-xl text-sage-dark mb-2">No gratitude entries yet</h3>
                <p className="text-sage/60">Start adding grateful moments to fill your jar!</p>
              </div>
            ) : (
              <>
                {/* Notes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {getCurrentPageEntries().map((entry, index) => (
                    <Card
                      key={entry.id || index}
                      className={`${getNoteColor(
                        index + currentPage * notesPerPage,
                      )} shadow-sm hover:shadow-md transition-all duration-300 ${
                        editingId === entry.id ? "ring-2 ring-sage" : "hover:-translate-y-1"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-xs text-slate-500 font-medium">{formatDate(entry.date)}</span>
                          </div>

                          <div className="flex space-x-1">
                            {editingId === entry.id ? (
                              <>
                                <button
                                  onClick={saveEdit}
                                  className="p-1 rounded hover:bg-white/40 transition-colors"
                                  title="Save changes"
                                >
                                  <Check className="w-4 h-4 text-sage-dark" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1 rounded hover:bg-white/40 transition-colors"
                                  title="Cancel editing"
                                >
                                  <XIcon className="w-4 h-4 text-slate-400" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(entry)}
                                  className="p-1 rounded hover:bg-white/40 transition-colors"
                                  title="Edit entry"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-sage-dark/60" />
                                </button>
                                <button
                                  onClick={() => confirmDelete(entry.id)}
                                  className="p-1 rounded hover:bg-red-50 transition-colors"
                                  title="Delete entry"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {editingId === entry.id ? (
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-2 text-slate-800 bg-white/50 border border-sage/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-sage text-sm"
                            rows={3}
                            autoFocus
                          />
                        ) : (
                          <p className="text-slate-700 leading-relaxed text-sm mb-3 font-medium">{entry.text}</p>
                        )}

                        <div className="flex justify-end">
                          <Heart className="w-4 h-4 text-sage/60" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      onClick={prevPage}
                      disabled={currentPage === 0}
                      variant="outline"
                      size="sm"
                      className="border-sage/30 text-sage-dark hover:bg-sage/10 disabled:opacity-50 bg-transparent rounded-full"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex space-x-2">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                            i === currentPage
                              ? "bg-sage text-white"
                              : "bg-white/50 text-sage-dark hover:bg-sage/20 border border-sage/10"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={nextPage}
                      disabled={currentPage === totalPages - 1}
                      variant="outline"
                      size="sm"
                      className="border-sage/30 text-sage-dark hover:bg-sage/10 disabled:opacity-50 bg-transparent rounded-full"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-sage-light/10 border-t border-sage/10">
            <div className="text-center">
              <p className="text-sage-dark/80 text-sm mb-4 italic">"Gratitude turns what we have into enough" - Anonymous</p>
              <Button
                onClick={onClose}
                className="bg-sage hover:bg-sage-dark text-white rounded-full px-8"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-sage/20 rounded-full"></div>
          <div className="absolute top-12 right-12 w-1 h-1 bg-sage/30 rounded-full"></div>
          <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-sage/40 rounded-full"></div>
        </CardContent>
      </Card>

      {deleteConfirmId && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={cancelDelete}></div>
          <Card className="relative bg-white border-sage/30 shadow-xl rounded-2xl max-w-sm w-full">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Delete Gratitude Entry?</h3>
              <p className="text-slate-500 mb-6 text-sm">This action cannot be undone.</p>
              <div className="flex space-x-3 justify-center">
                <Button
                  onClick={cancelDelete}
                  variant="outline"
                  className="border-sage/30 text-sage-dark hover:bg-sage/10 bg-transparent rounded-full"
                >
                  Cancel
                </Button>
                <Button onClick={executeDelete} className="bg-red-500 hover:bg-red-600 text-white rounded-full">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
