"use client"

import { Card, CardContent } from "./card.jsx"
import { Button } from "./button.jsx"
import { X } from "lucide-react"

const MoodSelector = ({ onMoodSelect, onClose }) => {
  const moods = [
    { id: "neutral", emoji: "😐", color: "bg-orange-200" },
    { id: "happy", emoji: "😊", color: "bg-yellow-200" },
    { id: "excited", emoji: "😄", color: "bg-yellow-300" },
    { id: "love", emoji: "🥰", color: "bg-pink-200" },
    { id: "blissful", emoji: "😌", color: "bg-purple-200" },
    { id: "worried", emoji: "😟", color: "bg-yellow-300" },
    { id: "angry", emoji: "😠", color: "bg-orange-300" },
    { id: "sad", emoji: "😢", color: "bg-blue-200" },
    { id: "very-sad", emoji: "😭", color: "bg-blue-300" },
    { id: "crying", emoji: "😢", color: "bg-teal-200" },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#486856]">How's your day?</h3>
            <Button variant="ghost" onClick={onClose} className="text-[#97B3AE] hover:text-[#486856] p-1 h-auto">
              <X size={20} />
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {moods.map((mood) => (
              <Button
                key={mood.id}
                onClick={() => onMoodSelect(mood.id)}
                className={`${mood.color} hover:scale-110 transition-transform duration-200 rounded-full w-12 h-12 p-0 border-none`}
                variant="ghost"
              >
                <span className="text-2xl">{mood.emoji}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MoodSelector
