"use client"

import { useState } from "react"
import { Button } from "./button"
import { Card, CardContent } from "./card"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

const MonthlyStatsModal = ({ isOpen, onClose, habits, selectedHabit }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTab, setSelectedTab] = useState("Monthly")

  if (!isOpen || !selectedHabit) return null

  const getMonthName = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonth = new Date(year, month, 0)
      const prevDay = prevMonth.getDate() - (startingDayOfWeek - 1 - i)
      days.push({ day: prevDay, isCurrentMonth: false, date: new Date(year, month - 1, prevDay) })
    }

    // Add all days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true, date: new Date(year, month, day) })
    }

    // Add days from next month to fill the grid
    const remainingCells = 42 - days.length // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push({ day, isCurrentMonth: false, date: new Date(year, month + 1, day) })
    }

    return days
  }

  const isHabitCompletedOnDate = (habit, date) => {
    const dateString = date.toDateString()
    return habit.completedDates?.includes(dateString) || false
  }

  const getCompletionStatus = (date) => {
    if (!selectedHabit || !date) return "none"

    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    const isFuture = date > today
    const isCompleted = isHabitCompletedOnDate(selectedHabit, date)

    if (isFuture) return "future"
    if (isToday) return isCompleted ? "completed-today" : "missed-today"
    return isCompleted ? "completed" : "missed"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-orange-500"
      case "completed-today":
        return "bg-orange-600 ring-2 ring-orange-300"
      case "missed":
        return "bg-pink-400 ring-2 ring-pink-300"
      case "missed-today":
        return "bg-blue-500 ring-2 ring-blue-300"
      case "future":
        return "bg-gray-200"
      default:
        return "bg-gray-100"
    }
  }

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const calculateStats = () => {
    if (!selectedHabit.completedDates) return { lifetimeStreak: 0, completionRate: 0 }

    const completedDates = selectedHabit.completedDates.map((dateStr) => new Date(dateStr))
    const startDate = new Date(selectedHabit.startDate || selectedHabit.createdAt)
    const today = new Date()

    // Calculate total days since start
    const totalDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1

    // Calculate completion rate
    const completionRate = totalDays > 0 ? Math.round((completedDates.length / totalDays) * 100) : 0

    // Calculate current streak (simplified)
    const lifetimeStreak = completedDates.length

    return { lifetimeStreak, completionRate }
  }

  const stats = calculateStats()
  const days = getDaysInMonth(currentDate)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white border-none max-h-[90vh] overflow-y-auto">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4A90E2] to-[#6BB6FF] p-4 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: selectedHabit.color }}
                >
                  <span className="text-white text-sm">{selectedHabit.icon}</span>
                </div>
                <span className="font-medium">{selectedHabit.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white/20 rounded-lg p-1">
              {["Monthly", "Yearly", "All time"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    selectedTab === tab ? "bg-white text-[#4A90E2]" : "text-white/80 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth(-1)}
                className="text-gray-600 hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-lg font-semibold text-gray-800">{getMonthName(currentDate)}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth(1)}
                className="text-gray-600 hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-6">
              {days.map((dayObj, index) => {
                const status = dayObj.isCurrentMonth ? getCompletionStatus(dayObj.date) : "none"
                const statusColor = getStatusColor(status)

                return (
                  <div
                    key={index}
                    className={`aspect-square flex items-center justify-center text-sm rounded-full ${
                      dayObj.isCurrentMonth ? `${statusColor} text-white font-medium` : "text-gray-300"
                    }`}
                  >
                    {dayObj.day}
                  </div>
                )
              })}
            </div>

            {/* Tooltip */}
            <div className="bg-[#4A90E2] text-white p-3 rounded-lg mb-4 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#4A90E2]"></div>
              <p className="text-sm text-center">This is your monthly tracking of your habit</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.lifetimeStreak}</div>
                <div className="text-sm text-gray-600">Lifetime streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.completionRate}%</div>
                <div className="text-sm text-gray-600">Completion rate</div>
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-4xl">🦊</span>
                <span className="text-sm text-gray-600">Can you keep your streak?</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Tap to continue</div>
                <div className="text-xs text-gray-400">👆</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MonthlyStatsModal
