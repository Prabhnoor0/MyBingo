"use client"
import React, { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Sparkles, Menu, Plus, Heart, Calendar, Award, Zap, RefreshCw, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet"
import { Link, useLocation } from "react-router-dom"
import AddGratitudeModal from "../components/ui/AddGratitudeModal"
import GratitudeJar from "../components/ui/GratitudeJar"
import GratitudeNotesModal from "../components/ui/GratitudeNotesModal"
import { gratitudeAPI } from "../services/api"

export default function GratitudePage() {
  const location = useLocation()
  const [showAddModal, setShowAddModal] = useState(false)
  const [gratitudeEntries, setGratitudeEntries] = useState([])
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Interactive jar states
  const [isWiggling, setIsWiggling] = useState(false)
  const [randomNote, setRandomNote] = useState(null)
  
  const [stats, setStats] = useState({
    totalEntries: 0,
    monthlyEntries: 0,
    currentStreak: 0,
    longestStreak: 0
  })

  // Load gratitude entries from backend
  useEffect(() => {
    loadEntries()
    loadStats()
  }, [])

  // Check for preset note from dashboard redirect
  useEffect(() => {
    if (location.state && location.state.presetNote) {
      setShowAddModal(true)
    }
  }, [location])

  const loadEntries = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const response = await gratitudeAPI.getEntries()
      if (response.success) {
        const normalizedEntries = (response.data || []).map((entry) => ({
          ...entry,
          id: entry._id,
          text: entry.note,
          date: entry.createdAt,
        }))
        const sortedEntries = normalizedEntries.sort((a, b) => new Date(b.date) - new Date(a.date))
        setGratitudeEntries(sortedEntries)
      } else {
        setError(response.message || 'Failed to load gratitude entries')
      }
    } catch (error) {
      setError(error.message || 'Failed to load gratitude entries')
      console.error("Error loading gratitude entries:", error)
    } finally {
      setIsLoading(false)
    }
  };

  const loadStats = async () => {
    try {
      const currentDate = new Date()
      const response = await gratitudeAPI.getStats(
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      )
      if (response.success) {
        const data = response.data || {}
        setStats({
          totalEntries: data.totalEntries || 0,
          monthlyEntries: data.monthlyEntries || 0,
          currentStreak: data.streaks?.current || 0,
          longestStreak: data.streaks?.longest || 0,
        })
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  };

  const getCurrentDate = () => {
    const today = new Date()
    return today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  };

  const handleSaveGratitude = async (newEntry) => {
    try {
      const entryData = {
        note: newEntry.text || newEntry.note || "",
        tags: newEntry.tags ? 
          (Array.isArray(newEntry.tags) ? newEntry.tags : 
           newEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag)) : 
          []
      }

      const response = await gratitudeAPI.createEntry(entryData)
      if (response.success) {
        // Wobble the jar on save!
        triggerJarWobble();
        await loadEntries()
        await loadStats()
        return response.data
      } else {
        throw new Error(response.message || 'Failed to save gratitude entry')
      }
    } catch (error) {
      console.error("Error saving gratitude entry:", error)
      setError(error.message || 'Failed to save gratitude entry')
      throw error
    }
  };

  const handleUpdateEntry = async (entryId, newText, newTags = []) => {
    try {
      const entryData = {
        note: newText,
        tags: Array.isArray(newTags) ? newTags : 
              newTags ? newTags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      }

      const response = await gratitudeAPI.updateEntry(entryId, entryData)
      if (response.success) {
        loadEntries()
        loadStats()
      } else {
        setError('Failed to update gratitude entry')
      }
    } catch (error) {
      setError(error.message || 'Failed to update gratitude entry')
      console.error("Error updating gratitude entry:", error)
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this gratitude entry?')) {
      return
    }

    try {
      const response = await gratitudeAPI.deleteEntry(entryId)
      if (response.success) {
        loadEntries()
        loadStats()
      } else {
        setError('Failed to delete gratitude entry')
      }
    } catch (error) {
      setError(error.message || 'Failed to delete gratitude entry')
      console.error("Error deleting gratitude entry:", error)
    }
  };

  const triggerJarWobble = () => {
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 600);
  };

  const handleJarClick = () => {
    triggerJarWobble();
    if (gratitudeEntries.length > 0) {
      // Pick a random entry to display floating on screen
      const randomIndex = Math.floor(Math.random() * gratitudeEntries.length);
      setRandomNote(gratitudeEntries[randomIndex]);
    }
  };

  const handleShowAllNotes = () => {
    if (gratitudeEntries.length > 0) {
      setShowNotesModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EEEA] text-[#333] flex flex-col justify-between">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-6 lg:px-12 backdrop-blur-md bg-white/40 border-b border-white/20 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-sage to-sage-light rounded-full flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <Link to="/" className="text-xl font-bold text-sage-dark">SageWillow</Link>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">Home</Link>
          <Link to="/journaling" className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">Journal</Link>
          <Link to="/habits" className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">Habits</Link>
          <Link to="/memory" className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">Memory</Link>
          <Link to="/breathing" className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">Meditation</Link>
          <Link to="/playlist" className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">Playlist</Link>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-sage-dark">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-[#F0EEEA]">
            <div className="flex flex-col space-y-6 mt-8">
              <Link to="/" className="text-sage-dark text-lg font-medium">Home</Link>
              <Link to="/journaling" className="text-sage-dark text-lg font-medium">Journal</Link>
              <Link to="/habits" className="text-sage-dark text-lg font-medium">Habits</Link>
              <Link to="/memory" className="text-sage-dark text-lg font-medium">Memory</Link>
              <Link to="/breathing" className="text-sage-dark text-lg font-medium">Meditation</Link>
              <Link to="/playlist" className="text-sage-dark text-lg font-medium">Playlist</Link>
            </div>
          </SheetContent>
        </Sheet>
      </nav>

      {/* Main Content */}
      <div className="flex-1 pt-24 pb-16 px-4 max-w-7xl mx-auto w-full flex flex-col gap-8 items-start">
        {/* Top Section: Title, Add button and Stats */}
        <div className="w-full space-y-6">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-sage-dark bg-sage-light/35 p-1 px-3 rounded-full border border-sage/15">
              Gratitude
            </span>
            <h1 className="text-3xl font-light text-slate-800 mt-2">The Gratitude Garden</h1>
            <p className="text-xs text-slate-500 mt-1">Cultivate appreciation and watch your energy bloom.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-[11px] flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError("")} className="text-red-700 font-bold">✕</button>
            </div>
          )}

          {/* Quick Stats Panel */}
          <div className="glass-panel rounded-3xl p-5 border border-white/35 space-y-4">
            <h3 className="text-xs font-bold text-sage-dark uppercase tracking-wider">Garden Milestones</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/50 p-3 rounded-2xl border border-white/20 text-center">
                <span className="text-2xl font-bold text-slate-800">{stats.totalEntries}</span>
                <span className="text-[9px] block text-slate-500 font-semibold uppercase tracking-wider mt-1">Total Notes</span>
              </div>
              <div className="bg-white/50 p-3 rounded-2xl border border-white/20 text-center">
                <span className="text-2xl font-bold text-slate-800">{stats.monthlyEntries}</span>
                <span className="text-[9px] block text-slate-500 font-semibold uppercase tracking-wider mt-1">This Month</span>
              </div>
              <div className="bg-white/50 p-3 rounded-2xl border border-white/20 text-center flex items-center justify-center gap-1.5 col-span-2">
                <Zap className="w-4 h-4 text-peach animate-bounce" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Streak: {stats.currentStreak} Days</span>
                  <span className="text-[8px] text-slate-400 font-medium leading-none block">Best: {stats.longestStreak} Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drop Note Button */}
          <Button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-sage hover:bg-sage-dark text-white rounded-2xl py-6 text-sm shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Grateful Moment
          </Button>

          {/* Action to show all notes in table */}
          {gratitudeEntries.length > 0 && (
            <Button
              variant="outline"
              onClick={handleShowAllNotes}
              className="w-full border-sage/35 text-sage-dark hover:bg-white/50 rounded-2xl py-6 text-xs font-semibold"
            >
              Open Gratitude Collection
            </Button>
          )}
        </div>

        {/* Jar Display */}
        <div className="w-full flex flex-col items-center justify-center relative min-h-[450px]">
          {/* Wobbling Jar Wrapper */}
          <div className={`${isWiggling ? 'animate-wiggle' : ''} transition-all duration-300`}>
            <GratitudeJar entries={gratitudeEntries} onJarClick={handleJarClick} />
          </div>

          {/* Floating Random Note Reveal Card */}
          {randomNote && (
            <div className="absolute inset-x-4 top-10 md:inset-x-20 z-40 bg-white/95 backdrop-blur-md border border-white/45 p-6 rounded-3xl shadow-xl space-y-4 animate-float-up pointer-events-auto">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5 text-purple-600">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Random Reflection</span>
                </div>
                <button 
                  onClick={() => setRandomNote(null)} 
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-sm text-slate-800 italic leading-relaxed">
                "{randomNote.text}"
              </p>

              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100/50">
                <span>{new Date(randomNote.date).toLocaleDateString()}</span>
                <span className="bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-bold">
                  Grateful
                </span>
              </div>
            </div>
          )}

          {/* Shake Instructions */}
          {gratitudeEntries.length > 0 && (
            <div className="mt-8 flex items-center gap-2 bg-white/45 backdrop-blur-sm border border-white/20 p-2.5 px-5 rounded-full shadow-inner text-xs text-slate-600 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 text-sage" />
              <span>Tap the Jar to pull a random happy memory</span>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddGratitudeModal 
        isOpen={showAddModal} 
        onClose={() => {
          setShowAddModal(false)
          if (error) setError("")
        }} 
        onSave={handleSaveGratitude}
        loading={isLoading}
        presetNote={location.state?.presetNote || ""}
      />
      <GratitudeNotesModal
        isOpen={showNotesModal}
        onClose={() => {
          setShowNotesModal(false)
          if (error) setError("")
        }}
        entries={gratitudeEntries}
        onUpdateEntry={handleUpdateEntry}
        onDeleteEntry={handleDeleteEntry}
        loading={isLoading}
      />
    </div>
  )
}