"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Slider } from "./ui/slider"
import { Card, CardContent } from "./ui/card"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Heart, Repeat, Shuffle } from "lucide-react"

export default function MusicPlayer({
  currentTrack,
  playlist = [],
  currentIndex = 0,
  onTrackChange,
  onPlaylistEnd,
  className = "",
}) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  // Helper: resolve best audio source
  const resolveSrc = (track) => {
    const direct = track?.audio || track?.audiodownload || track?.url
    if (direct) return direct
    // Fallback for Jamendo tracks stored without url
    if (track?.source === 'jamendo' && track?.externalId) {
      return `https://mp3d.jamendo.com/?trackid=${track.externalId}&format=mp31`
    }
    return ''
  }

  // Update audio source when track changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      const src = resolveSrc(currentTrack)
      audioRef.current.src = src
      audioRef.current.load()
      setCurrentTime(0)
      setIsLoading(true)
      if (!src) {
        setIsLoading(false)
        setIsPlaying(false)
        return
      }
      // Attempt autoplay after source set (often allowed after user gesture)
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        // Autoplay might be blocked; user can press play
        setIsPlaying(false)
        setIsLoading(false)
      })
    }
  }, [currentTrack])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0
        audio.play()
      } else {
        handleNext()
      }
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("waiting", handleWaiting)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("waiting", handleWaiting)
    }
  }, [isRepeat])

  const togglePlay = async () => {
    if (!audioRef.current || !currentTrack) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Error playing audio:", error)
      setIsLoading(false)
    }
  }

  const handleSeek = (value) => {
    if (audioRef.current) {
      const newTime = (value[0] / 100) * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (value) => {
    const newVolume = value[0] / 100
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const handlePrevious = () => {
    if (playlist.length === 0) return

    let newIndex
    if (isShuffle) {
      newIndex = Math.floor(Math.random() * playlist.length)
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1
    }

    onTrackChange?.(playlist[newIndex], newIndex)
  }

  const handleNext = () => {
    if (playlist.length === 0) return

    let newIndex
    if (isShuffle) {
      newIndex = Math.floor(Math.random() * playlist.length)
    } else {
      newIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0
    }

    if (newIndex === 0 && !isRepeat && !isShuffle) {
      // Reached end of playlist
      setIsPlaying(false)
      onPlaylistEnd?.()
      return
    }

    onTrackChange?.(playlist[newIndex], newIndex)
  }

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    // Here you would typically save to localStorage or send to API
  }

  if (!currentTrack) {
    return (
      <Card className={`bg-[#97B3AE]/10 backdrop-blur-sm border-[#97B3AE]/30 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center text-[#6B8E7A]">
            <Music className="w-6 h-6 mr-2" />
            <span>No track selected</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-white/90 backdrop-blur-sm border-[#97B3AE]/30 shadow-lg ${className}`}>
      <CardContent className="p-4">
        <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />

        {/* Track Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-[#97B3AE]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Music className="w-6 h-6 text-[#97B3AE]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[#486856] truncate">{currentTrack.title || currentTrack.name || 'Untitled'}</h3>
              <p className="text-sm text-[#6B8E7A] truncate">{currentTrack.artist_name || currentTrack.artist || 'Unknown artist'}</p>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={toggleLike}
            className={`flex-shrink-0 ${isLiked ? "text-red-500" : "text-[#97B3AE]"} hover:text-red-500`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-[#6B8E7A] mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsShuffle(!isShuffle)}
              className={`${isShuffle ? "text-[#97B3AE]" : "text-[#6B8E7A]"} hover:text-[#97B3AE]`}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsRepeat(!isRepeat)}
              className={`${isRepeat ? "text-[#97B3AE]" : "text-[#6B8E7A]"} hover:text-[#97B3AE]`}
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          {/* Center Controls */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePrevious}
              disabled={playlist.length === 0}
              className="text-[#97B3AE] hover:text-[#486856]"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              onClick={togglePlay}
              disabled={isLoading}
              className="bg-[#97B3AE] hover:bg-[#486856] text-white w-10 h-10 rounded-full"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleNext}
              disabled={playlist.length === 0}
              className="text-[#97B3AE] hover:text-[#486856]"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Right Controls - Volume */}
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" onClick={toggleMute} className="text-[#97B3AE] hover:text-[#486856]">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
