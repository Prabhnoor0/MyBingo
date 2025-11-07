
const Chat = require('../models/chat');
const { GoogleGenAI } = require('@google/genai'); 

// init client (if GEMINI_API_KEY is set it will be used; SDK also supports other auth modes)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || undefined
});

// System prompt to steer SageWillow's persona
const SYSTEM_PROMPT = `
You are SageWillow — a warm, empathetic, non-judgmental best friend. 
Always respond with kindness, short supportive sentences, and encouragement.
You are not a medical or legal professional. If the user asks for medical or legal advice, suggest they consult a professional.
If the user expresses immediate danger or suicidal intent, encourage them to contact emergency services and a trained professional, and mention that you can't help in emergencies.
Keep replies friendly, brief, and focused on listening and emotional support.
`.trim();

// Basic crisis pattern (very simple, not a replacement for proper triage)
const CRISIS_RX = /\b(suicide|kill myself|kill myself|end my life|hurt myself|self[- ]?harm|want to die)\b/i;

const MAX_HISTORY_MESSAGES = 12; // how many past messages to send as context

// POST /api/chat  (authenticated)
const sendMessage = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { message } = req.body;
    if (!message || typeof message !== 'string') return res.status(400).json({ message: 'Invalid message' });

    // quick crisis check: if flagged, return safe static response and save it
    if (CRISIS_RX.test(message)) {
      const crisisReply = `I'm really sorry you're feeling this way. I can't handle emergencies — if you're in immediate danger, please contact your local emergency services or a trusted person right now. If you're able, consider reaching out to a crisis hotline or a mental health professional. If you want, I can help find resources or someone to contact.`;
      // Save conversation
      let chat = await Chat.findOne({ user: userId });
      if (!chat) chat = new Chat({ user: userId, messages: [] });
      chat.messages.push({ sender: 'user', text: message });
      chat.messages.push({ sender: 'welly', text: crisisReply });
      await chat.save();
      return res.json({ reply: crisisReply, flagged: true });
    }

    // Fetch or create chat document
    let chat = await Chat.findOne({ user: userId });
    if (!chat) {
      chat = new Chat({ user: userId, messages: [] });
    }

    // Append user's message and save (optimistic)
    chat.messages.push({ sender: 'user', text: message });
    await chat.save();

    // build short history (last N messages) to pass to LLM
    const history = chat.messages.slice(-MAX_HISTORY_MESSAGES);
    // format as a single prompt (system instruction + conversation)
    const historyText = history
      .map(m => (m.sender === 'user' ? `User: ${m.text}` : `SageWillow: ${m.text}`))
      .join('\n');

    const prompt = `${SYSTEM_PROMPT}\n\nConversation so far:\n${historyText}\nUser: ${message}\nSageWillow:`;

    // call Gemini via SDK
    const modelToUse = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      // you can add config here (e.g. candidateCount, thinking config) if needed
    });

    // extract text from response (SDK returns .text or candidates)
    const replyText = (response && (response.text || (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text))) || "Sorry — I'm having trouble responding right now.";

    // Save assistant reply
    chat.messages.push({ sender: 'welly', text: replyText });
    await chat.save();

    return res.json({ reply: replyText, flagged: false });
  } catch (err) {
    console.error('chatController.sendMessage error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/chat  (authenticated) -> returns the user's chat messages (recent first)
const getHistory = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const chat = await Chat.findOne({ user: userId }).lean();
    if (!chat) return res.json({ messages: [] });

    return res.json({ messages: chat.messages || [] });
  } catch (err) {
    console.error('chatController.getHistory error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendMessage, getHistory };
