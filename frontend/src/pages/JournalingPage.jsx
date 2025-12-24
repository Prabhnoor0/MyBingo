"use client"
import React, { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Sparkles, Menu, Plus, Calendar, FileText, Edit, Trash2, ArrowLeft, Heart, BarChart2 } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet"
import { Link } from "react-router-dom"
import MoodSelector from "../components/ui/MoodSelector.jsx"
import JournalEntryForm from "../components/ui/JournalEntryForm.jsx"
import { journalAPI } from "../services/api"

const JournalingPage = () => {
  const [entries, setEntries] = useState([])
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [selectedMood, setSelectedMood] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showEntryViewer, setShowEntryViewer] = useState(false)
  const [showCalendarView, setShowCalendarView] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInsight, setAiInsight] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await journalAPI.getEntries()
      if (Array.isArray(response)) {
        const sortedEntries = response.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setEntries(sortedEntries)
      } else {
        setError('Invalid response format from server')
      }
    } catch (error) {
      setError(error.message || 'Failed to load journal entries')
      console.error('Error loading entries:', error)
    } finally {
      setLoading(false)
    }
  };

  const handleNewEntry = () => {
    setShowMoodSelector(true)
  };

  const handleMoodSelected = (mood) => {
    setSelectedMood(mood)
    setShowMoodSelector(false)
    setShowEntryForm(true)
  };

  const handleSaveEntry = async (entryData) => {
    setLoading(true)
    setError("")
    
    try {
      const dataToSave = {
        title: entryData.title || "",
        content: entryData.content || "",
        mood: editingEntry ? entryData.mood : selectedMood,
        tags: Array.isArray(entryData.tags) ? entryData.tags : [],
        isFavorite: entryData.isFavorite || false
      }

      let response
      if (editingEntry) {
        response = await journalAPI.updateEntry(editingEntry._id, dataToSave)
      } else {
        response = await journalAPI.createEntry(dataToSave)
      }

      if (response && response._id) {
        setShowEntryForm(false)
        setSelectedMood(null)
        setEditingEntry(null)
        loadEntries()
      } else {
        setError('Invalid response from server')
      }
    } catch (error) {
      console.error('Error saving entry:', error)
      setError(error.message || 'Failed to save journal entry')
    } finally {
      setLoading(false)
    }
  };

  const handleCancelEntry = () => {
    setShowEntryForm(false)
    setSelectedMood(null)
    setEditingEntry(null)
  };

  const handleOpenEntry = (entry) => {
    setSelectedEntry(entry)
    setAiInsight("") // Reset previous insights
    setShowEntryViewer(true)
  };

  const handleCloseEntryViewer = () => {
    setSelectedEntry(null)
    setAiInsight("")
    setShowEntryViewer(false)
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry)
    setShowEntryForm(true)
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      return
    }

    try {
      const response = await journalAPI.deleteEntry(entryId)
      if (response && response.message) {
        loadEntries() 
        if (selectedEntry && selectedEntry._id === entryId) {
          handleCloseEntryViewer()
        }
      }
    } catch (error) {
      setError(error.message || 'Failed to delete journal entry')
      console.error('Error deleting entry:', error)
    }
  };

  const handleGenerateAiInsight = async () => {
    if (!selectedEntry || !selectedEntry.content) return;
    setAiLoading(true);
    try {
      const response = await journalAPI.analyzeEntry(selectedEntry.content);
      if (response && response.insight) {
        setAiInsight(response.insight);
      }
    } catch (err) {
      console.error(err);
      setAiInsight("Unable to connect with SageWillow. Please ensure your API keys are configured correctly.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleToggleFavorite = async (entry) => {
    try {
      const response = await journalAPI.updateEntry(entry._id, {
        isFavorite: !entry.isFavorite
      })
      if (response && response._id) {
        loadEntries() 
        // Update currently viewed entry
        setSelectedEntry(prev => prev && prev._id === entry._id ? { ...prev, isFavorite: !prev.isFavorite } : prev)
      }
    } catch (error) {
      setError(error.message || 'Failed to update journal entry')
      console.error('Error updating favorite status:', error)
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString("en-US", { month: "short" })
    return { day, month }
  };

  const getMoodEmoji = (mood) => {
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
    return moodMap[mood] || "😊"
  };

  const getEntryStats = () => {
    const totalEntries = entries.length
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1
      return acc
    }, {})
    
    const mostCommonMood = Object.keys(moodCounts).length > 0 
      ? Object.keys(moodCounts).reduce((a, b) => (moodCounts[a] > moodCounts[b] ? a : b))
      : null

    return { totalEntries, moodCounts, mostCommonMood }
  };

  return (
    <div className="min-h-screen bg-[#F0EEEA] text-[#333]">
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
          <Link to="/habits" className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">Habits</Link>
          <Link to="/gratitude" className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">Gratitude</Link>
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
              <Link to="/habits" className="text-sage-dark text-lg font-medium">Habits</Link>
              <Link to="/gratitude" className="text-sage-dark text-lg font-medium">Gratitude</Link>
              <Link to="/memory" className="text-sage-dark text-lg font-medium">Memory</Link>
              <Link to="/breathing" className="text-sage-dark text-lg font-medium">Meditation</Link>
              <Link to="/playlist" className="text-sage-dark text-lg font-medium">Playlist</Link>
            </div>
          </SheetContent>
        </Sheet>
      </nav>

      {/* Main Layout */}
      <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-sage-dark bg-sage-light/35 p-1 px-3 rounded-full border border-sage/15">
              Journaling
            </span>
            <h1 className="text-3xl font-light text-slate-800 mt-2">Your Thoughts Sanctuary</h1>
            <p className="text-xs text-slate-500 mt-1">A safe space for your thoughts and feelings.</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowStats(true)} className="rounded-xl border-sage/35 text-sage-dark">
              <BarChart2 className="w-4 h-4 mr-1.5" />
              Stats
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowCalendarView(true)} className="rounded-xl border-sage/35 text-sage-dark">
              <Calendar className="w-4 h-4 mr-1.5" />
              History
            </Button>
            <Button 
              onClick={() => setIsWriting(true)}
              className="bg-sage hover:bg-sage-dark text-white rounded-xl flex items-center gap-2 shadow-sm"
            >
              <PenTool className="w-4 h-4" />
              <span className="hidden sm:inline">Write Entry</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-[11px] flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-700 font-bold">✕</button>
          </div>
        )}

        {/* Entries List Area */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sage mx-auto"></div>
            <p className="text-sage-dark text-xs mt-4">Loading your sanctuary entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-24 bg-white/45 border border-white/20 rounded-3xl p-8 shadow-sm">
            <FileText className="w-16 h-16 text-sage/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">No Journal Entries Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Start capturing your thoughts, moods, and reflections. Click the plus button below to write your first entry.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            {entries.map((entry) => {
              const { day, month } = formatDate(entry.createdAt || entry.date)
              return (
                <Card
                  key={entry._id}
                  className="bg-white/45 hover:bg-white/75 border border-white/20 shadow-sm cursor-pointer transition-all duration-300 rounded-3xl group flex flex-col justify-between"
                  onClick={() => handleOpenEntry(entry)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3.5 items-center">
                        <div className="bg-white p-2 px-3 rounded-2xl shadow-sm border border-slate-100 text-center min-w-[50px]">
                          <div className="text-xl font-bold text-slate-800 leading-none">{day}</div>
                          <div className="text-[10px] text-sage font-bold uppercase tracking-wider mt-0.5">{month}</div>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-sage-dark bg-white/60 p-1 px-2.5 rounded-full border border-white/20">
                            Saved
                          </span>
                        </div>
                      </div>
                      <div className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                        {getMoodEmoji(entry.mood)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-800 leading-snug truncate">
                        {entry.title || "Untitled Entry"}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {entry.content}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-100/50">
                      <div className="flex flex-wrap gap-1">
                        {entry.tags?.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-[9px] font-bold bg-sage-light/45 text-sage-dark px-2 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                        {entry.tags?.length > 2 && (
                          <span className="text-[9px] font-medium text-slate-400">+{entry.tags.length - 2}</span>
                        )}
                      </div>
                      {entry.isFavorite && <Heart className="w-4 h-4 text-red-400 fill-red-400" />}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={handleNewEntry}
          className="bg-sage hover:bg-sage-dark text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center group"
          disabled={loading}
        >
          <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
        </Button>
      </div>

      {/* Modals & Sub-views */}
      {showMoodSelector && (
        <MoodSelector onMoodSelect={handleMoodSelected} onClose={() => setShowMoodSelector(false)} />
      )}

      {showEntryForm && (
        <div className="fixed inset-0 z-50">
          <JournalEntryForm
            mood={selectedMood}
            onSave={handleSaveEntry}
            onCancel={handleCancelEntry}
            editEntry={editingEntry}
            loading={loading}
          />
        </div>
      )}

      {/* Premium Journal Entry Viewer Modal */}
      {showEntryViewer && selectedEntry && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-lg border border-white/25 rounded-3xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{getMoodEmoji(selectedEntry.mood)}</div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{selectedEntry.title || "Untitled Entry"}</h2>
                  <p className="text-xs text-slate-500">
                    {new Date(selectedEntry.createdAt || selectedEntry.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1.5">
                <Button variant="ghost" size="icon" onClick={() => handleToggleFavorite(selectedEntry)} className="rounded-full text-slate-400 hover:text-red-400">
                  <Heart className={`w-4 h-4 ${selectedEntry.isFavorite ? "fill-red-400 text-red-400" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => {
                  handleEditEntry(selectedEntry)
                  handleCloseEntryViewer()
                }} className="rounded-full text-slate-500 hover:text-sage-dark">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(selectedEntry._id)} className="rounded-full text-slate-500 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCloseEntryViewer} className="rounded-full text-slate-400 hover:text-slate-700 ml-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content & AI Insights */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Tags */}
              {selectedEntry.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedEntry.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-bold bg-sage-light/45 text-sage-dark px-2.5 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Journal Body */}
              <div className="prose prose-sm max-w-none">
                <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedEntry.content || "No content available."}
                </p>
              </div>

              {/* AI Insights Card */}
              <div className="pt-6 border-t border-slate-100">
                <div className="bg-gradient-to-br from-accent-purple/45 to-accent-blue/35 p-5 rounded-2xl border border-white/45 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600 animate-pulse-slow" />
                      <h4 className="text-xs font-bold text-sage-dark uppercase tracking-wider">SageWillow's Journal Reflections</h4>
                    </div>

                    {!aiInsight && !aiLoading && (
                      <Button size="xs" onClick={handleGenerateAiInsight} className="bg-sage text-white rounded-xl text-[10px] px-3">
                        Ask SageWillow
                      </Button>
                    )}
                  </div>

                  {aiLoading ? (
                    <div className="flex items-center gap-2 py-2">
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b border-purple-600"></div>
                      <span className="text-xs text-slate-500 italic">SageWillow is reading your reflection...</span>
                    </div>
                  ) : aiInsight ? (
                    <p className="text-xs text-slate-700 leading-relaxed italic bg-white/50 p-3 rounded-xl border border-white/20">
                      "{aiInsight}"
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      Click the button above to receive supportive reflections, self-care prompts, and encouraging comments from SageWillow.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View Modal */}
      {showCalendarView && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-white/20 rounded-3xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800">Sanctuary History</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCalendarView(false)} className="rounded-full text-slate-400">
                ✕
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {entries.length === 0 ? (
                <p className="text-xs text-slate-500 text-center">No entries found.</p>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between p-3 bg-white hover:bg-sage-light/20 border border-slate-100 rounded-2xl cursor-pointer transition-all"
                    onClick={() => {
                      setShowCalendarView(false)
                      handleOpenEntry(entry)
                    }}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">
                          {entry.title || "Untitled Entry"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(entry.createdAt || entry.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400 rotate-180" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats View Modal */}
      {showStats && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-white/20 rounded-3xl shadow-xl max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800 font-semibold">Mood Statistics</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowStats(false)} className="rounded-full text-slate-400">
                ✕
              </Button>
            </div>

            {entries.length === 0 ? (
              <p className="text-xs text-slate-500 text-center">No entries to analyze.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-sage-light/20 p-4 rounded-2xl border border-sage/10">
                    <div className="text-2xl font-bold text-sage-dark">{getEntryStats().totalEntries}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Total Reflections</div>
                  </div>
                  <div className="bg-peach-light/30 p-4 rounded-2xl border border-peach/15">
                    <div className="text-2xl">{getMoodEmoji(getEntryStats().mostCommonMood)}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Common Mood</div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mood Distribution</h3>
                  <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {Object.entries(getEntryStats().moodCounts).map(([mood, count]) => (
                      <div key={mood} className="flex items-center justify-between text-xs text-slate-700">
                        <span className="flex items-center space-x-2">
                          <span>{getMoodEmoji(mood)}</span>
                          <span className="capitalize">{mood.replace('-', ' ')}</span>
                        </span>
                        <span className="font-bold text-slate-800">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default JournalingPage