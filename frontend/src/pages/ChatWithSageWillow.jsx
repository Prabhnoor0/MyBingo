import { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Sparkles, Send, Heart, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const WELCOME_PROMPTS = [
  "How are you feeling today? 💙",
  "I've been feeling anxious lately...",
  "I need some motivation to start my day.",
  "Tell me something calming.",
]

export default function ChatWithSageWillow() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.chat.getHistory();
        if (mounted && res && res.messages) {
          setMessages(res.messages || []);
          scrollToBottom();
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
  };

  const send = async (text = input.trim()) => {
    if (!text) return;
    const optimistic = [...messages, { sender: "user", text }];
    setMessages(optimistic);
    setInput("");
    scrollToBottom();
    setLoading(true);
    try {
      const res = await api.chat.sendMessage(text);
      const replyText = res && (res.reply || res.data && res.data.reply) || "Sorry, I couldn't respond.";
      setMessages(prev => [...prev, { sender: "welly", text: replyText }]);
      scrollToBottom();
    } catch (err) {
      console.error("chat send error:", err);
      setMessages(prev => [...prev, { sender: "welly", text: "Sorry — something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="min-h-screen bg-[#F0EEEA] flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-6 lg:px-12 backdrop-blur-md bg-white/40 border-b border-white/20 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-sage to-sage-light rounded-full flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <Link to="/" className="text-xl font-bold text-sage-dark">SageWillow</Link>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {[['/', 'Home'], ['/journaling', 'Journal'], ['/habits', 'Habits'], ['/gratitude', 'Gratitude'], ['/breathing', 'Meditation'], ['/memory', 'Memory']].map(([path, label]) => (
            <Link key={path} to={path} className="text-sage-dark hover:text-sage transition-colors text-sm font-semibold">{label}</Link>
          ))}
        </div>
      </nav>

      {/* Main — flex column to fill screen */}
      <div className="flex-1 flex flex-col pt-20 pb-4 px-4 max-w-3xl mx-auto w-full">
        {/* Page Header */}
        <div className="text-center py-6 space-y-2">
          <div className="w-14 h-14 bg-gradient-to-br from-sage to-sage-light rounded-full flex items-center justify-center mx-auto shadow-md">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-light text-slate-800 mt-2">
            Chat with <span className="font-semibold text-sage-dark">SageWillow</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your compassionate AI companion — here to listen, support, and guide.
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col glass-panel rounded-3xl border border-white/35 shadow-sm overflow-hidden">
          {/* Messages window */}
          <div
            className="flex-1 overflow-y-auto p-5 space-y-3"
            style={{ maxHeight: 'calc(100vh - 340px)', minHeight: '300px' }}
          >
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-4">
                <Heart className="w-12 h-12 text-peach mx-auto animate-pulse-slow" />
                <div>
                  <h3 className="text-sm font-bold text-sage-dark">Welcome to your safe space</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Share what's on your mind. SageWillow listens without judgment.
                  </p>
                </div>
                {/* Suggestion chips */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {WELCOME_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => send(p)}
                      className="text-[10px] font-semibold text-sage-dark bg-sage-light/40 hover:bg-sage-light/70 border border-sage/20 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex items-end gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'welly' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sage to-sage-light flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-sage text-white rounded-br-sm'
                    : 'bg-white/80 text-slate-700 rounded-bl-sm border border-white/30'
                }`}>
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-peach/60 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-sage-dark border border-peach/30">
                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sage to-sage-light flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white/80 border border-white/30 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex items-center gap-1.5">
                    {[0, 150, 300].map((delay, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-sage rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Divider */}
          <div className="border-t border-white/30" />

          {/* Input area */}
          <div className="p-4 bg-white/30">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Share what's on your mind… (Enter to send)"
                  className="w-full px-4 py-3 rounded-2xl border border-sage/20 bg-white/80 backdrop-blur-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage/30 text-sm text-slate-700 placeholder-slate-400"
                  rows={2}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-1 px-1">
                  <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    SageWillow listens with compassion
                  </span>
                  <span className={`text-[9px] font-medium ${input.length > 900 ? 'text-red-400' : 'text-slate-300'}`}>
                    {input.length}/1000
                  </span>
                </div>
              </div>
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="w-11 h-11 bg-sage hover:bg-sage-dark disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 mt-4">
          Your conversations are private and secure. 🔒
        </p>
      </div>
    </div>
  );
}