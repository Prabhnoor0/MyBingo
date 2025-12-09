"use client"

import { useState } from "react"
import { Button } from "./button.jsx"
import { ArrowLeft } from "lucide-react"

const JournalEntryForm = ({ mood, onSave, onCancel, editEntry = null }) => {
  const [title, setTitle] = useState(editEntry?.title || "")
  const [content, setContent] = useState(editEntry?.content || "")
  const [isFavorite, setIsFavorite] = useState(editEntry?.isFavorite || false)
  const [selectedMood, setSelectedMood] = useState(editEntry?.mood || mood)
  const [tags, setTags] = useState(editEntry?.tags || [])
  const [showMoodPicker, setShowMoodPicker] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTag, setNewTag] = useState("")

  const getMoodEmoji = (moodId) => {
    const moodMap = {
      neutral: "😐",
      happy: "😊",
      excited: "😄",
      love: "🥰",
      blissful: "😌",
      worried: "😟",
      angry: "😠",
      sad: "😢",
      "very-sad": "😭",
      crying: "😢",
    }
    return moodMap[moodId] || "😊"
  }

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      const entryData = {
        title: title.trim() || "Untitled",
        content: content.trim(),
        isFavorite,
        mood: selectedMood,
        tags,
      }

      if (editEntry) {
        entryData.id = editEntry.id
        entryData.date = editEntry.date
      }

      onSave(entryData)
    }
  }

  const formatDate = () => {
    const now = new Date()
    const day = now.getDate()
    const month = now.toLocaleDateString("en-US", { month: "short" })
    const year = now.getFullYear()
    return `${day} ${month} ${year}`
  }

  const moodOptions = [
    { id: "happy", emoji: "😊", label: "Happy" },
    { id: "excited", emoji: "😄", label: "Excited" },
    { id: "love", emoji: "🥰", label: "Love" },
    { id: "blissful", emoji: "😌", label: "Blissful" },
    { id: "neutral", emoji: "😐", label: "Neutral" },
    { id: "worried", emoji: "😟", label: "Worried" },
    { id: "angry", emoji: "😠", label: "Angry" },
    { id: "sad", emoji: "😢", label: "Sad" },
  ]

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
      setShowTagInput(false)
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2C3B9] via-[#F0DDD6] to-[#D6CBBF]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-[#486856]">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="text-center">
          <span className="text-sm text-[#486856] font-medium">{editEntry ? "Edit Entry" : "New Entry"}</span>
        </div>
        <Button onClick={handleSave} className="bg-[#F2C3B9] hover:bg-[#F2C3B9]/80 text-white px-6 py-2 rounded-full">
          {editEntry ? "UPDATE" : "SAVE"}
        </Button>
      </div>

      {/* Date and Mood */}
      <div className="px-4 mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-4xl font-light text-[#486856]">
            {editEntry ? new Date(editEntry.date).getDate() : new Date().getDate()}
          </h2>
          <span className="text-lg text-[#97B3AE]">
            {editEntry
              ? new Date(editEntry.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : formatDate().split(" ").slice(1).join(" ")}
          </span>
        </div>
        <div className="text-3xl">{getMoodEmoji(selectedMood)}</div>
      </div>

      {/* Entry Form */}
      <div className="px-4 space-y-6">
        {/* Favorite Indicator and Tags Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isFavorite && <span className="text-yellow-500">⭐</span>}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, index) => (
                  <span key={index} className="bg-[#97B3AE]/20 text-[#486856] px-2 py-1 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl font-medium text-[#486856] bg-transparent border-none outline-none placeholder-[#97B3AE]/60"
          />
        </div>

        {/* Content Textarea */}
        <div>
          <textarea
            placeholder="Write more here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 text-lg text-[#486856] bg-transparent border-none outline-none resize-none placeholder-[#97B3AE]/60 leading-relaxed"
          />
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-[#97B3AE]/20">
        <div className="flex items-center justify-center py-4 space-x-6">
         
          {/* Favorite Toggle Functionality */}
          <Button
            variant="ghost"
            size="icon"
            className={`${isFavorite ? "text-yellow-500" : "text-[#97B3AE]"}`}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <span className="text-xl">⭐</span>
          </Button>
          {/* Mood Picker Functionality */}
          <Button variant="ghost" size="icon" className="text-[#97B3AE]" onClick={() => setShowMoodPicker(true)}>
            <span className="text-xl">😊</span>
          </Button>
         
          {/* Tag Functionality */}
          <Button variant="ghost" size="icon" className="text-[#97B3AE]" onClick={() => setShowTagInput(true)}>
            <span className="text-xl">🏷️</span>
          </Button>
        </div>
      </div>

      {/* Mood Picker Modal */}
      {showMoodPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#486856]">Change Mood</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMoodPicker(false)}
                    className="text-[#97B3AE] hover:text-[#486856]"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-4 gap-3">
                  {moodOptions.map((moodOption) => (
                    <Button
                      key={moodOption.id}
                      variant="ghost"
                      className={`p-3 h-auto flex flex-col items-center space-y-1 ${
                        selectedMood === moodOption.id ? "bg-[#97B3AE]/20" : ""
                      }`}
                      onClick={() => {
                        setSelectedMood(moodOption.id)
                        setShowMoodPicker(false)
                      }}
                    >
                      <span className="text-2xl">{moodOption.emoji}</span>
                      <span className="text-xs text-[#486856]">{moodOption.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tag Input Modal */}
      {showTagInput && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#486856]">Add Tags</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowTagInput(false)}
                    className="text-[#97B3AE] hover:text-[#486856]"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    className="flex-1 px-3 py-2 border border-[#97B3AE]/30 rounded-lg text-[#486856] placeholder-[#97B3AE]/60"
                  />
                  <Button onClick={handleAddTag} className="bg-[#486856] hover:bg-[#97B3AE] text-white">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-[#486856]">Current Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-[#97B3AE]/20 text-[#486856] px-2 py-1 rounded-full text-sm flex items-center space-x-1 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <span>{tag}</span>
                          <span className="text-xs">✕</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JournalEntryForm
