"use client"

import { useState } from "react"
import { Button } from "./button"
import { Card, CardContent } from "./card"
import { X, ChevronRight, CalendarIcon } from "lucide-react"

const CreateHabitModal = ({ isOpen, onClose, onSave }) => {
  const [habitData, setHabitData] = useState({
    name: "",
    icon: "🎯",
    color: "#6B7280",
    goalType: "cultivate", // cultivate or quit
    frequency: "daily",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  })

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerType, setDatePickerType] = useState("start") // start or end
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const icons = ["🎯", "📚", "💧", "🏃", "🧘", "💪", "🥗", "😴", "📱", "🚭", "🍎", "✍️"]
  const colors = ["#6B7280", "#9CA3AF", "#D1D5DB", "#4B5563", "#374151", "#1F2937"]

  const handleInputChange = (field, value) => {
    setHabitData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!habitData.name.trim()) return

    const newHabit = {
      id: Date.now(),
      ...habitData,
      completedDates: [],
      createdAt: new Date().toISOString(),
    }

    onSave(newHabit)
    setHabitData({
      name: "",
      icon: "🎯",
      color: "#6B7280",
      goalType: "cultivate",
      frequency: "daily",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const getCurrentMonth = () => {
    const date = new Date()
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const getDaysInMonth = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const handleDateSelect = (day) => {
    if (!day) return

    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()
    const selectedDate = new Date(year, month, day)
    const dateString = selectedDate.toISOString().split("T")[0]

    if (datePickerType === "start") {
      handleInputChange("startDate", dateString)
    } else {
      handleInputChange("endDate", dateString)
    }

    setShowDatePicker(false)
  }

  if (!isOpen) return null

  if (showDatePicker) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-sm bg-[#1a1a1a] text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#9CA3AF]">Select Date</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDatePicker(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="text-center mb-4">
              <h4 className="text-lg text-white">{getCurrentMonth()}</h4>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
              {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                <div key={day} className="text-center text-sm text-gray-400 p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-6">
              {getDaysInMonth().map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day)}
                  disabled={!day}
                  className={`p-2 text-sm rounded-full ${
                    day
                      ? day === new Date().getDate()
                        ? "bg-[#6B7280] text-white"
                        : "text-white hover:bg-white/10"
                      : ""
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <Button
              onClick={() => setShowDatePicker(false)}
              className="w-full bg-[#6B7280] hover:bg-[#4B5563] text-white"
            >
              Select
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-[#1a1a1a] text-white border-none max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#9CA3AF]">Create a Habit</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-white text-lg font-medium mb-2">Name</label>
              <input
                type="text"
                placeholder="Enter habit name"
                value={habitData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full bg-transparent border-b border-[#6B7280] text-white placeholder-red-400 pb-2 focus:outline-none focus:border-[#9CA3AF]"
              />
            </div>

            <div>
              <label className="block text-white text-lg font-medium mb-4">Theme</label>

              <div className="space-y-4">
                <div
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: habitData.color }}
                    >
                      {habitData.icon}
                    </div>
                    <span className="text-gray-300">Select Icon</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {showIconPicker && (
                  <div className="grid grid-cols-6 gap-2 p-3 bg-white/5 rounded-lg">
                    {icons.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => {
                          handleInputChange("icon", icon)
                          setShowIconPicker(false)
                        }}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: habitData.color }}></div>
                    <span className="text-gray-300">Custom Color</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {showColorPicker && (
                  <div className="flex space-x-2 p-3 bg-white/5 rounded-lg">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          handleInputChange("color", color)
                          setShowColorPicker(false)
                        }}
                        className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white/30"
                        style={{ backgroundColor: color }}
                      ></button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-white text-lg font-medium mb-4">My Goal is To</label>
              <div className="flex rounded-lg overflow-hidden border border-[#6B7280]">
                <button
                  onClick={() => handleInputChange("goalType", "cultivate")}
                  className={`flex-1 py-3 px-4 text-sm font-medium ${
                    habitData.goalType === "cultivate"
                      ? "bg-[#6B7280] text-white"
                      : "bg-transparent text-gray-300 hover:bg-white/5"
                  }`}
                >
                  🌱 Cultivate
                </button>
                <button
                  onClick={() => handleInputChange("goalType", "quit")}
                  className={`flex-1 py-3 px-4 text-sm font-medium ${
                    habitData.goalType === "quit"
                      ? "bg-[#6B7280] text-white"
                      : "bg-transparent text-gray-300 hover:bg-white/5"
                  }`}
                >
                  🚫 Quit
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white text-lg font-medium mb-4">Details</label>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-300 text-sm mb-2">Schedule of Habit</p>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Goal Period</span>
                    <span className="text-[#9CA3AF]">Daily</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div
                    onClick={() => {
                      setDatePickerType("start")
                      setShowDatePicker(true)
                    }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300">Start Date</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[#9CA3AF]">{formatDate(habitData.startDate)}</span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setDatePickerType("end")
                      setShowDatePicker(true)
                    }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300">End Date (Optional)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[#9CA3AF]">{habitData.endDate ? formatDate(habitData.endDate) : "-"}</span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={!habitData.name.trim()}
            className="w-full mt-8 bg-[#6B7280] hover:bg-[#4B5563] text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✓ Create Habit
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateHabitModal
