"use client"

import { Heart } from "lucide-react"

export default function GratitudeJar({ entries, onJarClick }) {
  // Generate random positions and rotations for notes
  const generateNoteStyle = (index) => {
    const colors = ["#F2C3B9", "#D2E0D3", "#F5E6D3", "#E6ECF2", "#EBE3F5", "#F0DDD6", "#E8EAE6"]
    const rotations = [-20, -15, -10, -5, 0, 5, 10, 15, 20]

    return {
      backgroundColor: colors[index % colors.length],
      left: `${12 + (index % 5) * 15}%`,
      top: `${22 + Math.floor(index / 5) * 16}%`,
      transform: `rotate(${rotations[index % rotations.length]}deg)`,
    }
  }

  return (
    <div className="flex justify-center mb-6">
      <div
        className="relative cursor-pointer transform hover:scale-[1.03] active:scale-[0.99] transition-all duration-300"
        onClick={onJarClick}
      >
        {/* Mason Jar Container */}
        <div className="w-80 h-96 relative">
          {/* Jar Body - Mason jar shape with straight sides and rounded bottom */}
          <div
            className="absolute bottom-0 w-full h-[320px] bg-white/30 border-[3.5px] border-white/75 backdrop-blur-md overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.04)]"
            style={{ borderRadius: "0 0 45px 45px" }}
          >
            {/* Mason jar threading lines */}
            <div className="absolute top-0 left-0 right-0 h-8 border-b border-white/40"></div>
            <div className="absolute top-2 left-0 right-0 h-[0.5px] border-b border-white/30"></div>
            <div className="absolute top-4 left-0 right-0 h-[0.5px] border-b border-white/30"></div>

            {/* Gratitude Notes Inside Jar */}
            <div className="absolute inset-4 top-10">
              {entries.slice(0, 24).map((entry, index) => (
                <div
                  key={entry.id || index}
                  className="absolute w-8 h-12 rounded-[3px] shadow-[0_2px_6px_rgba(0,0,0,0.06)] transition-all duration-300 hover:scale-110 border border-white/40"
                  style={generateNoteStyle(index)}
                >
                  {/* Rolled paper effect */}
                  <div className="w-full h-full flex items-center justify-center relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/25 rounded-t-sm"></div>
                    <Heart className="w-2.5 h-2.5 text-sage-dark/70" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 rounded-b-sm"></div>
                  </div>
                </div>
              ))}

              {/* Empty jar message */}
              {entries.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-4">
                    <Heart className="w-7 h-7 text-sage/40 mx-auto mb-2 animate-pulse" />
                    <p className="text-slate-400 text-xs leading-relaxed max-w-[160px] mx-auto font-light">Your jar is waiting for grateful moments</p>
                  </div>
                </div>
              )}
            </div>

            {/* Click to view text */}
            {entries.length > 0 && (
              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
                <p className="text-sage-dark/80 text-[11px] font-medium tracking-wide">Click to view notes</p>
                <div className="flex justify-center mt-1">
                  <div className="w-1.5 h-1.5 bg-sage rounded-full animate-ping"></div>
                </div>
              </div>
            )}

            {/* Jar shine effect */}
            <div className="absolute top-10 left-6 w-8 h-28 bg-gradient-to-r from-white/25 to-transparent rounded-full blur-[2px]"></div>
          </div>

          {/* Mason Jar Lid (cork style) */}
          <div className="absolute top-[24px] left-1/2 transform -translate-x-1/2 w-64 h-10 bg-gradient-to-b from-[#D2C5B4] to-[#B3A492] rounded-t-md shadow-md border-b-4 border-[#9A8B79]/50">
            {/* Cork details / wood lines */}
            <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
            <div className="absolute inset-x-4 top-1 bottom-1 flex justify-between opacity-30">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-[1.5px] h-full bg-[#7C6E5E] rounded-full"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Jar Label */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 text-sage-dark px-7 py-2.5 rounded-full text-xs font-semibold shadow-md border border-white/60 flex items-center space-x-1.5">
          <Heart className="w-3.5 h-3.5 text-sage" />
          <span>Gratitude Jar</span>
          <Heart className="w-3.5 h-3.5 text-sage" />
        </div>

        {/* Floating hearts animation */}
        {entries.length > 0 && (
          <>
            <div
              className="absolute -top-8 -left-4 w-3 h-3 text-[#F2C3B9]/80 animate-bounce"
              style={{ animationDelay: "0s" }}
            >
              <Heart className="w-full h-full fill-current" />
            </div>
            <div
              className="absolute -top-6 -right-2 w-2 h-2 text-sage/75 animate-bounce"
              style={{ animationDelay: "1s" }}
            >
              <Heart className="w-full h-full fill-current" />
            </div>
            <div
              className="absolute -top-10 left-1/2 w-2.5 h-2.5 text-peach-light/95 animate-bounce"
              style={{ animationDelay: "2s" }}
            >
              <Heart className="w-full h-full fill-current" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
