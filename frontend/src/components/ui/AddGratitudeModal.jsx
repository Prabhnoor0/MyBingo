"use client"

import { useState } from "react"
import { Button } from "./button"
import { Card, CardContent } from "./card"
import { X, Heart, Sparkles } from "lucide-react"

export default function AddGratitudeModal({ isOpen, onClose, onSave }) {
  const [gratitudeText, setGratitudeText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!gratitudeText.trim()) return

    setIsSubmitting(true)

    const newEntry = {
      id: Date.now(),
      text: gratitudeText.trim(),
      date: new Date().toISOString(),
      dateString: new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }

    try {
      // Save the entry and wait for response
      await onSave(newEntry)
      
      // Reset form and close modal only after successful save
      setGratitudeText("")
      onClose()
    } catch (error) {
      console.error('Failed to save gratitude entry:', error)
      // Don't close modal on error, let user try again
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setGratitudeText("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose}></div>

      {/* Modal Content */}
      <Card className="relative w-full max-w-lg bg-white border-sage/20 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="relative p-6 pb-4 bg-sage-light/20 border-b border-sage/10">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/40 transition-colors"
            >
              <X className="w-5 h-5 text-slate-800" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-white border border-sage/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-sage" />
              </div>
              <h2 className="text-2xl font-light text-slate-800 mb-2">Daily Gratitude</h2>
              <p className="text-sage-dark/80 text-sm">What are you grateful for today?</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label className="block text-slate-800 text-sm font-medium mb-3">
                Share something positive that happened today
              </label>
              <textarea
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                placeholder="I'm grateful for..."
                className="w-full h-32 p-4 border-2 border-sage/30 rounded-xl bg-white/50 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 resize-none"
                required
              />
            </div>

            {/* Character count */}
            <div className="text-right mb-4">
              <span className="text-xs text-slate-500">{gratitudeText.length}/500 characters</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-sage/30 text-sage-dark hover:bg-sage/10 bg-transparent rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!gratitudeText.trim() || isSubmitting}
                className="flex-1 bg-sage hover:bg-sage-dark text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Add to Jar
                  </div>
                )}
              </Button>
            </div>
          </form>

          {/* Decorative elements */}
          <div className="absolute top-2 left-4 w-2 h-2 bg-sage/20 rounded-full"></div>
          <div className="absolute top-8 right-8 w-1 h-1 bg-sage/30 rounded-full"></div>
          <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-sage/40 rounded-full"></div>
        </CardContent>
      </Card>
    </div>
  )
}
