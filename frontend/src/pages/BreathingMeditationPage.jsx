"use client"
import React, { useState, useEffect, useRef } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import {
  Sparkles, Play, Pause, BookOpen, ExternalLink, Search,
  Loader2, Volume2, VolumeX, Wind, RefreshCw
} from "lucide-react"
import { Link } from "react-router-dom"

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

const articles = [
  { title: "The Science of Mindfulness", source: "American Psychological Association", url: "https://www.apa.org/monitor/2012/07-08/ce-corner" },
  { title: "How Meditation Affects the Brain", source: "Harvard Health", url: "https://www.health.harvard.edu/mind-and-mood/meditation-what-it-can-do-for-you" },
  { title: "Breathwork Techniques for Stress", source: "Cleveland Clinic", url: "https://health.clevelandclinic.org/breathing-exercises-for-anxiety/" },
  { title: "A Beginner's Guide to Meditation", source: "Mindful.org", url: "https://www.mindful.org/how-to-meditate/" },
]

const DEFAULT_SEARCH_TERMS = [
  'guided meditation breathing', 'mindfulness meditation 10 minutes',
  'breathing exercises anxiety', 'meditation for beginners'
]

const SOUNDSCAPES = [
  { id: 'rain', name: 'Rainfall', emoji: '🌧️', url: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊', url: 'https://assets.mixkit.co/active_storage/sfx/1162/1162-preview.mp3' },
  { id: 'forest', name: 'Forest', emoji: '🌲', url: 'https://assets.mixkit.co/active_storage/sfx/2496/2496-preview.mp3' },
  { id: 'wind', name: 'Wind', emoji: '🍃', url: 'https://assets.mixkit.co/active_storage/sfx/2409/2409-preview.mp3' },
]

// Box Breathing Phase config: inhale 4s → hold 4s → exhale 4s → hold 4s
const PHASES = [
  { label: 'Inhale', duration: 4, scale: 1.5, color: '#97B3AE' },
  { label: 'Hold', duration: 4, scale: 1.5, color: '#D2E0D3' },
  { label: 'Exhale', duration: 4, scale: 0.8, color: '#F2C3B9' },
  { label: 'Hold', duration: 4, scale: 0.8, color: '#F0DDD6' },
]

function BoxBreathing() {
  const [isRunning, setIsRunning] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [count, setCount] = useState(PHASES[0].duration)
  const [cycles, setCycles] = useState(0)
  const intervalRef = useRef(null)

  const currentPhase = PHASES[phaseIdx]

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          // Move to next phase
          setPhaseIdx(prevIdx => {
            const next = (prevIdx + 1) % PHASES.length
            if (next === 0) setCycles(c => c + 1)
            setCount(PHASES[next].duration)
            return next
          })
          return PHASES[phaseIdx].duration
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [isRunning, phaseIdx])

  const handleToggle = () => {
    if (!isRunning) {
      setPhaseIdx(0)
      setCount(PHASES[0].duration)
    }
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setPhaseIdx(0)
    setCount(PHASES[0].duration)
    setCycles(0)
    clearInterval(intervalRef.current)
  }

  const progress = ((PHASES[phaseIdx].duration - count) / PHASES[phaseIdx].duration) * 100
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/35 shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-sage-dark flex items-center justify-center gap-2">
          <Wind className="w-5 h-5 animate-pulse-slow" />
          Box Breathing
        </h2>
        <p className="text-[11px] text-slate-500">4-4-4-4 breathing technique to calm your nervous system</p>
      </div>

      {/* SVG Breathing Circle */}
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          {/* Pulsing Background */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-[4000ms] ease-in-out"
            style={{
              transform: `scale(${isRunning ? currentPhase.scale : 1})`,
              backgroundColor: currentPhase.color,
              opacity: 0.25,
            }}
          />

          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="6" />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={currentPhase.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={isRunning ? strokeDashoffset : circumference}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <span className="text-4xl font-bold text-slate-800">{count}</span>
            <span
              className="text-xs font-bold uppercase tracking-widest mt-1 transition-all duration-500"
              style={{ color: currentPhase.color }}
            >
              {isRunning ? currentPhase.label : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Cycles Badge */}
      <div className="flex justify-center">
        <span className="text-[11px] font-semibold text-sage-dark bg-sage-light/35 px-3 py-1 rounded-full border border-sage/15">
          🔄 {cycles} Cycles Completed
        </span>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <Button
          onClick={handleToggle}
          className={`rounded-2xl px-7 py-5 text-sm font-semibold shadow-sm ${
            isRunning ? 'bg-peach hover:bg-peach-light text-slate-800' : 'bg-sage hover:bg-sage-dark text-white'
          }`}
        >
          {isRunning ? <><Pause className="w-4 h-4 mr-2" />Pause</> : <><Play className="w-4 h-4 mr-2" />Start</>}
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          className="rounded-2xl px-5 py-5 border-sage/35 text-sage-dark"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Phase Guide */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100/50">
        {PHASES.map((p, i) => (
          <div
            key={i}
            className={`text-center rounded-xl p-2 transition-all duration-300 ${
              isRunning && i === phaseIdx ? 'shadow-md scale-105' : 'opacity-50'
            }`}
            style={{ backgroundColor: p.color + '50' }}
          >
            <div className="text-[10px] font-bold text-slate-700">{p.label}</div>
            <div className="text-[10px] text-slate-500">{p.duration}s</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SoundscapePlayer() {
  const [currentSound, setCurrentSound] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const handleSoundToggle = (sound) => {
    if (currentSound?.id === sound.id) {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false) }
      else { audioRef.current.play().catch(() => {}); setIsPlaying(true) }
    } else {
      if (audioRef.current) audioRef.current.pause()
      setCurrentSound(sound)
      setIsPlaying(true)
      const audio = new Audio(sound.url)
      audio.loop = true
      audioRef.current = audio
      audio.play().catch(() => {})
    }
  }

  useEffect(() => { return () => { if (audioRef.current) audioRef.current.pause() } }, [])

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/35 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-sage-dark flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          Ambient Soundscapes
        </h2>
        {isPlaying && (
          <button
            onClick={() => { audioRef.current?.pause(); setIsPlaying(false); setCurrentSound(null) }}
            className="text-[10px] text-red-500 font-bold flex items-center gap-1"
          >
            <VolumeX className="w-3 h-3" /> Mute
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SOUNDSCAPES.map(sound => {
          const active = currentSound?.id === sound.id && isPlaying
          return (
            <button
              key={sound.id}
              onClick={() => handleSoundToggle(sound)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all duration-300 text-left ${
                active ? 'bg-sage-light/60 border-sage shadow-sm' : 'bg-white/40 border-white/20 hover:bg-white/60'
              }`}
            >
              <span className="text-xl">{sound.emoji}</span>
              <div>
                <div className="text-xs font-bold text-slate-800 leading-none">{sound.name}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">{active ? '▶ Playing' : 'Tap to play'}</div>
              </div>
            </button>
          )
        })}
      </div>
      <p className="text-[10px] text-center text-slate-400 italic">Loop these sounds during your breathing practice.</p>
    </div>
  )
}

export default function BreathingMeditationPage() {
  const [query, setQuery] = useState("")
  const [activeVideo, setActiveVideo] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const searchYouTubeVideos = async (searchQuery, maxResults = 20) => {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?key=${YOUTUBE_API_KEY}&q=${encodeURIComponent(searchQuery)}&part=snippet&type=video&maxResults=${maxResults}&order=relevance&videoDuration=medium&safeSearch=strict`
    )
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    return data.items || []
  }

  const getVideoDetails = async (videoIds) => {
    try {
      const response = await fetch(
        `${YOUTUBE_API_BASE}/videos?key=${YOUTUBE_API_KEY}&id=${videoIds.join(',')}&part=contentDetails,statistics`
      )
      if (!response.ok) return []
      const data = await response.json()
      return data.items || []
    } catch { return [] }
  }

  const formatDuration = (duration) => {
    const match = duration?.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return 'N/A'
    const hours = parseInt(match[1]) || 0
    const minutes = parseInt(match[2]) || 0
    const seconds = parseInt(match[3]) || 0
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const loadInitialVideos = async () => {
    setLoading(true); setError(null)
    try {
      const allVideos = []
      for (const term of DEFAULT_SEARCH_TERMS) {
        const results = await searchYouTubeVideos(term, 6)
        allVideos.push(...results)
      }
      const unique = allVideos.filter((v, i, s) => i === s.findIndex(x => x.id.videoId === v.id.videoId))
      const ids = unique.map(v => v.id.videoId)
      const details = await getVideoDetails(ids)
      const formatted = unique.map(v => {
        const d = details.find(x => x.id === v.id.videoId)
        return {
          id: v.id.videoId,
          title: v.snippet.title,
          channel: v.snippet.channelTitle,
          duration: d ? formatDuration(d.contentDetails.duration) : 'N/A',
          url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
          thumbnail: v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default?.url,
          publishedAt: v.snippet.publishedAt
        }
      })
      formatted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      setVideos(formatted.slice(0, 12))
    } catch (e) {
      setError('Failed to load videos. Please check your YouTube API key.')
      console.error(e)
    } finally { setLoading(false) }
  }

  const handleSearch = async (q) => {
    if (!q.trim()) { loadInitialVideos(); return }
    setLoading(true); setError(null)
    try {
      const results = await searchYouTubeVideos(q, 12)
      const ids = results.map(v => v.id.videoId)
      const details = await getVideoDetails(ids)
      const formatted = results.map(v => {
        const d = details.find(x => x.id === v.id.videoId)
        return {
          id: v.id.videoId,
          title: v.snippet.title,
          channel: v.snippet.channelTitle,
          duration: d ? formatDuration(d.contentDetails.duration) : 'N/A',
          url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
          thumbnail: v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default?.url,
          publishedAt: v.snippet.publishedAt
        }
      })
      setVideos(formatted)
    } catch (e) {
      setError('Failed to search videos.')
    } finally { setLoading(false) }
  }

  useEffect(() => { loadInitialVideos() }, [])
  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 600)
    return () => clearTimeout(timer)
  }, [query])

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
          {[['/', 'Home'], ['/journaling', 'Journal'], ['/habits', 'Habits'], ['/gratitude', 'Gratitude'], ['/memory', 'Memory'], ['/playlist', 'Playlist']].map(([path, label]) => (
            <Link key={path} to={path} className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">{label}</Link>
          ))}
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-sage-dark bg-sage-light/35 p-1 px-3 rounded-full border border-sage/15">
            Mindfulness
          </span>
          <h1 className="text-4xl md:text-5xl font-light text-slate-800 mt-3">
            Breathing & <span className="font-semibold text-sage-dark">Meditation</span>
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Calm your nervous system with guided breathing exercises and ambient soundscapes.
          </p>
        </div>

        {/* Two-column interactive panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BoxBreathing />
          <SoundscapePlayer />
        </div>

        {/* Video Search */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Play className="w-5 h-5 text-sage" />
              Guided Meditation Videos
            </h2>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage" />
              <Input
                placeholder="Search videos..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-9 rounded-2xl border-sage/30 bg-white/60 focus:bg-white/90 text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl text-xs">
              ⚠️ {error} (YouTube API key may not be configured — add <code>VITE_YOUTUBE_API_KEY</code> to your frontend <code>.env</code>)
            </div>
          )}

          {loading && videos.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/45 rounded-3xl overflow-hidden border border-white/20 shadow-sm animate-pulse">
                  <div className="aspect-video bg-slate-200 w-full" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map(v => (
                <div key={v.id} className="bg-white/50 hover:bg-white/80 border border-white/20 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="aspect-video overflow-hidden relative">
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all" />
                    <button
                      onClick={() => setActiveVideo(v)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                        <Play className="w-5 h-5 text-sage-dark ml-0.5" />
                      </div>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">{v.title}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{v.channel} · {v.duration}</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setActiveVideo(v)} className="bg-sage hover:bg-sage-dark text-white rounded-xl text-[10px] px-3 py-1.5 h-auto">
                        <Play className="w-3 h-3 mr-1" /> Watch
                      </Button>
                      <a href={v.url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="border-sage/30 text-sage-dark rounded-xl text-[10px] px-3 py-1.5 h-auto">
                          <ExternalLink className="w-3 h-3 mr-1" /> Open
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Articles */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sage" />
            Wellness Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noreferrer" className="block">
                <div className="bg-white/50 hover:bg-white/80 border border-white/20 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
                  <div className="p-3 bg-sage-light/35 rounded-2xl group-hover:bg-sage-light transition-colors">
                    <BookOpen className="w-5 h-5 text-sage-dark" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-sage-dark transition-colors">{a.title}</h3>
                    <p className="text-[11px] text-slate-500">{a.source}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sage transition-colors flex-shrink-0 mt-1" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={!!activeVideo} onOpenChange={() => setActiveVideo(null)}>
        <DialogContent className="bg-white max-w-3xl w-full rounded-3xl border-none shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-sage-dark text-sm font-bold line-clamp-1">{activeVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="w-full aspect-video rounded-2xl overflow-hidden">
            {activeVideo && (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}