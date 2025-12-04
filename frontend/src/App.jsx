import React, { useState, useEffect, useRef } from "react"
import { Button } from "./components/ui/button"
import { Card, CardContent } from "./components/ui/card"
import { 
  BookOpen, Heart, CheckSquare, Wind, Camera, Music, Menu, Sparkles, 
  Smile, Award, Zap, Volume2, VolumeX, Flame, LogOut, Sun, Calendar, ArrowRight, User
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "./components/ui/sheet"
import { Link, Routes, Route, useNavigate } from "react-router-dom"

import "./App.css"
import JournalingPage from "./pages/JournalingPage"
import HabitTrackerPage from "./pages/HabitTrackerPage"
import GratitudePage from "./pages/GratitudePage"
import MemoryLanePage from "./pages/MemoryLanePage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import CalmingPlaylistPage from "./pages/CalmingPlaylistPage"
import ChatWithSageWillow from "./pages/ChatWithSageWillow"
import BreathingMeditationPage from "./pages/BreathingMeditationPage"
import AboutPage from "./pages/AboutPage"
import ContactPage from "./pages/ContactPage"
import ProtectedRoute from "./components/ProtectedRoute"
import { useAuth } from "./contexts/AuthContext"

// Soundscape audio clips
const SOUNDSCAPES = [
  { id: 'rain', name: 'Rainfall', url: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3' },
  { id: 'ocean', name: 'Ocean Waves', url: 'https://assets.mixkit.co/active_storage/sfx/1162/1162-preview.mp3' },
  { id: 'forest', name: 'Forest Birds', url: 'https://assets.mixkit.co/active_storage/sfx/2496/2496-preview.mp3' },
  { id: 'wind', name: 'Warm Wind', url: 'https://assets.mixkit.co/active_storage/sfx/2409/2409-preview.mp3' }
];

const DAILY_QUOTES = [
  "You don't have to see the whole staircase, just take the first step. You've got this.",
  "Your mental health is a priority. Your happiness is an essential. Your self-care is a necessity.",
  "In the middle of difficulty lies opportunity. Take a breath and focus on the now.",
  "Be proud of how hard you are trying. You are doing enough, and you are enough.",
  "Slow progress is still progress. Be gentle with yourself today."
];

// Helper to get formatted date
const getFormattedDate = () => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
};

// --- AUTHENTICATED USER DASHBOARD ---
function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quote, setQuote] = useState("");
  const [currentSound, setCurrentSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Select daily quote based on the day of the month
    const day = new Date().getDate();
    setQuote(DAILY_QUOTES[day % DAILY_QUOTES.length]);
  }, []);

  const handleSoundToggle = (sound) => {
    if (currentSound?.id === sound.id) {
      // Toggle play/pause
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(e => console.log(e));
        setIsPlaying(true);
      }
    } else {
      // Play new sound
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setCurrentSound(sound);
      setIsPlaying(true);
      
      const audio = new Audio(sound.url);
      audio.loop = true;
      audioRef.current = audio;
      audio.play().catch(e => console.log(e));
    }
  };

  const stopAllSounds = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentSound(null);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const menuItems = [
    {
      title: "Mindful Journaling",
      desc: "Process emotions & get AI-powered insights.",
      icon: BookOpen,
      color: "bg-white",
      textCol: "text-[#486856]",
      link: "/journaling",
      actionText: "Write Entry"
    },
    {
      title: "Gratitude Jar",
      desc: "Save notes & shake the jar to recall happy moments.",
      icon: Heart,
      color: "bg-white",
      textCol: "text-[#8A5E53]",
      link: "/gratitude",
      actionText: "Drop Note"
    },
    {
      title: "Habit Tracker",
      desc: "Build daily routine streaks & unlock badges.",
      icon: CheckSquare,
      color: "bg-white",
      textCol: "text-[#3C584E]",
      link: "/habits",
      actionText: "Track Habits"
    },
    {
      title: "Breathing & Soundscapes",
      desc: "Box breathing exercises with nature sound overlays.",
      icon: Wind,
      color: "bg-white",
      textCol: "text-[#6C5F53]",
      link: "/breathing",
      actionText: "Start Breathing"
    },
    {
      title: "Memory Lane",
      desc: "Create albums & save precious student memories.",
      icon: Camera,
      color: "bg-white",
      textCol: "text-[#6C5B48]",
      link: "/memory",
      actionText: "Upload Photos"
    },
    {
      title: "Calming Music",
      desc: "Relaxing focus sounds & customized playlists.",
      icon: Music,
      color: "bg-white",
      textCol: "text-[#785E5A]",
      link: "/playlist",
      actionText: "Listen Now"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0EEEA] text-[#333]">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-6 lg:px-12 backdrop-blur-md bg-white/40 border-b border-white/20 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-sage to-sage-light rounded-full flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-sage-dark">SageWillow</span>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/chat">
            <Button size="sm" className="bg-sage hover:bg-sage-dark text-white rounded-full flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse-slow" />
              Chat with SageWillow
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="rounded-full text-sage-dark md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="hidden md:flex items-center space-x-2 border-l border-sage/35 pl-4">
            <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center text-sage-dark text-xs font-semibold shadow-inner">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-sage-dark mr-2">{user?.name || 'Student'}</span>
            <Button size="icon" variant="ghost" onClick={logout} className="text-[#8C5E53] hover:bg-white/40 rounded-full h-8 w-8" title="Logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-8">
        {/* Top Area: Greeting, Quote, Quick Links */}
        <div className="space-y-8">
          {/* Welcome Panel */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden border border-sage/20">
            <div className="space-y-1">
              <p className="text-xs text-sage-dark font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sage" />
                {getFormattedDate()}
              </p>
              <h1 className="text-3xl md:text-4xl font-light text-slate-800">
                Welcome back, <span className="font-semibold text-sage-dark">{user?.name?.split(' ')[0] || 'friend'}</span>
              </h1>
              <p className="text-sm text-[#6B8E7A]">How is your energy feeling today?</p>
            </div>

            {/* Quick Streak Widget */}
            <div className="flex items-center gap-3 bg-[#F0EEEA] p-3 px-5 rounded-2xl border border-sage/20 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-sage flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-sage-dark font-medium leading-none">Streaks Active</p>
                <p className="text-lg font-bold text-slate-800 leading-tight">Focus Mode</p>
              </div>
            </div>
          </div>

          {/* SageWillow's Affirmation Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage/20 flex items-start gap-4">
            <div className="p-3 bg-sage-light/30 rounded-2xl text-sage-dark">
              <Sparkles className="w-6 h-6" />
            </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-[#486856] text-lg">Daily Mindful Reminder</h3>
                <p className="text-slate-700 italic text-sm md:text-base">"{quote}"</p>
                <div className="pt-2 flex gap-3">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-xs text-purple-700 hover:bg-purple-100/45 px-2 rounded-lg"
                    onClick={() => {
                      // Redirect to gratitude jar with pre-filled quote
                      navigate("/gratitude", { state: { presetNote: `Mindful Reminder: ${quote}` } });
                    }}
                  >
                    Save to Gratitude Jar +
                  </Button>
                </div>
              </div>
            </div>

          {/* Quick Access Feature Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-sage-dark flex items-center gap-2 px-1">
              <Sun className="w-5 h-5 text-sage" />
              Wellness Space
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`${item.color} rounded-3xl p-6 shadow-sm border border-sage/20 hover:border-sage/40 transition-colors duration-300 flex flex-col justify-between min-h-[160px]`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-[#F0EEEA] rounded-2xl text-sage-dark">
                      <item.icon className={`w-6 h-6 ${item.textCol}`} />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-sage-dark/65 px-2.5 rounded-full border border-sage/20">
                      Feature
                    </span>
                  </div>

                  <div>
                    <h3 className={`font-semibold text-lg ${item.textCol} leading-snug`}>{item.title}</h3>
                    <p className="text-xs text-slate-700 mt-1 line-clamp-2 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-white/20 mt-4 flex justify-between items-center">
                    <Link to={item.link} className="w-full">
                      <Button size="sm" variant="ghost" className={`w-full justify-between p-0 font-medium ${item.textCol} hover:bg-transparent`}>
                        {item.actionText}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Area: AI Chat Quick Access, Ambient Soundscapes */}
        <div className="space-y-8">
          {/* Chat with SageWillow Assistant Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4 border border-sage/20 relative overflow-hidden">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center">
                <Smile className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Supportive AI Friend</h3>
                <p className="text-[11px] text-[#6B8E7A] font-medium tracking-wide uppercase">SageWillow is active</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Feeling stressed about exams, overwhelmed with work, or just need to talk? I am here to listen with absolute empathy.
            </p>

            <Link to="/chat" className="block w-full">
              <Button className="w-full bg-sage hover:bg-sage-dark text-white rounded-2xl shadow-sm py-5 text-xs">
                Talk to SageWillow Now
              </Button>
            </Link>
          </div>

          {/* Ambient Soundscapes Box */}
          <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5 border border-sage/20">
            <div className="flex justify-between items-center border-b border-sage/25 pb-3">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-sage-dark" />
                <h3 className="font-semibold text-slate-800 text-sm">Meditation Sounds</h3>
              </div>
              {isPlaying && (
                <Button variant="ghost" size="xs" onClick={stopAllSounds} className="text-xs text-red-500 font-semibold flex items-center gap-1 hover:bg-red-50 p-1 px-2.5 rounded-full">
                  <VolumeX className="w-3.5 h-3.5" />
                  Mute
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {SOUNDSCAPES.map((sound) => {
                const active = currentSound?.id === sound.id;
                return (
                  <div 
                    key={sound.id} 
                    onClick={() => handleSoundToggle(sound)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      active && isPlaying 
                        ? 'bg-sage-light/60 border-sage shadow-sm' 
                        : 'bg-white/40 border-white/20 hover:bg-white/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl transition-all ${
                        active && isPlaying ? 'bg-sage text-white' : 'bg-white text-sage-dark'
                      }`}>
                        {active && isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </div>
                      <span className="text-xs font-semibold text-slate-800">{sound.name}</span>
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-wider text-sage-dark/65 px-2 bg-white/40 rounded-full py-0.5">
                      {active && isPlaying ? 'Playing' : 'Tap'}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-[#7A8A82] text-center italic">
              Overlay sounds in the background to focus or sleep.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- LANDING PAGE FOR GUESTS ---
function LandingPage() {
  const navigate = useNavigate()
  const features = [
    {
      icon: BookOpen,
      title: "Mindful Journaling",
      description: "Express your inner feelings in a safe, private space, and unlock supportive AI Insights.",
      color: "bg-white",
      slug: "journaling",
    },
    {
      icon: Heart,
      title: "Gratitude Jar Check",
      description: "Shake the interactive glass jar and recall positive memories on challenging days.",
      color: "bg-white",
      slug: "gratitudecheck",
    },
    {
      icon: CheckSquare,
      title: "Routine Habit Tracker",
      description: "Form daily wellness routines, track completion rates, and earn milestone badges.",
      color: "bg-white",
      slug: "habittracker",
    },
    {
      icon: Wind,
      title: "Breathing & Soundscapes",
      description: "Guided box breathing with relaxing nature sound loops playing in the background.",
      color: "bg-white",
      slug: "breathingmeditation",
    },
    {
      icon: Camera,
      title: "Memory Lane Lane",
      description: "Upload snapshots to Cloudinary, creating dedicated grid albums of student life.",
      color: "bg-white",
      slug: "memorylane",
    },
    {
      icon: Music,
      title: "Calming Music",
      description: "Ambient study sounds and calming tracks built for focused study or deep relaxation.",
      color: "bg-white",
      slug: "calmingplaylist",
    }
  ]

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className="min-h-screen relative bg-[#F0EEEA] scroll-smooth"
    >
      
      <div className="relative z-10">
        {/* Guest Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-6 lg:px-12 backdrop-blur-md bg-white/30 border-b border-white/20 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sage to-sage-light rounded-full flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-sage-dark">SageWillow</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={scrollToFeatures} className="text-sage-dark hover:text-sage transition-colors cursor-pointer text-sm font-semibold">Features</button>
            <Link to="/about" className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">About</Link>
            <Link to="/contact" className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">Contact</Link>
            <Link to="/login">
              <Button size="sm" variant="ghost" className="text-sage-dark hover:bg-white/40 rounded-full px-5 text-xs font-semibold">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-sage hover:bg-sage-dark text-white rounded-full px-5 text-xs shadow-sm">Sign Up</Button>
            </Link>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-sage-dark">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-[#F0EEEA]">
              <div className="flex flex-col space-y-6 mt-8">
                <button onClick={scrollToFeatures} className="text-sage-dark text-lg text-left font-medium">Features</button>
                <Link to="/about" className="text-sage-dark text-lg font-medium">About</Link>
                <Link to="/contact" className="text-sage-dark text-lg font-medium">Contact</Link>
                <div className="pt-6 border-t border-sage/20 flex flex-col space-y-3">
                  <Link to="/login" className="w-full">
                    <Button variant="outline" className="w-full border-sage text-sage-dark rounded-xl">Log In</Button>
                  </Link>
                  <Link to="/signup" className="w-full">
                    <Button className="w-full bg-sage text-white rounded-xl">Sign Up</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>

        {/* Hero Section */}
        <section className="text-center pt-32 pb-20 px-6 max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-sage rounded-full flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extralight text-slate-800 mb-6 leading-tight">
            Your Companion to <span className="block font-semibold text-[#8B7355]">Inner Calm</span>
          </h1>
          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover a safe digital sanctuary built specifically for college students. Track habits, keep private journals with AI reflections, and build gratitude daily.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-sage hover:bg-sage-dark text-white rounded-2xl px-10 py-6 text-base shadow-md">
                Begin Your Journey
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToFeatures}
              className="border-sage text-sage-dark hover:bg-sage hover:text-white rounded-2xl px-10 py-6 text-base bg-transparent transition-all"
            >
              Explore Features
            </Button>
          </div>
        </section>

        {/* Features Showcase */}
        <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light text-slate-800 mb-4">Wellness Tools</h2>
            <p className="text-sm text-sage-dark font-medium tracking-widest uppercase">Everything you need to thrive</p>
            <div className="w-16 h-1 bg-sage mx-auto rounded-full mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className={`border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group rounded-3xl ${feature.color}`}
              >
                <CardContent className="p-8 h-full flex flex-col items-center text-center justify-between space-y-6 group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                    <feature.icon className="w-6 h-6 text-sage-dark" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-800">{feature.title}</h3>
                    <p className="text-xs text-slate-700 leading-relaxed">{feature.description}</p>
                  </div>

                  <Link to="/signup" className="pt-4 block w-full">
                    <Button variant="ghost" className="w-full text-sage-dark text-xs font-semibold hover:bg-white/30 rounded-xl">
                      Unlock Tool →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <div className="bg-white/40 backdrop-blur-md border border-white/35 rounded-3xl p-12 text-center shadow-sm">
            <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-4">Ready to Start?</h2>
            <p className="text-sm text-slate-600 mb-8 max-w-xl mx-auto">
              Join students prioritizing self-care, mindfulness, and a healthy work-life balance with SageWillow.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-sage hover:bg-sage-dark text-white rounded-2xl px-12 py-5 text-sm shadow-md">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function App() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Dashboard /> : <LandingPage />} />
      <Route path="/journaling" element={
        <ProtectedRoute>
          <JournalingPage />
        </ProtectedRoute>
      } />
      <Route path="/habits" element={
        <ProtectedRoute>
          <HabitTrackerPage />
        </ProtectedRoute>
      } />
      <Route path="/gratitude" element={
        <ProtectedRoute>
          <GratitudePage />
        </ProtectedRoute>
      } />
      <Route path="/memory" element={
        <ProtectedRoute>
          <MemoryLanePage />
        </ProtectedRoute>
      } />
      <Route path="/playlist" element={
        <ProtectedRoute>
          <CalmingPlaylistPage />
        </ProtectedRoute>
      } />
      <Route path="/breathing" element={
        <ProtectedRoute>
          <BreathingMeditationPage />
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <ChatWithSageWillow />
        </ProtectedRoute>
      } />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/contact" element={<ContactPage />} />
    </Routes>
  )
}