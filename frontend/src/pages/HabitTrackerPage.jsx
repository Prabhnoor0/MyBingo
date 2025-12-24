"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import {
  Sparkles, Plus, Calendar, CheckCircle2, Circle, BarChart3,
  Trash2, Edit, Target, X, TrendingUp, Flame
} from "lucide-react"
import { Link } from "react-router-dom"
import { habitAPI } from "../services/api"

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const ICON_OPTIONS = ['🏃', '📚', '💧', '🧘', '💪', '🍎', '✍️', '🎯', '🛌', '🌿', '🎵', '🧠']
const COLOR_OPTIONS = [
  '#97B3AE', '#F2C3B9', '#B5C9A1', '#E8C99A', '#B3A9D4', '#A8C8D4', '#F2B9C9', '#D4C4B0'
]

function HabitCard({ habit, onToggle, onEdit, onDelete }) {
  const isCompleted = (() => {
    const today = new Date().toISOString().split('T')[0]
    return habit.completedDates?.includes(today) || false
  })()

  const streak = habit.completedDates?.length || 0
  const weekDays = (() => {
    const today = new Date()
    const day = today.getDay()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - day + i)
      const str = d.toISOString().split('T')[0]
      return { label: DAY_LABELS[i], done: habit.completedDates?.includes(str), isToday: str === today.toISOString().split('T')[0] }
    })
  })()

  return (
    <div className={`bg-white/55 hover:bg-white/75 border transition-all duration-300 rounded-3xl p-5 shadow-sm hover:shadow-md ${
      isCompleted ? 'border-sage/40 bg-sage-light/25' : 'border-white/25'
    }`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon + Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center text-xl shadow-sm"
            style={{ backgroundColor: habit.color + '35', border: `2px solid ${habit.color}55` }}
          >
            {habit.icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 truncate">{habit.name}</h3>
            <p className="text-[10px] text-slate-400 capitalize">{habit.frequency} · {habit.goalCount} {habit.goalUnit}</p>
            <div className="flex items-center gap-1 mt-1">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-[10px] font-semibold text-orange-400">{streak} done</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(habit)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-sage-dark transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(habit._id)}
            className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggle(habit)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-bold transition-all duration-300 ${
              isCompleted
                ? 'bg-sage-light/60 text-sage-dark border border-sage/25'
                : 'bg-sage hover:bg-sage-dark text-white shadow-sm'
            }`}
          >
            {isCompleted ? <><CheckCircle2 className="w-3.5 h-3.5" />Done!</> : 'Finish'}
          </button>
        </div>
      </div>

      {/* Weekly Dots */}
      <div className="flex justify-between mt-4 pt-3 border-t border-slate-100/50">
        {weekDays.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className={`text-[9px] font-bold ${d.isToday ? 'text-sage-dark' : 'text-slate-400'}`}>{d.label}</span>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
              d.done ? 'bg-sage shadow-sm' : d.isToday ? 'border-2 border-sage/40 bg-sage-light/20' : 'bg-slate-100'
            }`}>
              {d.done && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const [stats, setStats] = useState({ totalHabits: 0, activeHabits: 0, averageCompletion: 0 })
  const [formData, setFormData] = useState({
    name: "", description: "", frequency: "daily",
    icon: "📝", color: "#97B3AE", goalCount: 1, goalUnit: "time"
  })

  useEffect(() => { loadHabits(); loadStats() }, [])

  const loadHabits = async () => {
    setLoading(true); setError("")
    try {
      const r = await habitAPI.getHabits()
      if (r.success) setHabits(r.data)
      else setError(r.message || 'Failed to load habits')
    } catch (e) { setError(e.message || 'Failed to load habits') }
    finally { setLoading(false) }
  }

  const loadStats = async () => {
    try {
      const d = new Date()
      const r = await habitAPI.getStats(d.getMonth() + 1, d.getFullYear())
      if (r.success) {
        const total = r.data.habits.length
        const active = r.data.habits.filter(h => h.completionRate > 0).length
        const avg = total > 0 ? Math.round(r.data.habits.reduce((s, h) => s + h.completionRate, 0) / total) : 0
        setStats({ totalHabits: total, activeHabits: active, averageCompletion: avg })
      }
    } catch {}
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) { setError("Habit name is required"); return }
    setLoading(true); setError("")
    try {
      const r = editingHabit
        ? await habitAPI.updateHabit(editingHabit._id, formData)
        : await habitAPI.createHabit(formData)
      if (r.success) { setShowCreateModal(false); resetForm(); loadHabits(); loadStats() }
      else setError(r.message || 'Failed to save habit')
    } catch (e) { setError(e.message || 'Failed to save') }
    finally { setLoading(false) }
  }

  const handleEdit = (habit) => {
    setEditingHabit(habit)
    setFormData({ name: habit.name||"", description: habit.description||"", frequency: habit.frequency||"daily",
      icon: habit.icon||"📝", color: habit.color||"#97B3AE", goalCount: habit.goalCount||1, goalUnit: habit.goalUnit||"time" })
    setShowCreateModal(true)
  }

  const deleteHabit = async (id) => {
    if (!window.confirm('Delete this habit?')) return
    try { const r = await habitAPI.deleteHabit(id); if (r.success) { loadHabits(); loadStats() } }
    catch (e) { setError(e.message) }
  }

  const toggleHabitCompletion = async (habit) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const r = await habitAPI.toggleCompletion(habit._id, today)
      if (r.success) { loadHabits(); loadStats() }
    } catch (e) { setError(e.message) }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", frequency: "daily", icon: "📝", color: "#97B3AE", goalCount: 1, goalUnit: "time" })
    setEditingHabit(null)
  }

  const getCurrentDate = () => new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  const completedToday = habits.filter(h => h.completedDates?.includes(new Date().toISOString().split('T')[0])).length
  const completionPct = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0

  return (
    <div className="min-h-screen bg-[#F0EEEA]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-6 lg:px-12 backdrop-blur-md bg-white/40 border-b border-white/20 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-sage to-sage-light rounded-full flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <Link to="/" className="text-xl font-bold text-sage-dark">SageWillow</Link>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {[['/', 'Home'], ['/journaling', 'Journal'], ['/gratitude', 'Gratitude'], ['/memory', 'Memory'], ['/breathing', 'Meditation'], ['/playlist', 'Playlist']].map(([path, label]) => (
            <Link key={path} to={path} className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">{label}</Link>
          ))}
        </div>
      </nav>

      <div className="pt-24 pb-24 px-4 max-w-7xl mx-auto space-y-6 w-full">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-sage-dark bg-sage-light/35 p-1 px-3 rounded-full border border-sage/15">
            Daily Habits
          </span>
          <h1 className="text-4xl font-light text-slate-800 mt-3">
            Habit <span className="font-semibold text-sage-dark">Tracker</span>
          </h1>
          <p className="text-xs text-slate-500">{getCurrentDate()}</p>
        </div>

        {/* Progress Summary */}
        {habits.length > 0 && (
          <div className="glass-panel rounded-3xl p-5 border border-white/35 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Today's Progress</p>
                <p className="text-3xl font-bold text-sage-dark mt-0.5">
                  {completedToday} <span className="text-slate-400 text-lg font-light">/ {habits.length}</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-1">habits completed</p>
              </div>
              {/* Circle Progress */}
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke="#97B3AE" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - completionPct / 100)}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-sage-dark">{completionPct}%</span>
                </div>
              </div>
            </div>

            {/* Mini Stats Row */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100/60">
              {[
                { label: 'Total', value: stats.totalHabits, icon: Target },
                { label: 'Active', value: stats.activeHabits, icon: TrendingUp },
                { label: 'Avg Rate', value: `${stats.averageCompletion}%`, icon: BarChart3 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center">
                  <Icon className="w-4 h-4 text-sage mx-auto mb-1" />
                  <p className="text-base font-bold text-slate-800">{value}</p>
                  <p className="text-[9px] text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex justify-between items-center">
            {error}
            <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Habit List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">Your Habits</h2>
            <button
              onClick={() => { resetForm(); setShowCreateModal(true) }}
              className="flex items-center gap-1.5 bg-sage hover:bg-sage-dark text-white text-xs font-bold px-4 py-2 rounded-2xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Habit
            </button>
          </div>

          {loading && habits.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-10 h-10 border-2 border-sage border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading habits...</p>
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-16 space-y-4 glass-panel rounded-3xl border border-white/25">
              <Target className="w-14 h-14 text-sage/40 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-700">No habits yet</p>
                <p className="text-xs text-slate-400 mt-1">Start tracking your wellness journey</p>
              </div>
              <button
                onClick={() => { resetForm(); setShowCreateModal(true) }}
                className="bg-sage text-white text-xs font-bold px-5 py-2.5 rounded-2xl hover:bg-sage-dark transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 inline mr-1" /> Create First Habit
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map(habit => (
                <HabitCard
                  key={habit._id}
                  habit={habit}
                  onToggle={toggleHabitCompletion}
                  onEdit={handleEdit}
                  onDelete={deleteHabit}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Habit Form Dialog */}
      <Dialog open={showCreateModal} onOpenChange={v => { setShowCreateModal(v); if (!v) resetForm() }}>
        <DialogContent className="bg-[#F8F6F3] max-w-md w-full rounded-3xl border-none shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sage-dark text-lg font-bold text-center">
              {editingHabit ? '✏️ Edit Habit' : '✨ New Habit'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Habit Name *</Label>
              <Input
                placeholder="e.g., Morning Run, Read 20 pages..."
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="rounded-2xl border-sage/20 bg-white/80 focus:bg-white text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Description</Label>
              <Textarea
                placeholder="Why does this habit matter to you?"
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                rows={2}
                className="rounded-2xl border-sage/20 bg-white/80 focus:bg-white text-sm resize-none"
              />
            </div>

            {/* Icon Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Icon</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, icon }))}
                    className={`w-9 h-9 rounded-2xl text-lg transition-all duration-200 ${
                      formData.icon === icon ? 'bg-sage-light shadow-sm ring-2 ring-sage/40 scale-110' : 'bg-white/70 hover:bg-white'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Color</Label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, color }))}
                    className={`w-7 h-7 rounded-full transition-all duration-200 ${
                      formData.color === color ? 'scale-125 ring-2 ring-slate-400' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Frequency + Goal */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Frequency</Label>
                <select
                  value={formData.frequency}
                  onChange={e => setFormData(p => ({ ...p, frequency: e.target.value }))}
                  className="w-full border border-sage/20 rounded-2xl px-3 py-2 text-xs bg-white/80 text-slate-700"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Goal #</Label>
                <Input
                  type="number" min="1"
                  value={formData.goalCount}
                  onChange={e => setFormData(p => ({ ...p, goalCount: parseInt(e.target.value)||1 }))}
                  className="rounded-2xl border-sage/20 bg-white/80 text-xs text-center"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Unit</Label>
                <select
                  value={formData.goalUnit}
                  onChange={e => setFormData(p => ({ ...p, goalUnit: e.target.value }))}
                  className="w-full border border-sage/20 rounded-2xl px-3 py-2 text-xs bg-white/80 text-slate-700"
                >
                  <option value="time">Times</option>
                  <option value="minutes">Minutes</option>
                  <option value="pages">Pages</option>
                  <option value="glasses">Glasses</option>
                  <option value="steps">Steps</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => { setShowCreateModal(false); resetForm() }}
                className="flex-1 rounded-2xl border-sage/25 text-sage-dark"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-sage hover:bg-sage-dark text-white rounded-2xl font-bold"
              >
                {loading ? 'Saving...' : (editingHabit ? 'Update Habit' : 'Create Habit')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}