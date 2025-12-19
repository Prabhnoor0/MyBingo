"use client"

import { Sparkles, Heart, Brain, Users, Target, Award } from "lucide-react"
import { Link } from "react-router-dom"

export default function AboutPage() {
  return (
    <div className="min-h-screen relative bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url("about.jpg")' }}>
      {/* Background overlay with warm tint */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#F0EEEA]/30" />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 lg:px-12 backdrop-blur-sm shadow-sm bg-[#F2C3B9]/90">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#97B3AE] to-[#D2E0D3] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 w-4 text-white" />
            </div>
            <Link to="/" className="text-2xl font-bold text-[#486856]">SageWillow</Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-[#486856] hover:text-[#D6CBBF] transition-colors">Home</Link>
            <Link to="/journaling" className="text-[#486856] hover:text-[#D6CBBF] transition-colors">Journal</Link>
            <Link to="/habits" className="text-[#486856] hover:text-[#D6CBBF] transition-colors">Habits</Link>
            <Link to="/gratitude" className="text-[#486856] hover:text-[#D6CBBF] transition-colors">Gratitude</Link>
            <Link to="/memory" className="text-[#486856] hover:text-[#D6CBBF] transition-colors">Memory</Link>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-24 px-6 pb-24">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#97B3AE] to-[#D2E0D3] rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-light text-[#486856] mb-6 leading-tight">
                About SageWillow
              </h1>
              <p className="text-xl text-[#6B8E7A] max-w-3xl mx-auto leading-relaxed">
                Empowering college students to prioritize mental wellness and build healthy habits in the midst of academic chaos
              </p>
            </div>

            {/* Personal Introduction */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-16 shadow-lg">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-light text-[#486856] mb-6">Meet the Creator</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#97B3AE] to-[#D2E0D3] mx-auto rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-[#486856] mb-4">Hi, I'm Anjali Pai</h3>
                  <p className="text-[#6B8E7A] leading-relaxed mb-6">
                    I'm currently a sophomore at IIIT Lucknow, and like many college students, I've experienced 
                    firsthand the challenges of balancing academic pressures with personal well-being. The transition 
                    to college life, demanding coursework, and the pressure to excel can sometimes feel overwhelming.
                  </p>
                  <p className="text-[#6B8E7A] leading-relaxed mb-6">
                    Through my own journey of discovering what works for mental wellness, I realized that many students 
                    around me were struggling with similar challenges. I wanted to create something that could help 
                    fellow students build sustainable habits and prioritize their mental health.
                  </p>
                  <p className="text-[#6B8E7A] leading-relaxed">
                    SageWillow is my way of sharing the tools and practices that have helped me thrive in college. 
                    It's built <strong>by a student, for students</strong> – because I understand the unique challenges 
                    we face and what actually works in our busy, often chaotic lives.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-[#F2C3B9]/20 to-[#F0DDD6]/20 rounded-2xl p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <Brain className="w-8 h-8 text-[#97B3AE]" />
                    <h4 className="text-xl font-semibold text-[#486856]">A Student's Perspective</h4>
                  </div>
                  <p className="text-[#6B8E7A] mb-4">
                    As a current college student, I understand the real challenges we face – from exam stress 
                    to social pressures, from late-night study sessions to finding balance.
                  </p>
                  <p className="text-[#6B8E7A]">
                    Every feature in SageWillow has been designed keeping in mind what actually fits into a student's 
                    schedule and what genuinely helps with the stress we experience daily.
                  </p>
                </div>
              </div>
            </div>

            {/* Mission Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-16 shadow-lg">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-light text-[#486856] mb-6">My Mission</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#97B3AE] to-[#D2E0D3] mx-auto rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-[#486856] mb-4">Why I Created SageWillow</h3>
                  <p className="text-[#6B8E7A] leading-relaxed mb-6">
                    College life is a whirlwind of deadlines, exams, social pressures, and personal growth. In this chaos, 
                    mental wellness often takes a backseat. I've seen too many brilliant students struggle with stress, 
                    anxiety, and burnout because they didn't have the tools to maintain their mental health.
                  </p>
                  <p className="text-[#6B8E7A] leading-relaxed">
                    SageWillow was born from a simple belief: <strong>every student deserves to thrive, not just survive.</strong> 
                    I'm here to provide the tools, guidance, and support needed to build sustainable wellness practices 
                    that last beyond graduation.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-[#F2C3B9]/20 to-[#F0DDD6]/20 rounded-2xl p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <Brain className="w-8 h-8 text-[#97B3AE]" />
                    <h4 className="text-xl font-semibold text-[#486856]">Mental Wellness First</h4>
                  </div>
                  <p className="text-[#6B8E7A]">
                    Your mental health is the foundation of everything else. When you're mentally well, 
                    you study better, build stronger relationships, and make wiser decisions.
                  </p>
                </div>
              </div>
            </div>

            {/* Features Overview */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-light text-[#486856] mb-6">Comprehensive Wellness Tools</h2>
                <p className="text-lg text-[#6B8E7A] max-w-2xl mx-auto">
                  Every feature is designed with college students' unique needs in mind
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Journaling */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D2E0D3] to-[#F0EEEA] rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-[#97B3AE]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#486856] mb-3">Mindful Journaling</h3>
                  <p className="text-[#6B8E7A] mb-4">
                    Express your thoughts, track your mood, and gain insights into your emotional patterns. 
                    Perfect for processing daily challenges and celebrating wins.
                  </p>
                  <Link to="/journaling" className="text-[#97B3AE] hover:text-[#486856] font-medium transition-colors">
                    Start Journaling →
                  </Link>
                </div>

                {/* Habits */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#97B3AE] to-[#D2E0D3] rounded-full flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#486856] mb-3">Habit Building</h3>
                  <p className="text-[#6B8E7A] mb-4">
                    Build healthy routines that fit your schedule. From study habits to self-care practices, 
                    track your progress and build momentum.
                  </p>
                  <Link to="/habits" className="text-[#97B3AE] hover:text-[#486856] font-medium transition-colors">
                    Build Habits →
                  </Link>
                </div>

                {/* Gratitude */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F2C3B9] to-[#F0DDD6] rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-[#B8956F]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#486856] mb-3">Gratitude Practice</h3>
                  <p className="text-[#6B8E7A] mb-4">
                    Cultivate a positive mindset through daily gratitude. Research shows this simple practice 
                    reduces stress and improves overall happiness.
                  </p>
                  <Link to="/gratitude" className="text-[#97B3AE] hover:text-[#486856] font-medium transition-colors">
                    Practice Gratitude →
                  </Link>
                </div>

                {/* Memory Lane */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D6CBBF] to-[#F0EEEA] rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-[#B8956F]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#486856] mb-3">Memory Lane</h3>
                  <p className="text-[#6B8E7A] mb-4">
                    Preserve precious moments and create lasting memories. Your college years are special - 
                    capture them in beautiful photo albums.
                  </p>
                  <Link to="/memory" className="text-[#97B3AE] hover:text-[#486856] font-medium transition-colors">
                    Create Memories →
                  </Link>
                </div>

                {/* Music */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F0EEEA] to-[#F2C3B9] rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-[#B8956F]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#486856] mb-3">Calming Playlists</h3>
                  <p className="text-[#6B8E7A] mb-4">
                    Curated music for study sessions, relaxation, and meditation. Create your perfect 
                    soundtrack for different moods and activities.
                  </p>
                  <Link to="/playlist" className="text-[#97B3AE] hover:text-[#486856] font-medium transition-colors">
                    Listen Now →
                  </Link>
                </div>

                {/* Meditation */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F0DDD6] to-[#D6CBBF] rounded-full flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-[#B8956F]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#486856] mb-3">Breathing & Meditation</h3>
                  <p className="text-[#6B8E7A] mb-4">
                    Guided videos and resources for mindfulness practice. Learn breathing techniques and 
                    meditation methods that work for busy schedules.
                  </p>
                  <Link to="/breathing" className="text-[#97B3AE] hover:text-[#486856] font-medium transition-colors">
                    Start Meditating →
                  </Link>
                </div>
              </div>
            </div>

            {/* Why It Matters */}
            <div className="bg-gradient-to-br from-[#97B3AE]/10 to-[#D2E0D3]/10 rounded-3xl p-8 md:p-12 mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-light text-[#486856] mb-6">Why Mental Wellness Matters</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#97B3AE] to-[#D2E0D3] mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold text-[#486856] mb-4">For College Students</h3>
                  <ul className="space-y-3 text-[#6B8E7A]">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#97B3AE] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Better academic performance and focus</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#97B3AE] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Stronger relationships and social connections</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#97B3AE] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Improved stress management and resilience</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#97B3AE] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Better sleep quality and energy levels</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-[#486856] mb-4">For Life Beyond College</h3>
                  <ul className="space-y-3 text-[#6B8E7A]">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#97B3AE] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Lifelong wellness habits and routines</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#97B3AE] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Professional success and work-life balance</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#97B3AE] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Stronger mental health foundation</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#97B3AE] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Better decision-making and emotional intelligence</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg">
                <h2 className="text-3xl md:text-4xl font-light text-[#486856] mb-6">
                  Ready to Transform Your College Experience?
                </h2>
                <p className="text-lg text-[#6B8E7A] mb-8 max-w-2xl mx-auto">
                  Join thousands of students who are already prioritizing their mental wellness and building 
                  healthy habits that will serve them for life.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup">
                    <button className="bg-[#97B3AE] hover:bg-[#486856] text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-colors">
                      Start Your Wellness Journey
                    </button>
                  </Link>
                  <Link to="/">
                    <button className="border-2 border-[#97B3AE] text-[#486856] hover:bg-[#97B3AE] hover:text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-colors">
                      Explore Features
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}